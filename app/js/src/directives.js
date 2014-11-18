(function() {

'use strict';

angular.module('Dogui.directives', [])
	.directive('modaler', ['$timeout', function($timeout) {
		return {
			scope: {
				confirmFn: '&',
				cancelFn: '&',
				modalTitle: '@',
				modalBody: '@',
				modalConfirmText: '@',
				modalCancelText: '@'
			},
			link: function(scope, element, attrs) {
				var primaryModal = $('#primaryModal'),
					confirmButton = $('#primaryModal').find('.approve'),
					cancelButton = $('#primaryModal').find('.deny'),
					modalTitle = scope.modalTitle || 'Modal',
					modalBody = scope.modalBody || 'Modal Body',
					modalConfirmText = scope.modalConfirmText || 'Okay',
					modalCancelText = scope.modalCancelText || 'Cancel';

				// primaryModal.find('.header').text(modalTitle);
				// primaryModal.find('.content').text(modalBody);
				// primaryModal.find('.approve').text(modalConfirmText);
				// primaryModal.find('.deny').text(modalCancelText);

				primaryModal.modal('setting', {
					onApprove: function(e) {
						if(typeof confirmFn === 'function') {
							var confirmed = confirmFn();
							if(typeof confirmed.then === 'function') {
								confirmed.then(function() {
									primaryModal.modal('hide');
								});
							} else {
								primaryModal.modal('hide');
							}
						}
					},
					onDeny: function(e) {
						if(typeof cancelFn === 'function') {
							var cancelled = cancelFn();
							if(typeof cancelled.then === 'function') {
								confirmed.then(function() {
									primaryModal.modal('hide');
								});
							} else {
								primaryModal.modal('hide');
							}
						}
					}
				});

				element.on('click', function(e) {
					e.preventDefault();
					primaryModal.modal('show');
				});
			}
		};
	}]);

}());
