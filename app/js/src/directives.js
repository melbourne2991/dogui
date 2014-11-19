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
	}]);

}());
