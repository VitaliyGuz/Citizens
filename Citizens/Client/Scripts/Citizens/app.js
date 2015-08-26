"use strict";

var app = angular.module("citizens",
    [
        'ngRoute', 'ngCookies',
        'angularUtils.directives.dirPagination','ui.bootstrap',
        'peopleControllers', 'streetControllers', 'regionPartControllers', 'cityControllers', 'authControllers', 'precinctControllers', 'uploadXlsModule', 'districtControllers', 'userControllers', 'neighborhoodControllers'
    ]
);

app.config(['$routeProvider', '$locationProvider', 'paginationTemplateProvider', '$httpProvider', function ($routeProvider, $locationProvider, paginationTemplateProvider, $httpProvider) {

    var routeListCities = {
            templateUrl: 'Views/ListCities.html',
            controller: 'listCitiesController',
            resolve: { commonData: function(commonData) { return commonData.asyncLoad() } },
            reloadOnSearch: true
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
                genlPeopleData: function(genlPeopleData) { return genlPeopleData.asyncLoad() }
            }
        },
        routeEditPerson = {
            templateUrl: 'Views/EditPerson.html',
            controller: 'editPersonController',
            resolve: {
                commonData: function (commonData) { return commonData.asyncLoad() },
                genlPeopleData: function(genlPeopleData) { return genlPeopleData.asyncLoad() },
                resolvedData: function($route, dataForEditPersonPage) {
                    return dataForEditPersonPage.asyncLoad($route.current.params.id);
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
                resolvedData: function($route, dataForEditPrecinctPage) {
                    return dataForEditPrecinctPage.asyncLoad($route.current.params.id);
                }
            }
        },
        routeListDistricts = {
            templateUrl: 'Views/ListDistricts.html',
            controller: 'listDistrictsController',
            resolve: { commonData: function (commonData) { return commonData.asyncLoad() } }
        },
        routeEditDistrict = {
            templateUrl: 'Views/EditDistrict.html',
            controller: 'editDistrictController',
            resolve: { commonData: function (commonData) { return commonData.asyncLoad() } }
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
                logout: function ($location, Credentials, usersHolder) {
                    Credentials.clear();
                    usersHolder.removeAll();
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

app.constant("config", Object.freeze({
    baseUrl: 'https://poltava2015.azurewebsites.net',//'http://localhost:6600','http://poltava2015.azurewebsites.net', 'http://apicitizens.azurewebsites.net', #Deploy
    pageSize: 20, // by default 20
    pageSizeTabularSection: 10,
    checkDeleteItem: true,
    getExternalProviderUrl: function (provider) {
        var redirectUri = location.protocol + '//' + location.host + '/Views/AuthComplete.html';
        return this.baseUrl + "/api/Account/ExternalLogin?provider=" + provider + "&response_type=token&client_id=Citizens" + "&redirect_uri=" + redirectUri;
    },
    LOCALE_DATE_FORMAT: 'dd.MM.yyyy'
}));

app.filter('checkApartment', function () {
    return function (input) {
        return input > 0 ? ", кв." + input : '';
    };
});

app.factory("serviceUtil", ["$filter", '$routeParams', function ($filter, $routeParams) {
    return {
        getErrorMessage: function (error) {
            var errMsg, errDetail;
            if (error && error.description) errMsg = error.description;
            if (error && error.data !== "") {
                if (angular.isObject(error.data)) {
                    errDetail = error.data.error.message;
                } else {
                    errDetail = error.data;
                }
            }
            if (!errDetail) errDetail = error.statusText;
            if (errDetail && errMsg) errMsg = errMsg + " (" +errDetail + ")";
            if (errDetail && !errMsg) errMsg = errDetail;
            return errMsg;
        },
        compareByName: function (a, b) {
            return a.Name.localeCompare(b.Name);
        },
        copyProperties: function (source, destination) {
            //for (var prop in destination) {
            //    if (destination.hasOwnProperty(prop)) {
            //        var val = source[prop];
            //        if(val) destination[prop] = source[prop];
            //    }
            //}
            Object.keys(destination).forEach(function(prop) {
                var val = source[prop];
                if (val != undefined) destination[prop] = source[prop];
            });
        },
        getAddressKey: function (address) {
            return { cityId: address.CityId, streetId: address.StreetId, house: address.House };
        },
        formatDate: function (date, pattern) {
            if (angular.isString(date)) {
                var parsedDate = this.dateParse(date);
                if (parsedDate) {
                    return $filter("date")(parsedDate, pattern);
                } else {
                    return undefined;
                }
            }
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
        },
        dateParse: function (dateText) {
            if (!dateText) return undefined;
            var regex = /^(\d{2}).(\d{2}).(\d{4})/,
                maches = regex.exec(dateText);
            if (maches) {
                return new Date(maches[3], maches[2] - 1, maches[1]);
            } else {
                return undefined;
            }
        }
    };
}]);

app.run(["$rootScope", "$timeout", '$location', 'Credentials', 'checkPermissions', function ($rootScope, $timeout, $location, Credentials, checkPermissions) {
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

app.factory('commonData', ['$q', '$rootScope', 'cityData', 'streetData', 'regionPartData', 'neighborhoodData', 'serviceUtil', function ($q, $rootScope, cityData, streetData, regionPartData, neighborhoodData, serviceUtil) {

    function getPromiseAndLoadData(param) {
        var deferred = $q.defer();
        if ($rootScope[param.propName] && $rootScope[param.propName].length > 0) {
            deferred.resolve();
            return deferred.promise;
        }
        param.dataSource[param.method](function (res) {
            $rootScope[param.propName] = res.value;
            deferred.resolve();
        }, function (err) {
            err.description = param.desc + ' не завантажено';
            deferred.reject(serviceUtil.getErrorMessage(err));
        });
        return deferred.promise;
    };
    return {
        asyncLoad: function () {
            //return getDataPromise({ propName: 'cities', dataSource: cityData, method: 'getAll', desc: 'Населені пункти' })
            //    .then(function() {
            //        return getDataPromise({ propName: 'streets', dataSource: streetData, method: 'query', desc: 'Вулиці' });
            //    })
            //    .then(function() {
            //        return getDataPromise({ propName: 'regionParts', dataSource: regionPartData, method: 'getAll', desc: 'Райони' });
            //    })
            //    .then(function () {
            //        return getDataPromise({ propName: 'neighborhoods', dataSource: neighborhoodData, method: 'getAll', desc: 'Мікрорайони' });
            //    });
            var params = [
                    { propName: 'cities', dataSource: cityData, method: 'getAll', desc: 'Населені пункти' },
                    { propName: 'streets', dataSource: streetData, method: 'query', desc: 'Вулиці' },
                    { propName: 'regionParts', dataSource: regionPartData, method: 'getAll', desc: 'Райони' },
                    { propName: 'neighborhoods', dataSource: neighborhoodData, method: 'getAll', desc: 'Мікрорайони' }
                ],
                promises = [];
            params.forEach(function(param) {
                promises.push(getPromiseAndLoadData(param));
            });
            return $q.all(promises);
        }
    };
}]);

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

app.directive('datepicker', ['serviceUtil', function (serviceUtil) {
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
}]);

app.directive('accessPermissions', ['checkPermissions', function (checkPermissions) {
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
    };
}]);

app.factory('modelFactory', ['serviceUtil', function (serviceUtil) {
    // optional props have value null
    var models = {
        person: {
            "Id": 0,
            "LastName": '',
            "FirstName": '',
            "MidleName": '',
            "DateOfBirth": null,
            "Gender": null,
            "CityId": 0,
            "StreetId": 0,
            "House": '',
            "Apartment": null
        },
        precinct: {
            "Id": 0,
            "Number": 0,
            "CityId": null,
            "StreetId": null,
            "House": '',
            "RegionPartId": null,
            "lat": null,
            "lng": null,
            "location_type": '',
            "NeighborhoodId": null
        },
        precinctAddress: {
            "CityId": 0,
            "StreetId": 0,
            "House": '',
            "PrecinctId": null,
            "HouseType": null,
            "Apartments": null
        },
        city: {
            "Id": 0,
            "Name": '',
            "CityTypeId": 0,
            "IncludedToRegionPart": false,
            "RegionPartId": 0
        },
        personAdditionalProperty: {
            "PersonId": 0,
            "PropertyKeyId": 0,
            "IntValue": null,
            "StringValue": '',
            "DateTimeValue": null,
            "PropertyValueId": null
        },
        regionPart: {
            "Id": 0,
            "Name": '',
            "RegionId": 0,
            "RegionPartType": ''
        },
        street: {
            "Id": 0,
            "Name": '',
            "StreetTypeId": 0
        }
    };
    
    function EmptyModel(json) {
        angular.extend(this, json);
    };
    
    return {
        createObject: function(modelName, source) {
            var model = new EmptyModel(models[modelName]);
            if (source) {
                if (angular.isArray(source)) {
                    angular.forEach(source, function(src) {
                        serviceUtil.copyProperties(src, model);
                    });
                } else {
                    serviceUtil.copyProperties(source, model);
                }
            }
            return model;
        }
    }
}]);

//app.directive('myDatepicker', ['serviceUtil',function (serviceUtil) {
//    return {      
//        require: 'ngModel',
//        replace: true,
//        scope: {
//            ngModel: '='
//        },
//        templateUrl:'/Scripts/AngularUtils/directives/datepicker.tpl.html' ,
//        link: function (scope, element, attrs, ngModelCtrl) {
//            $('.datepicker').datepicker({
//                language: "uk"
//            });
//            $('.datepicer-icon').on('click', '.btn', function (e) {
//                $(e.delegateTarget).find('.datepicker').focus();
//            });
            
//            //ngModelCtrl.$formatters.push(function (modelValue) {
//            //    console.log("modelValue = " + modelValue);
//            //    var d = new Date(modelValue);
//            //    if (angular.isDate(d)) {
//            //        //return serviceUtil.formatDate(d,'dd.MM.yyyy');
//            //        return d;
//            //    }
//            //    return '';
//            //});

//            //ngModelCtrl.$parsers.push(function (viewValue) {
//            //    console.log('viewValue = ' + viewValue);
//            //    //if (angular.isDate(viewValue)) return viewValue;
//            //    if (angular.isString(viewValue)) {
//            //        var arrDate, day, month, year;
//            //        arrDate = viewValue.split('.');
//            //        if (arrDate && arrDate.length === 3) {
//            //            day = arrDate[0], month = arrDate[1], year = arrDate[2];
//            //            return new Date(year, month - 1, day);
//            //        }
//            //    }
//            //    return null;
//            //});

//            //scope.$watch('model', function () {
//            //    //var arrDate, mDate, day, month, year;
//            //    //if (scope.model) arrDate = scope.model.split('.');
//            //    //if (arrDate && arrDate.length === 3) {
//            //    //    day = arrDate[0], month = arrDate[1], year = arrDate[2];
//            //    //    mDate = new Date(year, month - 1, day);
//            //    //}
//            //    ngModelCtrl.$setViewValue(scope.model);
//            //    //ngModelCtrl.$render();
//            //});

//            //ngModelCtrl.$render = function () {
//            //    if (!scope.model) {
//            //        scope.model = ngModelCtrl.$viewValue;
//            //    }

//            //};
//        }
//    }
//}]);

//app.directive('datetimez', function () {
//    return {
//        restrict: 'A',
//        require: 'ngModel',
//        link: function (scope, element, attrs, ngModelCtrl) {
//            element.datetimepicker({
//                dateFormat: 'dd-MM-yyyy',
//                language: 'ru',
//                pickTime: false,
//                startDate: '01-11-2013',      // set a minimum date
//                endDate: '01-11-2030'          // set a maximum date
//            }).on('changeDate', function (e) {
//                ngModelCtrl.$setViewValue(e.date);
//                scope.$apply();
//                console.log(e);
//            });
//        }
//    };
//});