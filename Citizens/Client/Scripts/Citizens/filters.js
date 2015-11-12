(function () {
    'use strict';

    angular.module('citizens.filters', [])
        .filter('checkApartment', checkApartment)
        .filter('orderByStartsWith', orderByStartsWith);

    function checkApartment() {
        return function (input) {
            return input ? ", кв." + input : '';
        };
    }

    function orderByStartsWith() {
        return function (items, viewValue) {
            var key, value;
            // object must be with only one key
            if (angular.isObject(viewValue)) {
                key = Object.keys(viewValue)[0];
                value = viewValue[key];
            } else {
                value = viewValue;
            }
            function startsWith(obj) {
                var str = obj;
                if (key) {
                    str = obj[key];
                }
                return str.toString().substr(0, value.length).toLowerCase() === value.toLowerCase();
            };
            function compareByDefault(a, b) {
                var cmpA = a, cmpB = b;
                if (key) {
                    cmpA = a[key];
                    cmpB = b[key];
                }
                if (angular.isString(cmpA)) {
                    return cmpA.localeCompare(cmpB);
                } else {
                    return cmpA > cmpB ? 1 : cmpA < cmpB ? -1 : 0;
                }
            };
            return items.sort(function (a, b) {
                if (startsWith(a)) {
                    if (startsWith(b)) {
                        return compareByDefault(a, b);
                    } else {
                        return -1;
                    }
                } else if (startsWith(b)) {
                    return 1;
                } else {
                    return compareByDefault(a, b);
                }
            });
        }
    }
})()