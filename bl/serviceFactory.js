ServiceFactory = function(BaseService, collectionService) {
  this.BaseService = BaseService;
  this.collectionService = collectionService;
};

ServiceFactory.prototype.createService = function(){
    return new BaseService(this.collectionService);
};

exports.ServiceFactory = ServiceFactory;