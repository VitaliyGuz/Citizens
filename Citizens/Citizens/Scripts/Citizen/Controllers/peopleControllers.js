'use strict';

var peopleModule = angular.module('peopleModule', ['peopleServices', 'streetServices', 'cityServices', 'precinctServices', 'angularUtils.directives.dirPagination', 'appCitizen', 'ngRoute', 'ui.bootstrap']);

peopleModule.config(['$routeProvider', function ($routeProvider) {
        $routeProvider.
            when('/list', {
                templateUrl: '/People/ListPeople',
                controller: 'listController'
            }).
            when('/new', {
                templateUrl: '/People/EditPerson',
                controller: 'editController'
            }).
            when('/edit/:id', {
                templateUrl: '/People/EditPerson',
                controller: 'editController'
            }).
            otherwise({
                redirectTo : 'list'
            });
    }]);


peopleModule.controller("listController", ['$rootScope','$scope','$location', 'peopleData', 'config', 'serviceUtil', '$timeout',
    function ($rootScope, $scope, $location, peopleData, config, serviceUtil, $timeout) {
        $scope.loading = true;
        $scope.saving = false;

        $scope.query = {};

        $rootScope.errorMsg = '';
        $rootScope.successMsg = '';

        if (!$rootScope.currentPage) {
            $rootScope.currentPage = 1;
        }
        $scope.pageSize = config.pageSize;
        $scope.totalItems = 0;

        $scope.people = [];
        $scope.tableHead = ['№', 'П.І.Б.', 'Дата народження', 'Адреса','Дільниця', 'Дії'];

        $scope.getIndex = function (ind) {
            return ($rootScope.currentPage - 1) * config.pageSize + ind + 1;
        }
        
        setPeopleOnPage(($rootScope.currentPage - 1) * config.pageSize);

        $scope.edit = function (person) {
            $location.path('edit/' + person.Id);
        };

        $scope.delete = function (people) {
            peopleData.remove({ id: people.Id },
                function () {
                    setPeopleOnPage(($rootScope.currentPage - 1) * config.pageSize);
                }, errorHandler);
        };

        $scope.addNew = function () {
            $location.path('new');
        };

        function errorHandler(e) {
            $scope.loading = false;
            $rootScope.errorMsg = serviceUtil.getErrorMessage(e);
        };

        function closeAlertAtTimeout() {
            $timeout(function () {
                $rootScope.successMsg = '';
                $rootScope.errorMsg = '';
            }, 2000);
        };

        $scope.$watch('successMsg + errorMsg', function (newValue) {
            if (newValue.length > 0) {
                closeAlertAtTimeout();
            }
        });
        
        $scope.onPageChange = function (newPageNumber) {
            $rootScope.currentPage = newPageNumber;
            setPeopleOnPage((newPageNumber - 1) * config.pageSize);
        };
        
        function setPeopleOnPage(skipItems) {
            var filterString = getFilterString();
            if (skipItems == undefined) skipItems = 0;
            if (filterString.length === 0) {
                peopleData.getPageItems({ skip: skipItems }, successHandler, errorHandler);
            } else {
                peopleData.getFilteredPageItems({ skip: skipItems, filter: filterString }, successHandler, errorHandler);
            }
        };
        
        function successHandler(data) {
            $scope.loading = false;
            $scope.people = data.value;
            $scope.totalItems = data['@odata.count'];
        };

        function getFilterString() {
            var filterStr = '',
                filterQuery = $scope.filterQuery,
                filterPattern = "startswith(tolower(:prop), ':val') eq true";

            for (var prop in filterQuery) {
                if (filterQuery.hasOwnProperty(prop)) {
                    var val = filterQuery[prop];
                    if (val == undefined || val.length === 0) continue;
                    if (filterStr.length > 0) {
                        filterStr = filterStr + " and ";
                    }
                    filterStr = filterStr + filterPattern.replace(':prop', prop).replace(':val', val.toLowerCase());
                }
            }
            return filterStr;
        };

        $scope.onFilterChange = function () {
            setPeopleOnPage();
        };
        
    }]);

