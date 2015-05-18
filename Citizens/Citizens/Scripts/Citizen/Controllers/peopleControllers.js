'use strict';

var peopleControllers = angular.module('peopleControllers', ['peopleServices', 'streetServices', 'cityServices','precinctServices','angularUtils.directives.dirPagination', 'appCitizen']);

peopleControllers.controller("listController", ['$scope', 'peopleData', 'streetData', 'cityData', 'config', 'serviceUtil', '$filter', '$timeout', 'precinctData', 'precinctAddressesData',
    function ($scope, peopleData, streetData, cityData, config, serviceUtil, $filter, $timeout, precinctData, precinctAddressesData) {
        var editInd;
        $scope.loading = true;
        $scope.saving = false;

        $scope.query = {};

        $scope.errorMsg = '';
        $scope.successMsg = '';

        $scope.currentPage = 1;
        $scope.pageSize = config.pageSize;
        $scope.totalItems = 0;

        $scope.peoples = [];
        $scope.selected = { people: {} , DateOfBirth:''};
        $scope.tableHead = ['№', 'Прізвище', "Ім'я", 'По-батькові', 'Дата народж.', 'Стать', 'Нас. пункт', 'Вулиця', 'Буд.', 'Кв.','Дільниця', 'Дії'];

        $scope.getIndex = function (ind) {
            return ($scope.currentPage - 1) * config.pageSize + ind + 1;
        }

        setPeopleOnPage();

        $scope.loading = true;
        streetData.query(function (streets) {
            $scope.streets = streets.value;
            $scope.loading = false;
        }, errorHandler);

        $scope.loading = true;
        cityData.query(function (cities) {
            $scope.cities = cities.value;
            $scope.loading = false;
        }, errorHandler);

        $scope.edit = function (people) {
            //$scope.errorMsg = '';
            //editInd = $scope.getIndex(people);
            peopleData.query({ id: people.Id }, function (res) {
                $scope.selected.people = res;
                $scope.selected.DateOfBirth = new Date(res.DateOfBirth);
                $scope.selected.people.PrecinctId = res.PrecinctAddress.PrecinctId;
            }, errorHandler);
        }

        $scope.delete = function (people) {
            //$scope.errorMsg = '';
            peopleData.remove({ id: people.Id },
                function () {
                    //$scope.peoples.splice($scope.getIndex(people), 1);
                    setPeopleOnPage(($scope.currentPage - 1) * config.pageSize);
                }, errorHandler);
        }

        $scope.save = function () {
            if ($scope.selected.people.PrecinctId == 0) {
                $scope.errorMsg = 'Не вірний номер дільниці';
                return;
            };
            $scope.saving = true;
            // todo: factory method
            var people = {
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
            serviceUtil.copyProperties($scope.selected.people, people);
            serviceUtil.copyProperties(people, precinctAddress);
            precinctAddress.PrecinctId = $scope.selected.people.PrecinctId;
            people.DateOfBirth = $filter('date') ($scope.selected.DateOfBirth, 'yyyy-MM-ddT00:00:00');
            if (people.Apartment == undefined) people.Apartment = null;

            precinctData.getByIdNotExpand({ id: precinctAddress.PrecinctId }, function () {
                    savePrecinctAddress();
                }, function () {
                    precinctData.save({"Id": precinctAddress.PrecinctId}, function () {
                        savePrecinctAddress();
                }, errorHandler);
            });

            function savePrecinctAddress() {
                var addressKey = { cityId: precinctAddress.CityId, streetId: precinctAddress.StreetId, house: precinctAddress.House };
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
                if ($scope.addMode) {
                    peopleData.save(people, function () {
                        setPeopleOnPage(($scope.currentPage - 1) * config.pageSize);
                        //peopleData.query({ id: newItem.Id }, function (res) {
                        //$scope.saving = false;
                        //$scope.peoples.push(res);
                        // $scope.reset();
                        //}, errorHandler);
                    }, errorHandler);
                } else {
                    peopleData.update({ id: $scope.selected.people.Id
                    }, people, function () {
                        setPeopleOnPage(($scope.currentPage - 1) * config.pageSize);
                        //peopleData.query({ id: $scope.selected.people.Id }, function (res) {
                        //$scope.saving = false;
                        //$scope.peoples[editInd] = res;
                        //$scope.reset();
                        //}, errorHandler);
                    }, errorHandler);
                }
            };
        };

        $scope.addNew = function () {
            $scope.addMode = true;
        };

        $scope.getTemplate = function (people, colName) {
            if (people.Id === $scope.selected.people.Id) return 'edit' +colName;
            else return 'display' + colName;
        };

        $scope.reset = function () {    
            $scope.addMode = false;
            $scope.selected.people = {};
            $scope.selected.DateOfBirth = '';
        };

        function errorHandler(e) {
            $scope.saving = false;
            $scope.loading = false;
            $scope.reset();
            $scope.errorMsg = serviceUtil.getErrorMessage(e);
        };

        function closeAlertAtTimeout() {
            $timeout(function () {
                $scope.successMsg = '';
                $scope.errorMsg = '';
            }, 2000);
        };

        $scope.$watch('successMsg + errorMsg', function (newValue) {
            if (newValue.length > 0) {
                closeAlertAtTimeout();
            }
        });
        
        $scope.onPageChange = function (newPageNumber) {
            var skipItems;
            skipItems = (newPageNumber - 1) * config.pageSize;
            setPeopleOnPage(skipItems);
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
            $scope.peoples = data.value;
            $scope.totalItems = data['odata.count'];
            $scope.loading = false;
            $scope.saving = false;
            $scope.reset();
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

        //$scope.$watch('query.LastName', function (newValue) {
        //    console.log(newValue);
        //});
        
    }]);
