var ObjectID = require('mongodb').ObjectID;

CollectionService = function(db) {
  this.db = db;
};

CollectionService.prototype.getCollection = function(collectionName, callback) {
  this.db.collection(collectionName, function(error, the_collection) {
    if( error ) callback(error);
    else callback(null, the_collection);
  });
};

CollectionService.prototype.findAll = function(collectionName, callback) {
    this.getCollection(collectionName, function(error, the_collection) { //A
      if( error ) callback(error);
      else {		  
		the_collection.find().toArray(function(error, results) { //B
		  if( error ) callback(error);
		  else callback(null, results);
		});   
      }
    });
};

CollectionService.prototype.queryAll = function(collectionName, query, callback) {
    this.getCollection(collectionName, function(error, the_collection) { //A
      if( error ) callback(error);
      else {         
        the_collection.find(query).toArray(function(error, results) { //B
          if( error ) callback(error);
          else callback(null, results);
        });
      }
    });
};

CollectionService.prototype.get = function(collectionName, id, callback) { //A
    this.getCollection(collectionName, function(error, the_collection) {
        if (error) callback(error);
        else {
            var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$"); //B
            if (!checkForHexRegExp.test(id)) callback({error: "invalid id"});
            else the_collection.findOne({'_id':ObjectID(id)}, function(error,doc) { //C
                if (error) callback(error);
                else callback(null, doc);
            });
        }
    });
};

CollectionService.prototype.save = function(collectionName, obj, callback) {
    this.getCollection(collectionName, function(error, the_collection) { //A
      if(error) callback(error)
      else {
        obj.created_at = new Date(); //B
        the_collection.insert(obj, function() { //C
          callback(null, obj);
        });
      }
    });
};

CollectionService.prototype.update = function(collectionName, obj, entityId, callback) {
    this.getCollection(collectionName, function(error, the_collection) {
        if (error) callback(error);
        else {
            obj._id = ObjectID(entityId); //A convert to a real obj id
            obj.updated_at = new Date(); //B
            the_collection.save(obj, function(error,doc) { //C
                if (error) callback(error);
                else callback(null, obj);
            });
        }
    });
};

CollectionService.prototype.delete = function(collectionName, entityId, callback) {
    this.getCollection(collectionName, function(error, the_collection) { //A
        if (error) callback(error);
        else {
            the_collection.remove({'_id':ObjectID(entityId)}, function(error,doc) { //B
                if (error) callback(error);
                else callback(null, doc);
            });
        }
    });
};

CollectionService.prototype.getByFilter = function(collectionName, filter, callback) {
	var data = this.db.collection(collectionName).find(filter);
    callback(data);
};


CollectionService.prototype.getArrayByFilter = function(collectionName, filter, callback) {
	this.getCollection(collectionName, function(error, the_collection) { //A
      if( error ) callback(error);
      else {
		the_collection.find(filter).toArray(function(error, results) { //B
		  if( error ) callback(error);
		  else callback(results);
		});
      }
    });
};

exports.CollectionService = CollectionService;