peopleModule.controller('editController',['$timeout','$filter','$rootScope','$scope','$location','$routeParams','streetData','cityData','peopleData','serviceUtil', 'precinctData', 'precinctAddressesData',
    function ($timeout,$filter, $rootScope, $scope, $location, $routeParams, streetData, cityData, peopleData, serviceUtil, precinctData, precinctAddressesData) {
        var addMode;
        $rootScope.errorMsg = '';
        $rootScope.successMsg = '';
        addMode = true;

        $scope.loading = true;
        streetData.query(function (streets) {
            $scope.loading = false;
            $scope.streets = streets.value;
        }, errorHandler);

        $scope.loading = true;
        cityData.getAll(function (cities) {
            $scope.loading = false;
            $scope.cities = cities.value;
        }, errorHandler);

        $scope.loading = true;
        precinctData.getAll(function (precincts) {
            $scope.loading = false;
            $scope.precincts = precincts.value;
        }, errorHandler);

        if ($routeParams.id != undefined) {
            $scope.loading = true;
            peopleData.query({ id: $routeParams.id }, function (res) {
                $scope.loading = false;
                addMode = false;
                $scope.person = res;
                $scope.dateOfBirth = new Date(res.DateOfBirth);
                $scope.person.PrecinctId = res.PrecinctAddress.PrecinctId;
            }, errorHandler);
        }

        function errorHandler(e) {
            $scope.loading = false;
            $scope.saving = false;
            $rootScope.errorMsg = serviceUtil.getErrorMessage(e);
        };

        $scope.save = function () {
            if (!$scope.person.PrecinctId) {
                $rootScope.errorMsg = 'Не вірний номер дільниці';
                return;
            };

            if (!$scope.person.CityId) {
                $rootScope.errorMsg = "Населений пункт '" + $scope.person.City + "' не знайдено";
                return;
            };

            if (!$scope.person.StreetId) {
                $rootScope.errorMsg = "Вулицю '" + $scope.person.Street + "' не знайдено";
                return;
            };

            $scope.saving = true;
            // todo: factory method
            var person = {
                "Id": 0,
                "LastName": '',
                "FirstName": '',
                "MidleName": '',
                "DateOfBirth": '',
                "Gender": 0,
                "CityId": 0,
                "StreetId": 0,
                "House": '',
                "Apartment": 0
            },
            // todo: factory method
            precinctAddress =  {
                "CityId": 0,
                "StreetId": 0,
                "House": '',
                "PrecinctId": 0
            };
            serviceUtil.copyProperties($scope.person, person);
            serviceUtil.copyProperties(person, precinctAddress);
            precinctAddress.PrecinctId = $scope.person.PrecinctId;
            person.DateOfBirth = $filter('date')($scope.dateOfBirth, 'yyyy-MM-ddT00:00:00+00:00');
            if (!person.Apartment) person.Apartment = null;

            precinctData.getByIdNotExpand({ id: precinctAddress.PrecinctId }, function () {
                    savePrecinctAddress();
                }, function () {
                    precinctData.save({"Id": precinctAddress.PrecinctId}, function () {
                        savePrecinctAddress();
                }, errorHandler);
            });

            function savePrecinctAddress() {
                var addressKey = serviceUtil.getAddressKey(precinctAddress);
                precinctAddressesData.query(addressKey, function (success) {
                    if(precinctAddress.PrecinctId === success.PrecinctId) {
                        savePerson();
                    } else {
                        precinctAddressesData.changePrecinct(addressKey, precinctAddress, function () {
                            savePerson();
                        }, errorHandler);
                    }
                }, function () {
                    precinctAddressesData.save(precinctAddress, function () {
                        savePerson();
                    }, errorHandler);
                });
            };

            function savePerson() {
                if (addMode) {
                    peopleData.save(person, function () {
                        $scope.saving = false;
                        $rootScope.successMsg = "Фізичну особу створено успішно!";
                    }, errorHandler);
                } else {
                    peopleData.update({ id: $scope.person.Id }, person, function () {
                        $scope.saving = false;
                        $rootScope.successMsg = "Зміни успішно збережено!";
                    }, errorHandler);
                }
            };
        };

        function closeAlertAtTimeout() {
            $timeout(function () {
                $rootScope.successMsg = '';
                $rootScope.errorMsg = '';
            }, 2000);
        };

        $scope.$watch('successMsg + errorMsg', function (newValue) {
            if (newValue.length > 0) {
                closeAlertAtTimeout();
            }
        });

        $scope.backToList = function () {
            $location.path('list');
        };

        $scope.onSelectStreet = function ($item, $model, $label) {
            $scope.person.Street = $item;
            $scope.person.StreetId = $model;
        };

        $scope.onSelectCity = function ($item, $model, $label) {
            $scope.person.City = $item;
            $scope.person.CityId = $model;
        };

        $scope.onSelectPrecinctNumber = function ($item, $model, $label) {
            $scope.person.PrecinctId = $model;
        };
}]);
