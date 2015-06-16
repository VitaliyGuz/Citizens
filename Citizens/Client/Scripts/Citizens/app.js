"use strict";

var app = angular.module("citizens", ["ngRoute", 'ngCookies', 'angularUtils.directives.dirPagination', 'peopleControllers', 'streetControllers', 'regionPartControllers', 'cityControllers', 'authControllers']);

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
            controller: 'listRegionPartsController'
        }).
        when('/cities', {
            templateUrl: 'Views/ListCities.html',
            controller: 'listCitiesController',
            resolve: {genlData: function (genlData) { return genlData.asyncLoad() }}
        }).
        when('/city/new', {
            templateUrl: 'Views/EditCity.html',
            controller: 'editCityController',
            resolve: {
                //genlData: function(genlData) {
                //    return genlData.asyncLoad();
                //},
                resolvedData: function ($route, dataForEditPage) {
                    //todo: use serviceUtil.getRouteParam()
                    return dataForEditPage.asyncLoad($route.current.params.id);
                }
            }
        }).
        when('/city/:id', {
            templateUrl: 'Views/EditCity.html',
            controller: 'editCityController',
            resolve: {
                 //genlData: function(genlData) {
                 //    return genlData.asyncLoad();
                 //},
                resolvedData: function ($route, dataForEditPage) {
                    //todo: use serviceUtil.getRouteParam()
                    return dataForEditPage.asyncLoad($route.current.params.id);
                 }
            }
        }).
        when('/login', {
            templateUrl: 'Views/Login.html',
            controller: 'loginController'
        }).
        when('/register', {
            templateUrl: 'Views/Register.html',
            controller: 'registerController'
        }).
        otherwise({
            redirectTo: '/'
        });
    paginationTemplateProvider.setPath('Scripts/AngularUtils/directives/dirPagination.tpl.html');
}]);

app.value("config", {
    baseUrl: 'http://poltava2015.azurewebsites.net', //http://localhost:6600',
    pageSize: 5, // by default 20
    pageSizeTabularSection: 10,
    checkDeleteItem: true
});

app.filter('checkApartment', function () {
    return function (input) {
        return input > 0 ? ", кв." + input : '';
    };
});

app.factory("serviceUtil", ["$filter", '$routeParams', '$location', function ($filter, $routeParams, $location) {
    return {
        getErrorMessage: function (error) {
            var errMsg;
            if (error.status === 401) {
                $location.path('/login');
                //return "Недостатньо прав для здійснення операції";
                return '';
            }
            if (error.data !== "") {
                if (angular.isObject(error.data)) {
                    errMsg = error.data.error.message;
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

app.run(["$rootScope", "$timeout", '$location', '$cookieStore', '$http', function ($rootScope, $timeout, $location, $cookieStore, $http) {
    var authData = $cookieStore.get('auth_data') || undefined;
    if (authData) {
        $rootScope.UserInfo = authData.userInfo;
        $http.defaults.headers.common['Authorization'] = authData.accessToken;
    }

    $rootScope.$watch("successMsg", function (newValue) {
        if (newValue && newValue.length > 0) {
            $timeout(function () {
                $rootScope.successMsg = "";
            }, 700);
        }
    });

    $rootScope.$on('$routeChangeStart', function (event, current, previous) {
        var backUrl = $location.path(),
            restrictedPage = $.inArray(backUrl, ['/login', '/register']) === -1;
        if (restrictedPage && !$rootScope.UserInfo) {
            if (backUrl) {
                $location.path('/login').search('backUrl', backUrl);
            } else {
                $location.path('/login');
            }
            return;
        };
        if (current.$$route && current.$$route.resolve) {
            $rootScope.loading = true;
        }
    });

    $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
        $rootScope.loading = false;
    });

    $rootScope.$on('$routeChangeError', function (event, current, previous, rejection) {
        $rootScope.errorMsg = rejection;
        $rootScope.loading = false;
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

app.factory('genlData', ['$q', '$rootScope', 'cityData', 'streetData', 'regionPartData', 'serviceUtil', function ($q, $rootScope, cityData, streetData, regionPartData, serviceUtil) {

    function getCitiesPromise() {
        var deferred = $q.defer();
        cityData.getAll(function (res) {
            $rootScope.cities = res.value;
            deferred.resolve(res.value);
        }, function (err) {
            deferred.reject('Населені пункти не завантажено (' + serviceUtil.getErrorMessage(err) + ')');
        });
        return deferred.promise;
    };

    function getStreetsPromise() {
        var deferred = $q.defer();
        streetData.query(function (res) {
            $rootScope.streets = res.value;
            deferred.resolve(res.value);
        }, function (err) {
            deferred.reject('Вулиці не завантажено (' + serviceUtil.getErrorMessage(err) + ')');
        });
        return deferred.promise;
    };

    function getRegionPartsPromise() {
        var deferred = $q.defer();
        regionPartData.query(function (res) {
            $rootScope.regionParts = res.value;
            deferred.resolve(res.value);
        }, function (err) {
            deferred.reject('Райони не завантажено (' + serviceUtil.getErrorMessage(err) + ')');
        });
        return deferred.promise;
    };
    return {
        asyncLoad: function () {
            return getCitiesPromise()
                .then(function () {
                    return getStreetsPromise();
                })
                .then(function () {
                    return getRegionPartsPromise();
                }
            );
            //return $q.all({
            //    cities: getCitiesPromise(),
            //    streets: getStreetsPromise(),
            //    regionParts: getRegionPartsPromise()
            //});
            //var d = {};
            //getCitiesPromise().then(function(cities) {
            //    d.cities = cities;
            //});
            //getStreetsPromise().then(function (streets) {
            //    d.streets = streets;
            //});
            //getRegionPartsPromise().then(function (regionParts) {
            //    d.regionParts = regionParts;
            //});
            //return d;
        }
    };
}]);