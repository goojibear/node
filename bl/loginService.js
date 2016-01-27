LoginService = function(collectionService) {
  this.collectionService = collectionService;
};

LoginService.prototype.login = function(req, res){
    var filter = {};
    filter["$where"] = "this.userName == '" + req.body.username + "' && this.password == '" + req.body.password + "'";
	this.collectionService.getArrayByFilter('users', filter, function(data) {
        if (!data) {
            res.status(400).send({success: false, message: 'could not find data for filter: ' + req.body.toString()});
        }
        else {
            if(data.length == 1){
                res.status(200).send({success: true, user: data});
            } else {
                res.status(200).send({success: false, message: "Username or Password incorrect."});
            }
        }
   	});
};

exports.LoginService = LoginService;