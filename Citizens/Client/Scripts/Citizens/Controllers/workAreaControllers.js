'use strict';

var workAreaControllers = angular.module('workAreaControllers', ['workAreaServices']);

workAreaControllers.controller("listWorkAreasController", ['$location', '$rootScope', '$scope', 'config', 'serviceUtil', 'workAreaResource', 'filterSettings',
    function ($location, $rootScope, $scope, config, serviceUtil, workAreaResource, filterSettings) {
        
        $rootScope.pageTitle = 'Робочі дільниці';
        $scope.tableHead = ['№', 'Номер', 'Відповідальний','К-сть фізосіб', 'Дії'];
        $scope.loader = {};

        var workAreasQuery = filterSettings.get('workAreas');
        if (workAreasQuery) {
            $scope.query = workAreasQuery;
            $scope.queryBy = Object.keys(workAreasQuery)[0];
        } else {
            $scope.query = {};
            $scope.queryBy = 'Precinct/Number';
        }

        $scope.pagination = {
            currentPage: serviceUtil.getRouteParam("currPage") || 1,
            pageSize: config.pageSize,
            totalItems: 0
        };

        function getSkip() {
            return ($scope.pagination.currentPage - 1) * $scope.pagination.pageSize || 0;
        };

        getWorkAreasPage();

        $scope.calcPeopleAtPrecincts = function () {
            if (!$scope.workAreas || $scope.workAreas.length === 0) return;
            $scope.loader.calcPeople = true;
            var precincts = $scope.workAreas.map(function(wa) {
                return {
                    CityId: 0,
                    StreetId: 0,
                    House: '',
                    PrecinctId: wa.PrecinctId
                }
            });
            workAreaResource.getCountPeopleAtPrecincts({ "Precincts": precincts }, function (resp) {
                if (resp) {
                     $scope.workAreas.forEach(function (wa) {
                         var finded = resp.value.filter(function (p) {
                            return p.PrecinctId === wa.PrecinctId;
                         })[0];
                         if (finded) wa.countPeople = finded.CountPeople;
                     });
                    $scope.loader.calcPeople = false;
                }
            },errorHandler);
        };

        function getWorkAreasPage() {
            $scope.loader.loadingWorkAreas = true;
            var filterQuery = getODataFilterQuery();
            if (filterQuery) filterQuery = "&$filter=" + filterQuery; 
            workAreaResource.getPageItems({ skip: getSkip(), filter: filterQuery }, successHandler, errorHandler);
        };

        function getODataFilterQuery() {
            var filterStr, filterPattern = "indexof(cast(:fieldName,Edm.String), ':val') ge 0";
            if ($scope.query && $scope.query[$scope.queryBy]) {
                filterStr = filterPattern.replace(':fieldName', $scope.queryBy).replace(':val', $scope.query[$scope.queryBy]);
            }
            //console.log(filterStr);
            return filterStr;
        };

        function successHandler(data) {
            $rootScope.errorMsg = '';
            $scope.loader.loadingWorkAreas = false;
            $scope.workAreas = data.value;
            $scope.pagination.totalItems = data['@odata.count'];
        };

        $scope.getIndex = function (ind) {
            return getSkip() + ind + 1;
        };

        $scope.edit = function (workArea) {
            $rootScope.errorMsg = '';
            $location.path('/work-area/' + workArea.Id + '/' + $scope.pagination.currentPage);
        };

        $scope.delete = function (workArea) {
            if (config.checkDeleteItem) {
                var ok = confirm("Увага! Робочу дільницю " + workArea.Precinct.Number + "." + workArea.Number + " буде видалено, продовжити?");
                if (!ok) return;
            }
            $rootScope.errorMsg = '';
            workAreaResource.remove({ id: workArea.Id }, function () {
                getWorkAreasPage();
            }, function(err) {
                err.description = "За робочою дільницею закріплені адреси";
                errorHandler(err);
            });
        };        

        $scope.addWorkArea = function () {
            $rootScope.errorMsg = '';
            $location.path('/work-area/new/' + $scope.pagination.currentPage);
        };

        function errorHandler(e) {
            $scope.loader = {};
            $rootScope.errorMsg = serviceUtil.getErrorMessage(e);
        };

        $scope.onPageChange = function (newPageNumber) {
            $location.path("/work-areas/" + newPageNumber);
        };

        $scope.applyFilter = function () {
            if ($scope.query[$scope.queryBy]) {
                filterSettings.set('workAreas', $scope.query);
            } else {
                filterSettings.remove('workAreas');
            }
            getWorkAreasPage();
        };
    }]);

