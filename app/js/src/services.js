(function() {

'use strict';

var Dockerode = require('dockerode'),
	fs = require('fs'),
	crypto = require('crypto'),
	diskDb = require('diskdb'),
	path = require('path'),
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
				cert: opts.config.cert || '/Users/arkade/.boot2docker/certs/boot2docker-vm/cert.pem',
				ca: opts.config.ca || '/Users/arkade/.boot2docker/certs/boot2docker-vm/ca.pem',
				key: opts.config.key || '/Users/arkade/.boot2docker/certs/boot2docker-vm/key.pem'
			};
		};

		DockerConn.prototype =	{
			init: function() {
				var cert = fs.readFileSync(this.config.cert, {encoding: 'utf8'}),
					ca = fs.readFileSync(this.config.ca, {encoding: 'utf8'}),
					key = fs.readFileSync(this.config.key, {encoding: 'utf8'});

				return new Dockerode({
					host: this.config.host,
					protocol: this.config.protocol,
					port: this.config.port,
					cert: cert,
					ca: ca,
					key: key
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
					console.log('in else');
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
					port: '',
					cert: '',
					ca: '',
					key: ''
				}
			}
		};
	}]);

	
}());



