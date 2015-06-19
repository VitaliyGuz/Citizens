"use strict";

var app = angular.module("citizens",
    [
        'ngRoute', 'ngCookies',
        'angularUtils.directives.dirPagination',
        'peopleControllers', 'streetControllers', 'regionPartControllers', 'cityControllers', 'authControllers','precinctControllers'
    ]
);

app.config(['$routeProvider', '$httpProvider', 'paginationTemplateProvider', function ($routeProvider, $httpProvider, paginationTemplateProvider) {
    $routeProvider.
        when('/people', {
            templateUrl: 'Views/ListPeople.html',
            controller: 'listPeopleController',
            resolve: {
                genlData: function (genlData) { genlData.asyncLoad() },
                genlPeopleData: function (genlPeopleData) { return genlPeopleData.asyncLoad() }
            }
        }).
        when('/people/:currPage', {
            templateUrl: 'Views/ListPeople.html',
            controller: 'listPeopleController',
            resolve: {
                genlData: function (genlData) { genlData.asyncLoad() },
                genlPeopleData: function (genlPeopleData) { return genlPeopleData.asyncLoad() }
            }
        }).
        when('/person/new/:currPage', {
            templateUrl: 'Views/EditPerson.html',
            controller: 'editPersonController',
            resolve: {
                genlData: function (genlData) { genlData.asyncLoad() },
                genlPeopleData: function (genlPeopleData) { return genlPeopleData.asyncLoad() },
                resolvedData: function ($route, dataForEditPersonPage) {
                    return dataForEditPersonPage.asyncLoad($route.current.params.id);
                }
            }
        }).
        when('/person/:id/:currPage', {
            templateUrl: 'Views/EditPerson.html',
            controller: 'editPersonController',
            resolve: {
                genlData: function (genlData) { genlData.asyncLoad() },
                genlPeopleData: function (genlPeopleData) { return genlPeopleData.asyncLoad() },
                resolvedData: function ($route, dataForEditPersonPage) {
                    return dataForEditPersonPage.asyncLoad($route.current.params.id);
                }
            }
        }).
        when('/person/:id', {
            templateUrl: 'Views/EditPerson.html',
            controller: 'editPersonController',
            resolve: {
                genlData: function (genlData) { return genlData.asyncLoad() },
                genlPeopleData: function (genlPeopleData) { return genlPeopleData.asyncLoad() },
                resolvedData: function ($route, dataForEditPersonPage) {
                    return dataForEditPersonPage.asyncLoad($route.current.params.id);
                }
            }
        }).
        when('/streets', {
            templateUrl: 'Views/Streets.html',
            controller: 'listStreetsController',
            resolve: { genlData: function (genlData) { genlData.asyncLoad() } }
        }).
        when('/streets/:currPage', {
            templateUrl: 'Views/Streets.html',
            controller: 'listStreetsController',
            resolve: { genlData: function (genlData) { genlData.asyncLoad() } }
        }).
        when('/region-parts', {
            templateUrl: 'Views/RegionParts.html',
            controller: 'listRegionPartsController',
            resolve: { genlData: function (genlData) { genlData.asyncLoad() } }
        }).
        when('/region-parts/:currPage', {
            templateUrl: 'Views/RegionParts.html',
            controller: 'listRegionPartsController',
            resolve: { genlData: function (genlData) { genlData.asyncLoad() } }
        }).
        when('/precincts', {
            templateUrl: 'Views/ListPrecincts.html',
            controller: 'listPrecinctsController',
            resolve: {
                genlData: function (genlData) { genlData.asyncLoad() },
                genlPrecinctsData: function (genlPrecinctsData) { return genlPrecinctsData.asyncLoad() }
            }
        }).
        when('/precincts/:currPage', {
            templateUrl: 'Views/ListPrecincts.html',
            controller: 'listPrecinctsController',
            resolve: {
                genlData: function (genlData) { genlData.asyncLoad() },
                genlPrecinctsData: function (genlPrecinctsData) { return genlPrecinctsData.asyncLoad() }
            }
        }).
        when('/precinct/new', {
            templateUrl: 'Views/EditPrecinct.html',
            controller: 'editPrecinctController',
            resolve: {
                genlData: function (genlData) { genlData.asyncLoad() },
                genlPrecinctsData: function (genlPrecinctsData) { return genlPrecinctsData.asyncLoad() },
                resolvedData: function ($route, dataForEditPrecinctPage) {
                    return dataForEditPrecinctPage.asyncLoad($route.current.params.id);
                }
            }
        }).
        when('/precinct/new/:currPage', {
            templateUrl: 'Views/EditPrecinct.html',
            controller: 'editPrecinctController',
            resolve: {
                genlData: function (genlData) { genlData.asyncLoad() },
                genlPrecinctsData: function (genlPrecinctsData) { return genlPrecinctsData.asyncLoad() },
                resolvedData: function ($route, dataForEditPrecinctPage) {
                    return dataForEditPrecinctPage.asyncLoad($route.current.params.id);
                }
            }
        }).
        when('/precinct/:id', {
            templateUrl: 'Views/EditPrecinct.html',
            controller: 'editPrecinctController',
            resolve: {
                genlData: function (genlData) { genlData.asyncLoad() },
                genlPrecinctsData: function (genlPrecinctsData) { return genlPrecinctsData.asyncLoad() },
                resolvedData: function ($route, dataForEditPrecinctPage) {
                    return dataForEditPrecinctPage.asyncLoad($route.current.params.id);
                 }
            }
        }).
        when('/precinct/:id/:currPage', {
            templateUrl: 'Views/EditPrecinct.html',
            controller: 'editPrecinctController',
            resolve: {
                genlData: function (genlData) { genlData.asyncLoad() },
                genlPrecinctsData: function (genlPrecinctsData) { return genlPrecinctsData.asyncLoad() },
                resolvedData: function ($route, dataForEditPrecinctPage) {
                    return dataForEditPrecinctPage.asyncLoad($route.current.params.id);
                }
            }
        }).
        when('/cities', {
            templateUrl: 'Views/ListCities.html',
            controller: 'listCitiesController',
            resolve: {genlData: function (genlData) { genlData.asyncLoad() }}
        }).
        when('/cities/:currPage', {
            templateUrl: 'Views/ListCities.html',
            controller: 'listCitiesController',
            resolve: { genlData: function (genlData) { genlData.asyncLoad() } }
        }).
        when('/city/new', {
            templateUrl: 'Views/EditCity.html',
            controller: 'editCityController',
            resolve: {
                genlData: function(genlData) { genlData.asyncLoad() },
                resolvedData: function ($route, dataForEditCityPage) {
                    return dataForEditCityPage.asyncLoad($route.current.params.id);
                }
            }
        }).
        when('/city/new/:currPage', {
            templateUrl: 'Views/EditCity.html',
            controller: 'editCityController',
            resolve: {
                genlData: function (genlData) { genlData.asyncLoad() },
                resolvedData: function ($route, dataForEditCityPage) {
                    return dataForEditCityPage.asyncLoad($route.current.params.id);
                }
            }
        }).
        when('/city/:id', {
            templateUrl: 'Views/EditCity.html',
            controller: 'editCityController',
            resolve: {
                genlData: function(genlData) { genlData.asyncLoad() },
                resolvedData: function ($route, dataForEditCityPage) {
                    return dataForEditCityPage.asyncLoad($route.current.params.id);
                 }
            }
        }).
        when('/city/:id/:currPage', {
            templateUrl: 'Views/EditCity.html',
            controller: 'editCityController',
            resolve: {
                genlData: function (genlData) { genlData.asyncLoad() },
                resolvedData: function ($route, dataForEditCityPage) {
                    return dataForEditCityPage.asyncLoad($route.current.params.id);
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
        when('/logout', {
            resolve: {
                logout: function ($location, Credentials) {
                    Credentials.clear();
                    $location.path('/login');
                }
            }
        }).
        otherwise({
            redirectTo: '/'
        });

    paginationTemplateProvider.setPath('Scripts/AngularUtils/directives/dirPagination.tpl.html');
}]);

app.value("config", {
    baseUrl: 'http://poltava2015.azurewebsites.net', //http://localhost:6600',
    pageSize: 20, // by default 20
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
        var changeUrl = $location.path(),
            restrictedPage = $.inArray(changeUrl, ['/login', '/register']) === -1;
        if (restrictedPage && !$rootScope.UserInfo) {
            if (changeUrl) {
                $location.path('/login').search('backUrl', changeUrl);
            } else {
                $location.path('/login');
            }
            return;
        };
        if (changeUrl === '/register') {
            var backUrl;
            if (previous) {
                backUrl = previous.params.backUrl;
            }
            if (backUrl) {
                $location.path(changeUrl).search('backUrl', backUrl);
            } else {
                $location.path(changeUrl);
            }
            return;
        };
        if (current.$$route && current.$$route.resolve) {
            $rootScope.loading = true;
        }
    });

    $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
        $rootScope.errorMsg = '';
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

    function getDataPromise(param) {
        var deferred = $q.defer();
        if ($rootScope[param.propName] && $rootScope[param.propName].length > 0) {
            deferred.resolve();
            return deferred.promise;
        }
        param.dataSource[param.method](function (res) {
            $rootScope[param.propName] = res.value;
            deferred.resolve();
        }, function (err) {
            deferred.reject(param.desc+' не завантажено (' + serviceUtil.getErrorMessage(err) + ')');
        });
        return deferred.promise;
    };
    return {
        asyncLoad: function () {
            return getDataPromise({ propName: 'cities', dataSource: cityData, method: 'getAll', desc: 'Населені пункти' })
                .then(function () {
                    return getDataPromise({ propName: 'streets', dataSource: streetData, method: 'query', desc: 'Вулиці' });
                })
                .then(function () {
                    return getDataPromise({ propName: 'regionParts', dataSource: regionPartData, method: 'getAll', desc: 'Райони' });
                }
            );
        }
    };
}]);