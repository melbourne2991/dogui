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