"use strict";

var app = angular.module("citizens",
    [
        'ngRoute',
        'ngCookies',
        'angularUtils.directives.dirPagination',
        'ui.bootstrap',
        'citizens.core',
        'citizens.filters',
        'citizens.directives',
        'peopleControllers',
        'streetControllers',
        'regionPartControllers',
        'cityControllers',
        'authControllers',
        'precinctControllers',
        'uploadXlsModule',
        'districtControllers',
        'userControllers',
        'neighborhoodControllers',
        'workAreaControllers'
    ]
);

app.config(['$routeProvider', '$locationProvider', 'paginationTemplateProvider', '$httpProvider', function ($routeProvider, $locationProvider, paginationTemplateProvider, $httpProvider) {

    var routeListCities = {
            templateUrl: 'Views/ListCities.html',
            controller: 'listCitiesController',
            resolve: { commonData: function(commonData) { return commonData.asyncLoad() } }
        },
        routeEditCity = {
            templateUrl: 'Views/EditCity.html',
            controller: 'editCityController',
            resolve: {
                commonData: function (commonData) { return commonData.asyncLoad() },
                resolvedData: function($route, dataForEditCityPage) {
                    return dataForEditCityPage.asyncLoad($route.current.params.id);
                }
            }
        },
        routeListPeople = {
            templateUrl: 'Views/ListPeople.html',
            controller: 'listPeopleController',
            resolve: {
                commonData: function (commonData) { return commonData.asyncLoad() },
                resolvedAdditionalProperties: function (peopleDataService) {
                    return peopleDataService.asyncLoadAdditionalProperties();
                }
           }
        },
        routeEditPerson = {
            templateUrl: 'Views/EditPerson.html',
            controller: 'editPersonController',
            resolve: {
                commonData: function (commonData) { return commonData.asyncLoad() },
                resolvedData: function($q, $route, peopleDataService) {
                    return $q.all({
                        additionalProps: peopleDataService.asyncLoadAdditionalProperties(),
                        data: peopleDataService.asyncLoadData($route.current.params.id)
                    });   
                }
            }
        },
        routeStreets = {
            templateUrl: 'Views/Streets.html',
            controller: 'listStreetsController',
            resolve: { commonData: function (commonData) { return commonData.asyncLoad() } }
        },
        routeRegionParts = {
            templateUrl: 'Views/RegionParts.html',
            controller: 'listRegionPartsController',
            resolve: {
                commonData: function (commonData) { return commonData.asyncLoad() }
            }
        },
        routeListPrecincts = {
            templateUrl: 'Views/ListPrecincts.html',
            controller: 'listPrecinctsController',
            resolve: {
                commonData: function (commonData) { return commonData.asyncLoad() }
            }
        },
        routeEditPecinct = {
            templateUrl: 'Views/EditPrecinct.html',
            controller: 'editPrecinctController',
            resolve: {
                commonData: function (commonData) { return commonData.asyncLoad() },
                resolvedData: function ($route, precinctDataService) {
                    return precinctDataService.asyncLoadData($route.current.params.id);
                }
            }
        },
        routeListDistricts = {
            templateUrl: 'Views/ListDistricts.html',
            controller: 'listDistrictsController',
            resolve: {
                commonData: function (commonData) { return commonData.asyncLoad() },
                districts: function (districtDataService) {
                    return districtDataService.asyncCacheAll();
                }
            }
        },
        routeEditDistrict = {
            templateUrl: 'Views/EditDistrict.html',
            controller: 'editDistrictController',
            resolve: {
                commonData: function (commonData) { return commonData.asyncLoad() },
                resolvedData: function ($q, $route, districtResource) {
                    return $q.all({
                        district: $route.current.params.id ? districtResource.getById({ id: $route.current.params.id }).$promise
                            .catch(function(e) {
                                e.description = 'Округ не знайдено';
                                return $q.reject(e);
                            }) : undefined,
                        types: districtResource.getTypes().$promise.then(function(resp) {
                            return resp.value;
                        }, function (e) {
                            e.description = 'Типи округів не завантажено';
                            return $q.reject(e);
                        })
                    });
                }
            }
        },
        routeEditUser = {
            templateUrl: 'Views/Admin/EditUser.html',
            controller: 'editUserController',
            resolve: {
                commonData: function (commonData) { return commonData.asyncLoad() },
                resolvedUser: function($route, usersHolder) { return usersHolder.asyncLoadById($route.current.params.id) }
            },
            access: { requiredRoles: ['SuperAdministrators', 'Administrators'] }
        },
        routeUsers = {
            templateUrl: 'Views/Admin/Users.html',
            controller: 'listUsersController',
            resolve: {
                commonData: function (commonData) { return commonData.asyncLoad() },
                resolvedUsers: function (usersHolder) { return usersHolder.asyncLoad() }
            },
            access: { requiredRoles: ['SuperAdministrators', 'Administrators'] }
        },
        routeNeighborhoods = {
            templateUrl: 'Views/Neighborhoods.html',
            controller: 'listNeighborhoodsController',
            resolve: {
                commonData: function (commonData) { return commonData.asyncLoad() }
            }
        },
        routeListWorkAreas = {
            templateUrl: 'Views/ListWorkAreas.html',
            controller: 'listWorkAreasController',
            resolve: {
                commonData: function (commonData) { return commonData.asyncLoad() }
            }
        },
        routeEditWorkArea = {
            templateUrl: 'Views/EditWorkArea.html',
            controller: 'editWorkAreaController',
            reloadOnSearch: false,
            resolve: {
                commonData: function (commonData) { return commonData.asyncLoad() },
                resolvedData: function ($route, workAreaDataService) {
                    return workAreaDataService.asyncLoad($route.current.params);
                }
            }
        };

    $routeProvider.
        when('/people', routeListPeople).
        when('/people/:currPage', routeListPeople).
        when('/person/new/:currPage', routeEditPerson).
        when('/person/:id/:currPage', routeEditPerson).
        when('/person/:id', routeEditPerson).
        when('/streets', routeStreets).
        when('/streets/:currPage', routeStreets).
        when('/region-parts', routeRegionParts).
        when('/region-parts/:currPage', routeRegionParts).
        when('/precincts', routeListPrecincts).
        when('/precincts/:currPage', routeListPrecincts).
        when('/precinct/new', routeEditPecinct).
        when('/precinct/new/:currPage', routeEditPecinct).
        when('/precinct/:id', routeEditPecinct).
        when('/precinct/:id/:currPage', routeEditPecinct).
        when('/cities', routeListCities).
        when('/cities/:currPage', routeListCities).
        when('/city/new', routeEditCity).
        when('/city/new/:currPage', routeEditCity).
        when('/city/:id', routeEditCity).
        when('/city/:id/:currPage', routeEditCity).
        when('/districts', routeListDistricts).
        when('/districts/:currPage', routeListDistricts).
        when('/district/new', routeEditDistrict).
        when('/district/new/:currPage', routeEditDistrict).
        when('/district/:id', routeEditDistrict).
        when('/district/:id/:currPage', routeEditDistrict).
        when('/users', routeUsers).
        when('/users/:currPage', routeUsers).
        when('/user/:id', routeEditUser).
        when('/user/:id/:currPage', routeEditUser).
        when('/neighborhoods', routeNeighborhoods).
        when('/neighborhoods/:currPage', routeNeighborhoods).
        when('/work-areas', routeListWorkAreas).
        when('/work-areas/:currPage', routeListWorkAreas).
        when('/work-area/new', routeEditWorkArea).
        when('/work-area/new/:currPage', routeEditWorkArea).
        when('/work-area/:id/:precinctId', routeEditWorkArea).
        when('/work-area/:id/:precinctId/:currPage', routeEditWorkArea).
        when('/uploadXls', {
            templateUrl: 'Views/Admin/UploadXls.html',
            controller: 'uploadXlsController',
            access: { requiredRoles: ['SuperAdministrators'] }
        }).
        when('/geocoding-precincts', {
            templateUrl: 'Views/Admin/GeocodingPrecincts.html',
            controller: 'geocodingController',
            resolve: { commonData: function (commonData) { return commonData.asyncLoad() } },
            access: { requiredRoles: ['SuperAdministrators', 'Administrators'] }
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
                logout: function ($location, Credentials, usersHolder, commonData, districtDataService) {
                    Credentials.clear();
                    //remove all cached data
                    usersHolder.removeAll();
                    commonData.removeAll();
                    districtDataService.cache.removeAll();
                    $location.path('/login');
                }
            }
        }).
        when('/error-forbidden', {
            templateUrl: 'Views/ErrorPages/403.tpl.html'
        }).
        otherwise({
            redirectTo: '/'
        });

    $httpProvider.interceptors.push('authInterceptor');
    $locationProvider.html5Mode(true);
    paginationTemplateProvider.setPath('Scripts/AngularUtils/directives/dirPagination.tpl.html');
}]);

