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
