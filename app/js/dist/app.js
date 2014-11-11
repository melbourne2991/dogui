(function() {

'use strict';

angular.module('Dogui', [
	'Dogui.controllers',
	'Dogui.directives',
	'Dogui.services',
	'ui.bootstrap',
	'ui.router'
]).config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
	$stateProvider
		.state('connections', {
			url: '/',
			templateUrl: './views/dashboard.html',
			controller: 'connectionsController'
		});

	$urlRouterProvider.otherwise('/');
}]);

}());

// var Docker = require('dockerode'),
// 	fs = require('fs');


// docker = new Docker({
// 	host: '192.168.59.103',
// 	protocol: 'https',
// 	port: 2376,
// 	cert: fs.readFileSync('/Users/arkade/.boot2docker/certs/boot2docker-vm/cert.pem'),
// 	ca: fs.readFileSync('/Users/arkade/.boot2docker/certs/boot2docker-vm/ca.pem'),
// 	key: fs.readFileSync('/Users/arkade/.boot2docker/certs/boot2docker-vm/key.pem')
// });

// 	angular.m

(function() {

'use strict';

angular.module('Dogui.controllers', ['Dogui.services'])
	.controller('connectionsController', ['db', 'DockerConn', function(db, DockerConn) {
		DockerConn.findAll(function(data) {
			_.forEach(data, function(tt) {
				console.table(tt);
			});
		});


		// docker = docker.init();

		// docker.listContainers({
		// 	all: true
		// }, function(err, containers) {
		// 	console.log(containers);
		// });	

		// var docker = new Docker({
		// 	host: '192.168.59.103',
		// 	protocol: 'https',
		// 	port: 2376,
		// 	cert: fs.readFileSync('/Users/arkade/.boot2docker/certs/boot2docker-vm/cert.pem'),
		// 	ca: fs.readFileSync('/Users/arkade/.boot2docker/certs/boot2docker-vm/ca.pem'),
		// 	key: fs.readFileSync('/Users/arkade/.boot2docker/certs/boot2docker-vm/key.pem')
		// });

		// docker.listContainers({all: true}, function(err, containers) {
		// 	console.log(containers);
		// });		
	}]);
}());

(function() {

'use strict';

angular.module('Dogui.directives', []);

}());

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
			save: function() {
				db.loadCollections(['dockerConnections']);

				return db.dockerConnections.save({
					name: this.name,
					configs: this.config
				});
			},
			find: function(id, cb) {
				db.loadCollections(['dockerConnections']);
				var data = db.dockerConnections.find({_id: id});
				return cb(data);
			},
			findAll: function(cb) {
				db.loadCollections(['dockerConnections']);
				var data = db.dockerConnections.find();
				return cb(data);
			}
		};

		return new DockerConn();
	}]);

	
}());



