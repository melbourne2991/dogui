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
						console.log(err);
						console.log(data);
					});

					data = db.dockerfiles.save({
						name: this.name,
						filePath: this.filePath
					});

					this._id = data._id;			
				} else {
					fs.writeFile(this.filePath,  this.body, function(err, data) {
						console.log(err);
						console.log(data);
					});

					data = db.dockerfiles.update({_id: this._id}, {
						name: this.name,
						filePath: this.filePath
					}, {upsert: true});	
				}	
			},
			loadContent: function(cb) {
				fs.readFile(this.filePath, {encoding: 'utf8'}, function(err, data) {
					return cb(err, data);
				});
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
				dv.loadCollections(['dockerfiles']);
				var data = _.map(db.dockerfiles.find(), function(obj) {
					return new Dockerfile(obj);
				});

				return cb(data);
			}
		};
	}]);
}());



