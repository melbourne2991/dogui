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
			
		};
	}]);
}());
