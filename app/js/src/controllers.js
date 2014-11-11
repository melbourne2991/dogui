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
