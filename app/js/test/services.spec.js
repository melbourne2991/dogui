'use strict';

describe('services', function() {
	beforeEach(module('Dogui.services'));

	describe('DockerConn', function() {
		var DockerConnMock;

		beforeEach(inject(function(DockerConn) {
			DockerConnMock = DockerConn;
		}));

		describe('DockerConn.new(opts) - bad path to cert/ca/key', function() {
			var DockerConnNew,
				opts = {
					name: 'A new connection',
					_id: '938djhkjdhf822hsgs',
					config: {
						host: '192.168.59.103',
						protocol: 'https',
						port: 2322,
						cert: '/path/to/cert',
						ca: '/path/to/ca',
						key: '/path/to/key'
					}
				};

			beforeEach(function() {
				DockerConnNew = DockerConnMock.new(opts);
			});

			it('should return a new DockerConn object', function() {
				expect(typeof DockerConnNew).toBe('object');
			});

			it('should have an init function that throws an error due to bad path', function() {
				expect(DockerConnNew.init).toThrow();	
			});
		});

		describe('DockerConn.new(opts) - working path', function() {
			var appPath = process.env.APP_PATH;

			var DockerConnNew,
				opts = {
					name: 'A new connection',
					_id: '938djhkjdhf822hsgs',
					config: {
						host: '192.168.59.103',
						protocol: 'https',
						port: 2322,
						cert: appPath + '/js/test/props/cert',
						ca: appPath + '/js/test/props/cert',
						key: appPath + '/js/test/props/cert'
					}
				};

			beforeEach(function() {
				DockerConnNew = DockerConnMock.new(opts);
			});			

			it('should return a new DockerConn object', function() {
				expect(typeof DockerConnNew).toBe('object');
			});	
			
			it('should have an init function that returns a dockerode', function() {
				expect(DockerConnNew.init().modem).toBeDefined();	
			});		
		});
	});
});	