app.run(["$rootScope", "$timeout", '$location', 'Credentials', 'checkPermissions', 'serviceUtil', function ($rootScope, $timeout, $location, Credentials, checkPermissions, serviceUtil) {
    var authData = Credentials.get();
    if (authData) $rootScope.UserInfo = authData.userInfo;

    $rootScope.$watch("successMsg", function (newValue) {
        if (newValue && newValue.length > 0) {
            $timeout(function () {
                $rootScope.successMsg = "";
            }, 700);
        }
    });

    $rootScope.$on('$routeChangeStart', function (event, current, previous) {
        var nextUrl = $location.path(),
            checkRestrictedPage = function(url) {
                return $.inArray(url, ['/login', '/register']) === -1;
            },
        restrictedPage = checkRestrictedPage(nextUrl);
        if (restrictedPage && !$rootScope.UserInfo) {
            if (nextUrl) {
                $location.path('/login').search('backUrl', nextUrl);
            } else {
                $location.path('/login');
            }
            return;
        };
        if (nextUrl === '/register') {
            var backUrl;
            if (previous) {
                backUrl = previous.params.backUrl;
            }
            if (backUrl) {
                $location.path(nextUrl).search('backUrl', backUrl);
            } else {
                $location.path(nextUrl);
            }
            return;
        };
        
        if (current.$$route && current.$$route.access) {
            var requiredRoles = current.$$route.access.requiredRoles;
            if (requiredRoles && !checkPermissions(requiredRoles)) {
                var returnUrl = '/error-forbidden';
                if (previous && previous.$$route && checkRestrictedPage(previous.$$route.originalPath)) {
                    returnUrl = previous.$$route.originalPath;
                    $rootScope.errorMsg = "У Вас недостатньо прав доступу";
                }
                $location.path(returnUrl);
                return;
            }
        }
        if (current.$$route && current.$$route.resolve) {
            $rootScope.loading = true;
        }
    });

    $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
        $rootScope.errorMsg = '';
        $rootScope.pageTitle = '';
        $rootScope.loading = false;
    });

    $rootScope.$on('$routeChangeError', function (event, current, previous, rejection) {
        // todo: get rejection as error object but not as string
        $rootScope.errorMsg = angular.isString(rejection) ? rejection : serviceUtil.getErrorMessage(rejection);
        $rootScope.loading = false;
    });
}]);

//todo: delete filterByFirstChar
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
            if (itemVal) {
                itemVal = itemVal.toString().toLowerCase();
                if (itemVal.indexOf(searchVal.toLowerCase()) === 0) {
                    result.push(item);
                }
            }
        });
        return result;
    }
});

//todo: use $cacheFactory
app.factory('filterSettings', [function () {
    var settings = {};
    return {
        get: function (key) {
            return settings[key];
        },
        set: function (key, value) {
            settings[key] = value;
        },
        remove: function (key) {
            delete settings[key];
        }
    }
}]);