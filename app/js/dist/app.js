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
		})
		.state('connected.dockerfilesEdit', {
			url: '/dashboard/dockerfiles/edit',
			templateUrl: './views/dashboard.dockerfiles.new.html',
			controller: 'dockerfilesEditController',
			params: {
				dockerfile: {}
			}
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
	.controller('connectionsListController', ['$scope', '$state', 'DockerConn', 'ErrorHandler', function($scope, $state, DockerConn, ErrorHandler) {
		$scope.$emit('tabChange', $state.current.name);

		var errorHandler = ErrorHandler.new($scope);

		$scope.editConnection = function(connection) {
			$state.go('connections.edit', {connection: connection}, {});
		};

		$scope.loadingConnection = false;

		$scope.connectToConnection = function(connection, index) {
			DockerConn.current.connection = connection;
			DockerConn.current.daemon = connection.init();

			$scope.loadingConnection = index;

			DockerConn.current.daemon.info(function(err, data) {
				if(err) {
					$scope.loadingConnection = false;
					errorHandler.newError('connectionsError problemConnection');
					return;
				}

				return $state.go('connected.containers');
			});	
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
			$scope.images = data;
			$scope.$digest();
		});

		$scope.imageToPull = {
			repoTag: null
		};

		$scope.pullImage = function(repoTag) {
			if(typeof $scope.imageToPull.repoTag === 'string') {
				dockerDaemon.pull($scope.imageToPull.repoTag.trim(), function(err, stream) {
					if(err) console.log(err);

					$scope.pullImageStream = stream;
					$scope.$digest();
				});
			}
		};
	}])
	.controller('dockerfilesController', ['$scope', '$state', 'DockerConn', 'Dockerfile', function($scope, $state, DockerConn, Dockerfile) {
		if(!DockerConn.current.connection || !DockerConn.current.daemon) return $state.go('connections.list');

		Dockerfile.findAll(function(data) {
			$scope.dockerfiles = data;
		});

		$scope.confirmDelete = function(dockerfile) {
			dockerfile.remove(function() {
				$state.go($state.current, {}, {reload: true});
			});
		};

		$scope.editDockerfile = function(dockerfile) {
			$state.go('connected.dockerfilesEdit', {dockerfile: dockerfile});
		};
	}])
	.controller('dockerfilesNewController', ['$scope', '$state', 'DockerConn', 'Dockerfile', function($scope, $state, DockerConn, Dockerfile) {
		if(!DockerConn.current.connection || !DockerConn.current.daemon) return $state.go('connections.list');

		$scope.dockerfile = Dockerfile.new();

		$scope.saveDockerfile = function() {
			$scope.dockerfile.save();
			$state.go('connected.dockerfiles');
		};
	}])
	.controller('dockerfilesEditController', ['$scope', '$state', 'DockerConn', 'Dockerfile', function($scope, $state, DockerConn, Dockerfile) {
		if(!DockerConn.current.connection || !DockerConn.current.daemon) return $state.go('connections.list');
		if(!$state.params.dockerfile) throw new Error('Dockerfile param missing');

		$state.params.dockerfile.loadContent(function(err, data) {
			$scope.dockerfile = $state.params.dockerfile;
			$scope.$digest();
		});

		// $scope.dockerfile = Dockerfile.new();

		$scope.saveDockerfile = function() {
			$scope.dockerfile.save();
			$state.go('connected.dockerfiles');
		};
	}]);
}());

