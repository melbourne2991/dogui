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
