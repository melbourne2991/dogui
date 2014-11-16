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
