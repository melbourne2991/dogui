(function() {

'use strict';

angular.module('Dogui', [
	'ngAnimate',
	'ui.router',	
	'ui.ace',
	'Dogui.controllers',
	'Dogui.directives',
	'Dogui.services',
	'Dogui.filters'
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
			templateUrl: './views/dashboard.html',
			controller: 'connectedController',
			abstract: true
		})
		.state('connected.containers', {
			url: '',
			templateUrl: './views/dashboard.containers.html',
			controller: 'containersController',
			params: {
				dockerDaemon: {},
				connection: {}
			}
		})
		.state('connected.images', {
			url: '/dashboard/images',
			templateUrl: './views/dashboard.images.html',
			controller: 'imagesController'
		})
		.state('connected.dockerfiles', {
			url: '/dashboard/dockerfiles',
			templateUrl: './views/dashboard.dockerfiles.html',
			controller: 'dockerfilesController'
		})
		.state('connected.dockerfilesNew', {
			url: '/dashboard/dockerfiles/new',
			templateUrl: './views/dashboard.dockerfiles.new.html',
			controller: 'dockerfilesNewController'
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

		$scope.connectToConnection = function(connection) {
			DockerConn.current.connection = connection;
			DockerConn.current.daemon = connection.init();

			$state.go('connected.containers');
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

			dockerConn.save(function(savedConnection) {
				$state.go('connections.list');
			});
		};
	}])
	.controller('connectionsEditController', ['$scope', '$state', 'DockerConn', function($scope, $state, DockerConn) {
		$scope.$emit('tabChange', $state.current.name);
		$scope.newConnection = $state.params.connection;

		if(!$scope.newConnection) return $state.go('connections.list');

		$scope.saveConnection = function(connection) {
			connection.save(function(savedConnection) {
				$state.go('connections.list');
			});
		};
	}])
	.controller('connectedController', ['$scope', '$state', function($scope, $state) {
		$scope.$on('connectedTo', function(event, data) {
			$scope.connection = data;
		});
	}])
	.controller('containersController', ['$scope', '$state', 'DockerConn', function($scope, $state, DockerConn) {
		if(!DockerConn.current.connection || !DockerConn.current.daemon) return $state.go('connections.list');

		$scope.$emit('connectedTo', DockerConn.current.connection);

		var dockerDaemon = 	DockerConn.current.daemon;

		dockerDaemon.listContainers({all: true}, function(err, containerListings) {
			$scope.inactiveContainers = _.map(containerListings, function(containerListing, i) {
				return {
					meta: containerListing,
					containerInstance: dockerDaemon.getContainer(containerListing.Id)						
				};
			});

			$scope.$digest();
		});

		$scope.removeContainer = function(container) {
			var containerInstance = container.containerInstance;
			containerInstance.remove(function(err, data) {
				if(!err) {
					// var inactiveContainerResult = _.find($scope.inactiveContainers, function(obj, i) {
					// 	if(obj.Id === container.Id) {
					// 		return true;
					// 	}
					// });
				}
			});
		};

		$scope.startContainer = function(container) {
			var containerInstance = container.containerInstance;

			containerInstance.start(function(err, data) {
				console.log(err);
				console.log(data);
			});
		};
	}])
	.controller('imagesController', ['$scope', '$state', 'DockerConn', function($scope, $state, DockerConn) {
		if(!DockerConn.current.connection || !DockerConn.current.daemon) return $state.go('connections.list');

		var dockerDaemon = DockerConn.current.daemon;

		dockerDaemon.listImages(function(err, data) {
			console.log(data);
			$scope.images = data;
			$scope.$digest();
		});
	}])
	.controller('dockerfilesController', ['$scope', '$state', 'DockerConn', function($scope, $state, DockerConn) {
		if(!DockerConn.current.connection || !DockerConn.current.daemon) return $state.go('connections.list');
	}])
	.controller('dockerfilesNewController', ['$scope', '$state', 'DockerConn', function($scope, $state, DockerConn) {
		if(!DockerConn.current.connection || !DockerConn.current.daemon) return $state.go('connections.list');

		$scope.dockerfile = {
			name: '',
			body: ''
		};

		$scope.saveDockerfile = function() {
			console.log($scope.dockerfile);
		};
	}]);
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

angular.module('Dogui.filters', [])
	.filter('dockerDate', function() {
		return function(input) {
			return input;
		};
	})
	.filter('repoTags', function() {
		return function(input, repoOrTag) {
			var split = input.toString().split(':');
			return repoOrTag === 'tag' ? split[1] : split[0];
		};
	})
	.filter('shortImageId', function() {
		return function(input) {
			return input.toString().slice(0, 12);
		};
	})
	.filter('toGigs', function() {
		return function(input) {
			return Math.round((parseInt(input, 10) / 1000000000) * 1000)/1000 + ' GB';
		};
	});
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

				console.log(fileContents);

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
		var Dockerfile = function() {
			this.id = null;
			this.name = null;
			this.body = null;
		};
	}]);
}());



