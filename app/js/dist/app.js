(function() {

'use strict';

angular.module('Dogui', [
	'ngAnimate',
	'ui.bootstrap',
	'ui.router',	
	'Dogui.controllers',
	'Dogui.directives',
	'Dogui.services'
]).config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
	$stateProvider
		.state('connections', {
			url: '/',
			templateUrl: './views/connections.html',
			controller: 'connectionsController',
			abstract: true
		})
		.state('connections.list', {
			url: '',
			templateUrl: './views/connections.list.html',
			controller: 'connectionsListController'
		})
		.state('connections.new', {
			url: 'new',
			templateUrl: './views/connections.new.html',
			controller: 'connectionsNewController'
		})
		.state('connections.edit', {
			url: 'edit',
			templateUrl: './views/connections.edit.html',
			controller: 'connectionsEditController',
			params: {
				connection: {}
			}
		})
		.state('connected', {
			url: '/dashboard',
			templateUrl: './views/main.html',
			abstract: true
		})
		.state('connected.dashboard', {
			url: '',
			templateUrl: './views/dashboard.html',
			controller: 'dashboardController'
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
	.controller('mainController', ['$scope', '$timeout', function($scope, $timeout) {
		var result = _.every([true, true, true], function(val) { return val; });
		console.log(result);
	}])
	.controller('connectionsController', ['$scope', '$state', '$timeout', function($scope, $state, $timeout) {
		$scope.$on('tabChange', function(event, data) {
			$scope.currentTab = data;
		});
	}])
	.controller('connectionsListController', ['$scope', '$state', 'DockerConn', function($scope, $state, DockerConn) {
		$scope.$emit('tabChange', $state.current.name);

		$scope.editConnection = function(connection) {
			$state.go('connections.edit', {connection: connection}, {});
		};

		DockerConn.findAll(function(connections, err) {
			$scope.dockerConnections = connections;
		});	
	}])
	.controller('connectionsNewController', ['$scope', '$state', 'DockerConn', function($scope, $state, DockerConn) {
		$scope.$emit('tabChange', $state.current.name);

		$scope.newConnection = DockerConn.defaults;

		$scope.saveConnection = function() {
			var dockerConn = DockerConn.new($scope.newConnection);

			dockerConn.save(function(connection) {
				$state.go('connections.list');
			});
		};
	}])
	.controller('connectionsEditController', ['$scope', '$state', 'DockerConn', function($scope, $state, DockerConn) {
		$scope.newConnection = $state.params.connection;

		if(!$scope.newConnection) return $state.go('connections.list');

		$scope.saveConnection = function() {
			//update here
			$state.go('connections.list');
		};
	}])
	.controller('dashboardController', function() {

	});
}());

(function() {

'use strict';

angular.module('Dogui.directives', [])
	.directive('showAddConnection', ['$timeout', function($timeout) {
		return {
			scope: {
				showAddConnection: '='
			},
			link: function(scope, element, attrs) {
			}
		};
	}]);

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
			save: function(cb) {
				db.loadCollections(['dockerConnections']);

				var data = db.dockerConnections.save({
					name: this.name,
					config: this.config
				});

				return cb(data);
			}
		};

		return 	{
			new: function(opts) {
				return new DockerConn(opts);
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



