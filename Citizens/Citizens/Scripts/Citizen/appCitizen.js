'use strict';

var app = angular.module('appCitizen', []);

app.value('config', {
        pageSize: 3
});

app.factory('serviceUtil',function(){
    return {
        getErrorMessage: function (error) {
            var errMsg;
            if (error.status === 401) {
                return 'Недостатньо прав для здійснення операції';
            }
            //if (error.data != null) {
            //    errMsg = error.data['odata.error'].innererror.message;
            //}
            if (errMsg == null) {
                errMsg = error.statusText;
            }
            return errMsg;
        },
        compareByName: function (a,b) {
            if (a.Name > b.Name) {
                return 1;
            } else if (a.Name < b.Name) {
                return -1;
            } else {
                return 0;
            }
        },
        copyProperties: function (source, destination) {
            for (var prop in destination) {
                if (destination.hasOwnProperty(prop)) {
                    destination[prop] = source[prop];
                }
            }
        }
    };
});

app.filter('filterByFirstChar', function () {
    return function (input, search) {
        if (!input) return input;
        if (!search) return input;
        var result = [], itemVal, keys, searchKey, searchVal;
        for (searchKey in search) {
            if (search.hasOwnProperty(searchKey)) {
                searchVal = search[searchKey];
                if (searchVal !== '') {
                    break;
                }
            }
        }

        if (searchVal === '' || searchVal == undefined) return input;
        keys = searchKey.split(".");

        function getValue(item) {
            var v, it;
            it = item;
            for (var i = 0, len = keys.length; i < len; i++) {
                v = it[keys[i]];
                if (angular.isObject(v)) {
                    it = v;
                } else {
                    break;
                }
            }
            return v;
        }

        angular.forEach(input, function (item) {
            itemVal = getValue(item);
            if (itemVal !== undefined) {
                itemVal = itemVal.toString().toLowerCase();
                if (itemVal.indexOf(searchVal.toLowerCase()) === 0) {
                    result.push(item);
                }
            }
        });
        return result;
    }
});