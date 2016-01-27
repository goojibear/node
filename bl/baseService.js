BaseService = function(collectionService) {
  this.collectionService = collectionService;
};

BaseService.prototype.get = function(collection, entity, req, res){
	this.collectionService.get(collection, entity, function(error, objs) {
	    if (error) { 
			res.status(400).send(error); 
		}
		else { 
			res.status(200).send(objs);
		}
	});
};

BaseService.prototype.getAll = function(collection, req, res){
	var query = (Object.keys(req.query).length > 0) ? req.query : null;
	this.collectionService.findAll(collection, function(error, objs) {
		if (error) { 
			res.status(400).send(error); 
		}
		else { 
			res.status(200).send(objs);
		}
   	}, query);
};

BaseService.prototype.save = function(collection, object, entity, req, res){
	if(!entity){
	    object.utcTimestampServer = Date.parse(new Date());
		this.collectionService.save(collection, object, function(err,docs) {
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

BaseService.prototype.delete = function(collection, entity, req, res){
	this.collectionService.delete(collection, entity, function(error, objs) {
	if (error) { 
			res.status(400).send(error); 
		}
		else { 
			res.status(200).send(objs);
		}
	});
}

exports.BaseService = BaseService;