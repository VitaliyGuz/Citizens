(function () {
    'use strict';

    angular.module('citizens.directives', [])
        .directive('datepicker', datepicker)
        .directive('accessPermissions', accessPermissions);

    datepicker.$inject = ['serviceUtil'];

    accessPermissions.$inject = ['checkPermissions'];

    function datepicker(serviceUtil) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ngModelCtrl) {
                $(function () {
                    element.datepicker({
                        changeMonth: true,
                        changeYear: true,
                        regional: "ua",
                        onSelect: function (date) {
                            scope.$apply(function () {
                                ngModelCtrl.$setViewValue(serviceUtil.dateParse(date));
                            });
                        }
                    });
                });
            }
        }
    }

    function accessPermissions(checkPermissions) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var requiredRoles = attrs.accessPermissions.split(','),
                isMakeVisible = checkPermissions(requiredRoles);
                if (isMakeVisible) {
                    element.removeClass('hidden');
                } else {
                    element.addClass('hidden');
                }
            }
        }
    }
})()