'use strict';

var app = angular.module('appCitizen', []);

app.value('config', {
    pageSize: 20, // by default 20
    pageSizeTabularSection: 10
});

app.factory('serviceUtil', ['$filter', function ($filter) {
    return {
        getErrorMessage: function (error) {
            var errMsg;
            if (error.status === 401) {
                return 'Недостатньо прав для здійснення операції';
            }
            if (error.data !='') {
                if (angular.isObject(error.data)) {
                    errMsg = error.data.error.innererror.message;
                } else {
                    errMsg = error.data;
                }
            }
            if (!errMsg) {
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
        },
        getAddressKey: function (address) {
            return { cityId: address.CityId, streetId: address.StreetId, house: address.House };
        },
        formatDate: function (date,pattern) {
            return $filter('date')(date, pattern);
        }
    };
}]);

//app.factory('cachedAddressData', ['streetData', 'cityData', '$q', function (streetData, cityData, $q) {
//    var citiesCache = [], streetsCache = [];
//    return {
//        asyncGetCities: function () {
//            var deferred = $q.defer();
//            if (citiesCache.length === 0) {
//                cityData.getAll(function (successData) {
//                    citiesCache = successData.value;
//                    deferred.resolve(citiesCache);
//                }, function (error) {
//                    deferred.reject(error);
//                });
//            } else {
//                deferred.resolve(citiesCache);
//            }
//            return deferred.promise;
//        },
//        asyncGetStreets: function () {
//            var deferred = $q.defer();
//            if(streetsCache.length === 0) {
//                streetData.query(function (successData) {
//                    streetsCache = successData.value;
//                    deferred.resolve(streetsCache);
//                }, function (error) {
//                    deferred.reject(error);
//                });
//            } else {
//                deferred.resolve(streetsCache);
//            }
//            return deferred.promise;
//        }
//    };
//}]);

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