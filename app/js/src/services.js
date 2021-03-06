(function() {

'use strict';

var Dockerode = require('dockerode'),
	fs = require('fs'),
	crypto = require('crypto'),
	diskDb = require('diskdb'),
	path = require('path'),
	_ = require('lodash'),
	genHash = function() {
		return crypto.randomBytes(20).toString('hex');
	};

angular.module('Dogui.services', [])
	.service('ErrorHandler', ['$http', function($http) {
		var ErrorHandler = function($scope) {
			this.$scope = $scope;
			this.$scope.errors = [];
			this.errors = $http.get('./config/errors.json');
		};

		var Err = function(id, detail, handler) {
			this.handler = handler;
			this.detail = detail;

			var errorLocation = id.split(' ');

			handler.errors.then(function(results) {
				var json = results.data,
					errCat = json[errorLocation[0]];

				if(!errCat) {
					return console.log('Error at "' + errorLocation[0] + ' ' + errorLocation[1] + '"" does not exist');
				}

				var theError = json[errorLocation[0]][errorLocation[1]];

				if(!theError) {
					return console.log('Error at "' + errorLocation[0] + ' ' + errorLocation[1] + '" does not exist');
				}

				this.err = theError;
			}.bind(this));

			this.scopeRef = handler.$scope.errors.push(this);
		};

		Err.prototype.remove = function() {
			this.handler.$scope.errors.splice(this.handler.$scope.errors.indexOf(this.scopeRef), 1);
		};

		ErrorHandler.prototype.newError = function(id, detail) {
			if(!detail) detail = null;
			return new Err(id, detail, this);
		};

		return {
			new: function($scope) {
				return new ErrorHandler($scope);
			}
		};
	}])
	.service('fs', [function() {
		return fs;
	}])
	.service('db', [function() {
		return diskDb.connect('./data');
	}])
	.service('DockerConn', ['db', function(db) {
		var DockerConn = function(opts) {
			opts = opts || {};
			opts.config = opts.config || {};

			this.name = opts.name || 'New Connection';
			this._id = opts._id || null;
			this.config = {
				host: opts.config.host || '192.168.59.103',
				protocol: opts.config.protocol || 'https',
				port: opts.config.port || 2376,
				cert: opts.config.cert || null,
				ca: opts.config.ca || null,
				key: opts.config.key || null
			};
		};

		DockerConn.prototype =	{
			init: function() {
				var fileContents = {
					cert: null,
					ca: null,
					key: null
				};

				_.forOwn({
					cert: this.config.cert, 
					ca: this.config.ca, 
					key: this.config.key 
				}, function(val, key) {
					if(val && val.trim !== '') {
						fileContents[key] = fs.readFileSync(val, {encoding: 'utf8'});
					}
				});

				return new Dockerode({
					host: this.config.host,
					protocol: this.config.protocol,
					port: this.config.port,
					cert: fileContents.cert,
					ca: fileContents.ca,
					key: fileContents.key
				});
			},
			save: function(cb) {
				var data;
				db.loadCollections(['dockerConnections']);

				if(!this._id) {
					data = db.dockerConnections.save({
						name: this.name,
						config: this.config
					});

					this._id = data._id;			
				} else {
					data = db.dockerConnections.update({_id: this._id}, {
						name: this.name,
						config: this.config
					}, {upsert: true});	
				}

				return cb(data);
			}
		};

		return 	{
			new: function(opts) {
				return new DockerConn(opts);
			},
			find: function(id, cb) {
				db.loadCollections(['dockerConnections']);
				var data = new DockerConn(db.dockerConnections.find({_id: id}));

				return cb(data);
			},
			findAll: function(cb) {
				db.loadCollections(['dockerConnections']);

				var data = _.map(db.dockerConnections.find(), function(obj) {
					return new DockerConn(obj);
				});

				return cb(data);
			},
			validate: function(connection) {
				return new Validator();
			},
			defaults: {
				name: 'New Connection',
				config: {
					host: '192.168.59.103',
					protocol: 'https',
					port: '2376',
					cert: '/Users/arkade/.boot2docker/certs/boot2docker-vm/cert.pem',
					ca: '/Users/arkade/.boot2docker/certs/boot2docker-vm/ca.pem',
					key: '/Users/arkade/.boot2docker/certs/boot2docker-vm/key.pem'
				}
			},
			current: {
				daemon: null,
				connection: null
			}
		};
	}])
	.service('Dockerfile', ['db', function(db) {
		var Dockerfile = function(opts) {
			opts = opts || {};
			this._id = opts._id || null;
			this.name = opts.name || null;
			this.filePath = opts.filePath || genHash();
		};

		Dockerfile.prototype = {
			save: function(cb) {
				var data;

				db.loadCollections(['dockerfiles']);

				if(!this._id) {
					fs.writeFile('./dockerfiles/' + this.filePath,  this.body, function(err, data) {
						if(typeof cb === 'function') cb();
					});

					data = db.dockerfiles.save({
						name: this.name,
						created: new Date(),
						updated: new Date(),
						filePath: this.filePath
					});

					this._id = data._id;			
				} else {
					fs.writeFile(this.filePath,  this.body, function(err, data) {
						if(typeof cb === 'function') cb();
					});

					data = db.dockerfiles.update({_id: this._id}, {
						name: this.name,
						updated: new Date(),
						filePath: this.filePath
					}, {upsert: true});	
				}	
			},
			remove: function(cb) {
				db.loadCollections(['dockerfiles']);
				db.dockerfiles.remove({_id: this._id});

				var data = this;

				cb(data);
			},
			loadContent: function(cb) {
				fs.readFile('./dockerfiles/' + this.filePath, {encoding: 'utf8'}, function(err, data) {
					this.body = data;
					return cb(err, data);
				}.bind(this));
			}
		};

		return {
			new: function() {
				return new Dockerfile();
			},
			find: function(id, cb) {
				db.loadCollections(['dockerfiles']);
				var data = new Dockerfile(db.dockerfiles.find({_id: id}));

				return cb(data);
			},
			findAll: function(cb) {
				db.loadCollections(['dockerfiles']);
				var data = _.map(db.dockerfiles.find(), function(obj) {
					return new Dockerfile(obj);
				});

				return cb(data);
			}
		};
	}]);
}());