(function() {

'use strict';

angular.module('Dogui.directives', [])
	.directive('modaler', ['$timeout', function($timeout) {
		return {
			scope: {
				modalSelector: '=modaler',
				confirmFn: '&',
				cancelFn: '&',
				modalTitle: '@',
				modalBody: '@',
				modalConfirmText: '@',
				modalCancelText: '@'
			},
			link: function(scope, element, attrs) {
				var primaryModal = scope.modalSelector || $('#primaryModal'),
					confirmButton = primaryModal.find('.approve'),
					cancelButton = primaryModal.find('.deny'),
					modalTitle = scope.modalTitle || null,
					modalBody = scope.modalBody || null,
					modalConfirmText = scope.modalConfirmText || null,
					modalCancelText = scope.modalCancelText || null;

				// primaryModal.find('.header').text(modalTitle);
				// primaryModal.find('.content').text(modalBody);
				// primaryModal.find('.approve').text(modalConfirmText);
				// primaryModal.find('.deny').text(modalCancelText);

				primaryModal.modal('setting', {
					onApprove: function(e) {
						if(typeof scope.confirmFn === 'function') {
							var confirmed = scope.confirmFn();
							if(confirmed && typeof confirmed.then === 'function') {
								confirmed.then(function() {
									primaryModal.modal('hide');
								});
							} else {
								primaryModal.modal('hide');
							}
						} else {
							primaryModal.modal('hide');	
						}
					},
					onDeny: function(e) {
						if(typeof scope.cancelFn === 'function') {
							var cancelled = scope.cancelFn();
							if(cancelled && typeof cancelled.then === 'function') {
								confirmed.then(function() {
									primaryModal.modal('hide');
								});
							} else {
								primaryModal.modal('hide');
							}
						} else {
							primaryModal.modal('hide');
						}
					}
				});

				element.on('click', function(e) {
					e.preventDefault();
					primaryModal.modal('show');
				});
			}
		};
	}])
	.directive('pullDockerModal', ['$timeout', function($timeout) {
		return {
			link: function(scope, element, attrs) {
				var pullDockerModal = $('#pullDockerModal');

				element.on('click', function(e) {
					e.preventDefault();
					pullDockerModal.modal('show');
				});				
			}
		};
	}])
	.directive('scrollableTable', ['$timeout', function($timeout) {
		var template = '';

		template+=	'<div class="scrollable-table">';
		template+=		'<table class="ui table attached">';
		template+=			'<thead>';
		template+=			'</thead>';		
		template+=		'</table>';
		template+=		'<div>';
		template+=			'<table class="ui table bottom attached segment">';
		template+=				'<tbody>';
		template+=				'</tbody>';
		template+=			'</table>';
		template+=		'</div>';
		template+=	'</div>';

		return {
			transclude: true,
			replace: true,
			template: template,
			link: function(scope, element, attrs, ctrl, ngTransclude) {
				ngTransclude(scope, function(clone) {
					var thead = angular.element(clone).find('thead'),
						tbody = angular.element(clone).find('tbody');


				});
			}
		};
	}])
	.directive('errorMessage', [function() {
		var	template = '';

		template+= '<div class="ui message" ng-class="errorType">';
		template+= '<i class="close icon" ng-click="removeError()"></i>';
		template+= '<div class="header" ng-bind="errorObj.err[\'ui-title\']" ng-if="errorObj.err[\'ui-title\']"></div>';
		template+= '<p ng-bind="errorObj.err[\'ui-message\']"></p>';
		template+= '</div>';

		return {
			template: template,
			replace: true,
			scope: {
				errorObj: '=errorMessage'
			},
			link: function(scope, element, attrs, ctrl) {
				var errorTypes = {
					error: 'negative',
					warning: 'warning'
				};	

				scope.errorType = errorTypes[scope.errorObj.err.errorType];
				scope.removeError = function () {
					scope.errorObj.remove();
				};
			}
		};
	}])
	.directive('consoleOutput', [function() {
		var template = '';

		template+=	'<div class="console">';
		template+=		'<div class="console-output images">';
		template+=		'</div>';
		template+=		'<div class="clear-log" ng-click="clearLog()">Clear</div>';
		template+=	'</div>';

		return {
			replace: true,
			template: template,
			scope: {
				stream: '=consoleOutput'
			},
			link: function(scope, element, attrs, ctrl) {
				var output = angular.element(element.find('.console-output'));

				scope.clearLog = function() {
					console.log('in clearlog');
					output.html('');
				};

				scope.$watch('stream', function(n, o) {
					if(n && typeof n.on === 'function') {
						var stream = n;
						stream.on('data', function(data) {
							if(data) {
								var obj = JSON.parse(data.toString()),
									str = '<div class="output-row">';

								str += obj.id ? '<div class="left"><span class="image-id">' + obj.id + '</span></div>' : '<div class="left"></div>';
								str += '<div class="right">';
								str += obj.status ? obj.status + ' ' : '';
								str += obj.progress ? obj.progress + ' ' : '';
								str += '</div>';
								str += '</div>';
								str += '</div>';

								output.append(str);
								output[0].scrollTop = output[0].scrollHeight;
							}
						});

						stream.on('error', function(data) {

						});

						stream.on('end', function(data) {
							console.log('THIS IS THE END');
						});
					}
				});
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



