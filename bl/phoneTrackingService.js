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
		self.collectionService.save(collection, object, function(err,docs) {
			try{
				self.getByUtc('clickTracking', docs);
			} catch(err) {
				console.log('getByUtc exception', err);
			}
			sendResponse(res, err, docs);		  
		});
	} else {
		sendResponse(res, null, {});
	/*
		this.collectionService.update(collection, object, entity, function(err, docs) {
          sendResponse(res, err, docs);
		});
	*/
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
	var postBackDetected = false;
	var utc = parseInt(webhook.callStartTimeUTC) - 30000;
	var filter = {
		"utcTimestamp": { "$gt": utc },
		"campaignId": parseInt(webhook.campaignId),
		"publisherId": parseInt(webhook.publisherId)
	};

	self.collectionService.getByFilter(collectionName, filter, function(data) {
	    data.each(function(err, doc) {
           if (doc != null) {
                postBackDetected = true;
                var obj = {
                    title: 'Postback from ' + webhook.campaign + ' by ' + webhook.publisher,
                    isConverted: webhook.isConverted,
                    clickId: doc.clickId,
                    utcTimestamp: doc.utcTimestamp
                };

                self.collectionService.save('postBacks', obj, function(err,docs){});
            }
	    });

		if(!postBackDetected){
		    self.collectionService.save('noPostBacks', webhook, function(err,docs){});
		}
   	});
}

exports.PhoneTrackingService = PhoneTrackingService;