workAreaControllers.controller("editWorkAreaController", ['$location', '$rootScope', '$scope', 'serviceUtil', 'config', 'precinctData', 'precinctAddressesData', 'resolvedData', 'workAreaResource', 'modelFactory', 'houseTypes','peopleData',
    function ($location, $rootScope, $scope, serviceUtil, config, precinctData, precinctAddressesData, resolvedData, workAreaResource, modelFactory, houseTypes,peopleData) {
        var odataFilterPattern = ":fieldName eq ':val'";

        $rootScope.pageTitle = 'Робоча дільниця';
        $scope.loader = {};

        $scope.pagination = {
            currentPage: 1,
            pageSize: config.pageSizeTabularSection
        };
        
        $scope.query = {};
        $scope.totalCount = {workArea: 0, precinct: 0};
        

        $scope.data = resolvedData;
        $scope.data.houseTypes = houseTypes;
        if (!$scope.data.precinctAddresses) $scope.data.precinctAddresses = [];

        if ($scope.data.workArea) {
            $scope.data.workArea.Top.formatedDateOfBirth = new Date($scope.data.workArea.Top.DateOfBirth).toLocaleDateString();
            serviceUtil.expandAddress($scope.data.workArea.Top);
            $scope.data.workArea.Top.address = serviceUtil.addressToString($scope.data.workArea.Top);
        }
        
        $scope.saveChanges = function () {

            if (!$scope.data.workArea.Number) {
                $rootScope.errorMsg = "Не вказано номер робочої дільницю";
                return;
            }

            if ($scope.data.workArea.Precinct && !$scope.data.workArea.Precinct.Id) {
                $rootScope.errorMsg = "Дільницю '" + $scope.data.workArea.Precinct + "' не знайдено";
                return;
            }

            if ($scope.data.workArea.Top && !$scope.data.workArea.Top.Id) {
                $rootScope.errorMsg = "Фізособу '" + $scope.data.workArea.Top + "' не знайдено";
                return;
            }

            $rootScope.errorMsg = '';
            $scope.loader.saving = true;

            var addMode = !$scope.data.workArea.Id;
            var modelWorkArea = modelFactory.createObject('workArea', $scope.data.workArea);
            modelWorkArea.PrecinctId = $scope.data.workArea.Precinct.Id;
            modelWorkArea.TopId = $scope.data.workArea.Top.Id;

            if (addMode) {
                workAreaResource.save(modelWorkArea, updatePrecinctAddresses, errorHandler);
            } else {
                workAreaResource.update({ id: $scope.data.workArea.Id }, modelWorkArea, updatePrecinctAddresses, errorHandler);
            }

            function updatePrecinctAddresses(newWorkArea) {
                if (addMode) {
                    $scope.data.workArea.Id = newWorkArea.Id;
                    $scope.data.workAreaId = newWorkArea.Id;//don't remove
                }
                var addressesForUpdate = $scope.data.precinctAddresses.filter(function(a) {
                    return a.isDeselected || a.isSelected;
                });
                var count = 0, total = addressesForUpdate.length;
                if (total === 0) {
                    successHandler();
                    return;
                }
                addressesForUpdate.forEach(function (address) {
                    var modelAddress = modelFactory.createObject("precinctAddress", address);
                    if (address.isDeselected) modelAddress.WorkAreaId = null;
                    if (address.isSelected) modelAddress.WorkAreaId = $scope.data.workArea.Id;

                    precinctAddressesData.update(serviceUtil.getAddressKey(modelAddress), modelAddress, function(resp) {
                        address.WorkAreaId = resp.WorkAreaId;
                        address.isDeselected = false;
                        address.isSelected = false;
                        count++;
                        if (count === total) successHandler();
                    }, errorHandler);
                });
            };

            function successHandler() {
                $scope.loader.saving = false;
                $rootScope.successMsg = addMode ? 'Робочу дільницю успішно створено!' : 'Зміни успішно збережено!';
                addMode = false;
            };
        };

        function errorHandler(e) {
            $scope.loader = {};
            $rootScope.errorMsg = serviceUtil.getErrorMessage(e);
        };

        $scope.backToList = function () {
            $rootScope.errorMsg = '';
            var currPage = serviceUtil.getRouteParam("currPage") || 1;
            $location.path('/work-areas/' + currPage);
        };

        $scope.getIndex = function (ind) {
            return ($scope.pagination.currentPage - 1) * $scope.pagination.pageSize + ind;
        };

        $scope.onPageChange = function(newPageNumber) {
            $scope.pagination.currentPage = newPageNumber;
        };

        $scope.onDblClickThead = function (propName) {
            if (!$scope.theadEditing) {
                $scope.theadEditing = {};
            }
            $scope.theadEditing[propName] = true;
        };

        $scope.doneEditingThead = function (propName) {
            $scope.theadEditing[propName] = false;
            $scope.query[propName] = $;
        };

        $scope.checked = function(address) {
            return (address.WorkAreaId && address.WorkAreaId === $scope.data.workArea.Id) | address.isSelected;
        };

        $scope.toggleSelection = function (address) {
            if (address.WorkAreaId && address.WorkAreaId === $scope.data.workArea.Id) {
                address.isDeselected = address.isDeselected ? false : true;
                if (address.countPeople) {
                    if (address.isDeselected) {
                        $scope.totalCount.workArea -= address.countPeople;
                    } else {
                        $scope.totalCount.workArea += address.countPeople;
                    }
                }
                
            } else {
                address.isSelected = address.isSelected ? false : true;
                if (address.countPeople) {
                    if (address.isSelected) {
                        $scope.totalCount.workArea += address.countPeople;
                    } else {
                        $scope.totalCount.workArea -= address.countPeople;
                    }
                }
            }
        };

        $scope.markAddress = function (address) {
            if (address.WorkAreaId && address.WorkAreaId === $scope.data.workArea.Id) {
                return address.isDeselected ? "alert-danger" : "alert-success";
            } else {
                return address.isSelected ? "alert-warning" : "";
            }
        };

        $scope.getPeopleByName = function (viewValue) {
            var names = viewValue.split(" "), filterQuery;
            if (names.length < 3) return [];
            var name = {
                LastName: names[0],
                FirstName: names[1],
                MidleName: names[2]
            };
            Object.keys(name).forEach(function(prop) {
                filterQuery = filterQuery ? filterQuery + " and " : "&$filter=";
                filterQuery = filterQuery + odataFilterPattern
                    .replace(/:fieldName/g, prop)
                    .replace(/:val/g, name[prop]);
            });
            return peopleData.getPageItems({ skip: 0, filter: filterQuery }).$promise.then(function(res) {
                return res.value.map(function (person) {
                    person.formatedDateOfBirth = new Date(person.DateOfBirth).toLocaleDateString();
                    serviceUtil.expandAddress(person);
                    person.address = serviceUtil.addressToString(person);
                    return person;
                });
            });
        };

        $scope.onSelectPrecinct = function(item) {
            $scope.loader.loadingPrecinctAddresses = true;
            precinctAddressesData.getAllByPrecinctId({ precinctId: item.Id }, function(res) {
                $scope.loader.loadingPrecinctAddresses = false;
                serviceUtil.sortAddresses(res.value);
                $scope.data.precinctAddresses = res.value;
                $scope.totalCount = {};
            }, function(err) {
                $scope.data.precinctAddresses = [];
                errorHandler(err);
            });
        };

        $scope.calcPeopleAtAddresses = function () {
            if (!$scope.data.precinctAddresses || $scope.data.precinctAddresses.length === 0) return;
            $scope.loader.calcPeople = true;
            $scope.totalCount.workArea = 0;
            $scope.totalCount.precinct = 0;
            var addresses = $scope.data.precinctAddresses.map(function (a) {
                return {
                    CityId: a.CityId,
                    StreetId: a.StreetId,
                    House: a.House,
                    PrecinctId: 0
                }
            });
            workAreaResource.getCountPeopleAtAddresses({ "Addresses": addresses }, function (resp) {
                if (resp) {
                    $scope.data.precinctAddresses.forEach(function (a) {
                         var finded = resp.value.filter(function (c) {
                            return c.CityId === a.CityId && c.StreetId === a.StreetId && c.House.toLocaleLowerCase() === a.House.toLocaleLowerCase();
                         })[0];
                         if (finded) {
                             a.countPeople = finded.CountPeople;
                             if (a.WorkAreaId === $scope.data.workArea.Id) $scope.totalCount.workArea += finded.CountPeople;
                             $scope.totalCount.precinct += finded.CountPeople;
                         }
                    });
                    $scope.loader.calcPeople = false;
                }
            }, errorHandler);
        };
    }]);
