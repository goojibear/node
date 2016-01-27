var http = require('http'),
    express = require('express'),
    cors = require('cors'),
	bodyParser = require('body-parser'),
	BaseService = require(__dirname + '/bl/baseService').BaseService,
    ServiceFactory = require(__dirname + '/bl/serviceFactory').ServiceFactory;

//var env = 'test';
var env = 'prod';
var mongoHost = (env === 'test') ? '127.0.0.1' : '0.0.0.0';
var mongoPort = '27017'; 
var mongoDatabase = (env == 'prod') ? 'GoojiDB' : 'TestDB';	
var serviceEnum = {
	phoneTrackingService: 'phoneTrackingService',
	genericService: 'genericService',
	queryService: 'queryService'
};
var serviceMap = {
	getService: function(serviceName){
		if(this[serviceName + 'Service']){
			return this[serviceName + 'Service'];
		} else {
			return this[serviceEnum.genericService];
		}
	}
};

MongoClient = require('mongodb').MongoClient
CollectionService = require(__dirname + '/dal/collectionService').CollectionService;
PhoneTrackingService = require(__dirname + '/bl/phoneTrackingService').PhoneTrackingService;
QueryService = require(__dirname + '/bl/queryService').QueryService;
LoginService = require(__dirname + '/bl/loginService').LoginService;

var app = express();
app.set('port', process.env.PORT || 3000);

app.use(cors());
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


 
var mongoClient = new MongoClient(mongoHost, mongoPort);
MongoClient.connect('mongodb://' + mongoHost + ':' + mongoPort + '/' + mongoDatabase, function(err, db) {
  if(err) console.log(err)
  // Initiate dal service
  var collectionService = new CollectionService(db);
  // Instentiate business logic services
  var serviceFactory = new ServiceFactory(BaseService, collectionService);

  // General services
  serviceMap[serviceEnum.genericService] = serviceFactory.createService();
  // Override services
  serviceMap[serviceEnum.phoneTrackingService] = new PhoneTrackingService(collectionService);
  serviceMap[serviceEnum.queryService] = new QueryService(collectionService);
  serviceMap[serviceEnum.loginService] = new LoginService(collectionService);
});

app.get('/users', function(req, res) {
	res.status(200).send({});
});

app.get('/users/:entity', function(req, res) {
	res.status(200).send({});
});

app.post('/users', function(req, res) {
	res.status(200).send({});
});

app.put('/users/:entity', function(req, res) {
	res.status(200).send({});
});

app.delete('/users/:entity', function(req, res) {
	res.status(200).send({});
});

app.post('/login', function(req, res) {
	serviceMap[serviceEnum.loginService].login(req, res);
});

app.get('/:collection', function(req, res) {
	serviceMap.getService(req.params.collection).getAll(req.params.collection, req, res);
});
 
app.get('/:collection/:entity', function(req, res) {
	serviceMap.getService(req.params.collection).get(req.params.collection, req.params.entity, req, res);
});

app.post('/:collection', function(req, res) {
	serviceMap.getService(req.params.collection).save(req.params.collection, req.body, null, req, res);
});

app.put('/:collection/:entity', function(req, res) {
	serviceMap.getService(req.params.collection).save(req.params.collection, req.body, req.params.entity, req, res);
});

app.delete('/:collection/:entity', function(req, res) { 
	serviceMap.getService(req.params.collection).delete(req.params.collection, req.params.entity, req, res);
});


app.post('/queryService/:collection', function(req, res) {	
	serviceMap[serviceEnum.queryService].getData(req, res);
});
 
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});