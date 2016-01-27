PhoneTrackingService = function(collectionService) {
  this.collectionService = collectionService;
};

PhoneTrackingService.prototype.get = function(collection, entity, req, res){
	this.collectionService.get(collection, entity, function(error, objs) {
	    if (error) { 
			res.status(400).send(error); 
		}
		else { 
			res.status(200).send(objs);
		}
	});
};

PhoneTrackingService.prototype.getAll = function(collection, req, res){
	this.collectionService.findAll(collection, function(error, objs) {
		if (error) { 
			res.status(400).send(error); 
		}
		else { 
			res.status(200).send(objs);
		}
   	});
};

PhoneTrackingService.prototype.save = function(collection, object, entity, req, res){
	var self = this;
	if(!entity){
	    if(object.phoneNumber){
	        var parts = object.phoneNumber.toString().split('s');
	        object.phoneNumber = parts[0];
	        object.phoneNumberPoolRef = (parts.length === 2) ? parts[1] : '';
	    }
		self.collectionService.save(collection, object, function(err,docs) {
		    self.collectionService.save('logs', {text: 'webhook saved', data: object}, function(err,docs){});
			try{
				self.getByUtc('clickTracking', docs);
			} catch(err) {
				self.collectionService.save('logs', {text: 'getByUtc exception', data: err}, function(err,docs){});
			}
			sendResponse(res, err, docs);		  
		});
	} else {
		this.collectionService.update(collection, object, entity, function(err, docs) {
          sendResponse(res, err, docs);
        });
	}	
	
	function sendResponse(res, err, docs){
		if (err) { 
			res.status(400).send(error); 
		}
		else { 
			res.status(200).send(docs);
		}
	}
};

PhoneTrackingService.prototype.delete = function(collection, entity, req, res){
res.status(200).send({});
/*
	this.collectionService.delete(collection, entity, function(error, objs) {
	if (error) { 
			res.status(400).send(error); 
		}
		else { 
			res.status(200).send(objs);
		}
	});
*/
}

PhoneTrackingService.prototype.getByUtc = function(collectionName, webhook){
	var self = this;
	var ignorePublishers = [273624, 268890, 268319, 275080, 274869];
	var ignoreCampaigns = [200407,197942];
	var isPublisherIgnore = ignorePublishers.indexOf(parseInt(webhook.publisherId)) != -1;
    var isCampaignIgnore = ignoreCampaigns.indexOf(parseInt(webhook.campaignId)) != -1;

	if(!isPublisherIgnore && !isCampaignIgnore){
        getByTimeSpan(webhook, true);
   	}

   	function getByTimeSpan(webhook, checkByTimeSpan){
        var filterCondition = "";
        if(checkByTimeSpan){
            var utcFrom = webhook.utcTimestamp - 120000;
            var utcTo = webhook.utcTimestamp + 15000;
            filterCondition += 'this.publisherId == ' + webhook.publisherId;
            filterCondition += ' && this.campaignId == ' + webhook.campaignId;
            filterCondition += ' && this.utcTimestamp >= ' + utcFrom;
            filterCondition += ' && this.utcTimestamp <= ' + utcTo;
        } else {
            filterCondition += "this.clickId == '" + webhook.clickId + "'";
        }
        var filter = { "$where" : filterCondition };

        self.collectionService.getArrayByFilter(collectionName, filter, function(data) {
            var falsePositiveCounter = 0;
            var postBackDetected = false;
            var validPostBacks = [];

            var allClosest = 0;
            var allClosestItem;
            data.forEach(function(doc) {
                var temp = webhook.utcTimestamp - doc.utcTimestamp;
                temp = (temp < 0) ? temp * -1 : temp;
                if(allClosest == 0 || temp > 0 && temp < allClosest){
                    allClosest = temp;
                    allClosestItem = doc;
                }

                if(doc && doc.clickId == webhook.clickId){
                    validPostBacks.push(doc);
                } else {
                    falsePositiveCounter += 1;
                }
            });


            var duplicateClickIds = validPostBacks.length - 1;
            var closest = 0;
            var closestItem;
            validPostBacks.forEach(function(item){
                var temp = webhook.utcTimestamp - item.utcTimestamp;
                temp = (temp < 0) ? temp * -1 : temp;
                if(closest == 0 || temp > 0 && temp < closest){
                    closest = temp;
                    closestItem = item;
                }
            });

            if (closestItem != null) {
                postBackDetected = true;

                var obj = {
                    title: 'Postback from ' + webhook.campaign + ' by ' + webhook.publisher,
                    isConverted: webhook.isConverted,
                    clickId: closestItem.clickId,
                    callClickId: webhook.clickId,
                    utcTimestamp_click: closestItem.utcTimestamp,
                    utcTimestamp_call: webhook.utcTimestamp,
                    utcTimestampDiff: webhook.utcTimestamp - closestItem.utcTimestamp,
                    isClosestTrue: closestItem._id == allClosestItem._id,
                    closestItemId: closestItem._id,
                    allClosestItemId: allClosestItem._id,
                    isByTimeSpan: checkByTimeSpan,
                    falsePositives: falsePositiveCounter,
                    duplicateClickIds: duplicateClickIds
                };

                self.collectionService.save('postBacks', obj, function(err,docs){});
            }


            if(postBackDetected === false){
                if(checkByTimeSpan){
                    getByTimeSpan(webhook, false);
                } else {
                    self.collectionService.save('noPostBacks', webhook, function(err,docs){});
                }
            }
        });
   	}
}

exports.PhoneTrackingService = PhoneTrackingService;