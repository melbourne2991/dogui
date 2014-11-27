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
