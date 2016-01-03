QueryService = function(collectionService) {
  this.collectionService = collectionService;
};

QueryService.prototype.getAll = function(collection, req, res){
	this.collectionService.findAll(collection, function(error, objs) {
		if (error) { 
			res.status(400).send(error); 
		}
		else { 
			res.status(200).send(objs);
		}
   	});
};

QueryService.prototype.getData = function(req, res){	
	this.collectionService.getByFilter(req.params.collection, req.body, function(data) {
		var resData = [];
		
	    data.each(function(err, doc) {
	      if (doc != null) {
	         resData.push(doc);
	      } else {	      	
	      	if (!resData) { 
				res.status(400).send({message: 'could not find data for filter: ' + req.body.toString()}); 
			}
			else { 
				res.status(200).send(resData);
			}
	      }
	    });
		
   	});
};

exports.QueryService = QueryService;