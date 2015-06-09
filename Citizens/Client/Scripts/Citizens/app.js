"use strict";

var app = angular.module("citizens", ["ngRoute", 'angularUtils.directives.dirPagination', 'peopleControllers', 'streetControllers', 'regionPartControllers','cityControllers']);

app.config(['$routeProvider', 'paginationTemplateProvider', function ($routeProvider, paginationTemplateProvider) {
    $routeProvider.
        when('/people', {
            templateUrl: 'Views/ListPeople.html',
            controller: 'listPeopleController'
        }).
        when('/people/:currPage', {
            templateUrl: 'Views/ListPeople.html',
            controller: 'listPeopleController'
        }).
        when('/person/new/:currPage', {
            templateUrl: 'Views/EditPerson.html',
            controller: 'editPersonController'
        }).
        when('/person/:id/:currPage', {
            templateUrl: 'Views/EditPerson.html',
            controller: 'editPersonController'
        }).
        when('/person/:id', {
            templateUrl: 'Views/EditPerson.html',
            controller: 'editPersonController'
        }).
        when('/streets', {
            templateUrl: 'Views/Streets.html',
            controller: 'listStreetsController'
        }).
        when('/streets/:currPage', {
            templateUrl: 'Views/Streets.html',
            controller: 'listStreetsController'
        }).
        when('/region-parts', {
            templateUrl: 'Views/RegionParts.html',
            controller: 'listRegionPartsController'
        }).
        when('/region-parts/:currPage', {
            templateUrl: 'Views/RegionParts.html',
            controller: 'listRegionPartsController',
            reloadOnSearch: false // do not work
        }).
        when('/cities', {
            templateUrl: 'Views/ListCities.html',
            controller: 'listCitiesController'
        }).
        when('/city/new', {
            templateUrl: 'Views/EditCity.html',
            controller: 'editCityController'
        }).
        when('/city/:id', {
            templateUrl: 'Views/EditCity.html',
            controller: 'editCityController'
        }).
        otherwise({
            redirectTo: '/' //login
        });
    paginationTemplateProvider.setPath('Scripts/AngularUtils/directives/dirPagination.tpl.html');
}]);

app.value("config", {
    baseUrl: 'http://localhost:6600',
    pageSize: 5, // by default 20
    pageSizeTabularSection: 10,
    checkDeleteItem: true
});

app.filter('checkApartment', function () {
    return function (input) {
        return input > 0 ? ", кв." + input : '';
    };
});

app.factory("serviceUtil", ["$filter", '$routeParams', function ($filter, $routeParams) {
    return {
        getErrorMessage: function (error) {
            var errMsg;
            if (error.status === 401) {
                return "Недостатньо прав для здійснення операції";
            }
            if (error.data !== "") {
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
            return a.Name.localeCompare(b.Name);
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
            return $filter("date")(date, pattern);
        },
        getRouteParam: function (paramName) {
            var param = $routeParams[paramName], intParam;
            if (param) {
                intParam = parseInt(param);
                if (intParam > 0) {
                    return intParam;
                }
            }
            return undefined;
        }
    };
}]);

app.run(["$rootScope", "$timeout", function ($rootScope, $timeout) {
    $rootScope.$watch("successMsg", function (newValue) {
        if (newValue && newValue.length > 0) {
            $timeout(function () {
                $rootScope.successMsg = "";
            }, 700);
        }
    });
}]);

app.filter("orderByStartsWith", function () {
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
            return cmpA.localeCompare(cmpB);
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
});

app.filter("filterByFirstChar", function () {
    return function (input, search) {
        if (!input) return input;
        if (!search) return input;
        var result = [], itemVal, searchKey, searchVal;
        for (searchKey in search) {
            if (search.hasOwnProperty(searchKey)) {
                searchVal = search[searchKey];
                if (searchVal !== "") {
                    break;
                }
            }
        }

        if (searchVal === "" || searchVal == undefined) return input;
        var keys = searchKey.split(".");

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