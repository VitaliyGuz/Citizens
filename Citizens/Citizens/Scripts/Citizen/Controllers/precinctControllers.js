﻿'use strict';

var precinctControllers = angular.module('precinctControllers', ['ngRoute','streetServices', 'precinctServices', 'cityServices', 'regionPartServices', 'angularUtils.directives.dirPagination', 'appCitizen', 'scrollable-table', 'ui.bootstrap']);

precinctControllers.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
        when('/list', {
            templateUrl: '/Precincts/ListPrecincts',
            controller: 'listController'
        }).
        when('/new', {
            templateUrl: '/Precincts/EditPrecinct',
            controller: 'editController'
        }).
        when('/edit/:id', {
            templateUrl: '/Precincts/EditPrecinct',
            controller: 'editController'
        }).
        otherwise({
            redirectTo: 'list'
        });
}]);

precinctControllers.controller("listController", ['$location',  '$rootScope', '$scope', 'config', 'serviceUtil', 'precinctData', '$timeout',
    function ($location, $rootScope, $scope, config, serviceUtil, precinctData, $timeout) {
        
        $rootScope.errorMsg = '';
        $rootScope.successMsg = '';

        $scope.query = {};
        $scope.options = [
              { value: "Id", desc: "Дільниця"},
              { value: "City.Name", desc: "Населений пункт" },
              { value: "Street.Name", desc: "Вулиця" },
              { value: "House", desc: "Буд" },
              { value: "District.Id", desc: "Округ" }
        ];
        $scope.queryBy = 'Id';

        $scope.currentPage = 1;
        $scope.pageSize = config.pageSize;
        $scope.pageSizeTS = config.pageSizeTabularSection;

        $scope.tableHead = ['№', 'Дільниця', 'Адреса', 'Округ', 'Дії'];

        $scope.getIndex = function (precinct) {
            return $rootScope.precincts.indexOf(precinct);
        };

        if (!$rootScope.precincts || $rootScope.precincts.length === 0) {
            $scope.loading = true;
            precinctData.getAll(function (precincts) {
                $rootScope.precincts = precincts.value;
                $scope.loading = false;
            },errorHandler);
        }

        $scope.edit = function (precinct) {
            $rootScope.editInd = $scope.getIndex(precinct);
            $location.path('edit/' + precinct.Id);
        };

        $scope.delete = function (precinct) {
            if (config.checkDeleteItem) {
                var ok = confirm("Увага! Дільницю буде видалено, продовжити?");
                if (!ok) return;
            }
            precinctData.remove({ id: precinct.Id },
                function () {
                    $rootScope.precincts.splice($scope.getIndex(precinct), 1);
                }, errorHandler);
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

        $scope.addNewPrecinct = function () {
            $location.path('new');
        };

        function errorHandler(e) {
            $scope.loading = false;
            $rootScope.errorMsg = serviceUtil.getErrorMessage(e);
        };

    }]);

precinctControllers.controller("editController", ['$timeout', '$location', '$rootScope', '$scope', '$routeParams', 'serviceUtil', 'config', 'precinctData', 'streetData', 'cityData', 'districtData', 'precinctAddressesData', 'regionPartData',
    function ($timeout, $location, $rootScope, $scope, $routeParams, serviceUtil, config, precinctData, streetData, cityData, districtData, precinctAddressesData, regionPartData) {
        var copyAddressMode, editableAddress;
        $scope.loading = true;
        $scope.saving = false;
        $scope.savingAddress = false;
        $scope.changingPresinct = false;
        $scope.addMode = true;
        $rootScope.errorMsg = '';
        $rootScope.successMsg = '';

        $scope.query = {};
        $scope.options = [
              { value: "City.Name", desc: "Населений пункт" },
              { value: "Street.Name", desc: "Вулиця" },
              { value: "House", desc: "Буд" }
        ];
        $scope.queryBy = 'City.Name';

        $scope.precinctAddresses = [];
        $scope.selected = { precinct: {}, address: {}  };
        $scope.autocomplete = {};
        $scope.precinct = {};

        if ($routeParams.id) {
            $scope.loading = true;
            precinctData.getById({ id: $routeParams.id }, function (res) {
                $scope.loading = false;
                $scope.addMode = false;
                $scope.precinct = res;
                $scope.precinct.Number = res.Id;
                $scope.precinctAddresses = res.PrecinctAddresses;
                //$scope.precinctAddresses.sort(compareAddresses);
                sortAddresses($scope.precinctAddresses);
            }, errorHandler);
        }

        if (!$rootScope.precincts || $rootScope.precincts.length === 0) {
            $scope.loading = true;
            precinctData.getAll(function (precincts) {
                $rootScope.precincts = precincts.value;
                $scope.loading = false;
            }, errorHandler);
        }

        $scope.loading = true;
        districtData.query(function (districts) {
            $scope.districts = districts.value;
            $scope.loading = false;
        }, errorHandler);

        $scope.loading = true;
        streetData.query(function (streets) {
            $scope.streets = streets.value;
            $scope.loading = false;
        }, errorHandler);

        $scope.loading = true;
        cityData.getAll(function (cities) {
            $scope.cities = cities.value;
            $scope.loading = false;
        }, errorHandler);

        $scope.loading = true;
        regionPartData.query(function (regionParts) {
            $scope.regionParts = regionParts.value;
            $scope.loading = false;
        }, errorHandler);

        $scope.editAddress = function (address) {
            editableAddress = address;
            $scope.addAddressMode = false;
            precinctAddressesData.query(serviceUtil.getAddressKey(address), function (res) {
                $scope.selected.address = res;
            }, errorHandler);
        };

        $scope.deleteAddress = function (address, ind) {
            if (config.checkDeleteItem) {
                var ok = confirm("Увага! Адресу дільниці буде видалено, продовжити?");
                if (!ok) return;
            }
            precinctAddressesData.remove(serviceUtil.getAddressKey(address),
                function () {
                    $scope.precinctAddresses.splice(ind, 1);
                }, errorHandler);
        };

        $scope.save = function () {

            if (!$scope.precinct.CityId) {
                $rootScope.errorMsg = "Населений пункт '" + $scope.precinct.City + "' не знайдено";
                return;
            }

            if (!$scope.precinct.StreetId) {
                $rootScope.errorMsg = "Вулицю '" + $scope.precinct.Street + "' не знайдено";
                return;
            }

            if (!$scope.precinct.RegionPartId) {
                $rootScope.errorMsg = "Район '" + $scope.precinct.RegionPart + "' не знайдено";
                return;
            }

            $scope.saving = true;
            var precinct = {
                "Id": 0,
                "CityId": 0,
                "StreetId": 0,
                "House": '',
                "DistrictId": 0,
                "RegionPartId": 0
            };

            serviceUtil.copyProperties($scope.precinct, precinct);
            if ($scope.addMode) {
                precinct.Id = $scope.precinct.Number;
                precinctData.save(precinct, function (newItem) {
                    successHandler({ id: newItem.Id });
                }, errorHandler);
            } else {
                precinctData.update({ id: $scope.precinct.Id }, precinct, function () {
                    successHandler({ id: $scope.precinct.Id });
                }, errorHandler);
            }
            function successHandler(obj) {
                precinctData.getById(obj, function (res) {
                    $scope.saving = false;
                    if ($scope.addMode) {
                        $scope.addMode = false;
                        $rootScope.precincts.push(res);
                        $scope.precinct = res;
                        $scope.precinct.Number = res.Id;
                        $rootScope.successMsg = 'Дільницю успішно створено!';
                    } else {
                        $rootScope.precincts[$rootScope.editInd] = res;
                        $rootScope.successMsg = 'Зміни успішно збережено!';
                    }
                    $rootScope.precincts.sort(comparePrecinct);
                }, errorHandler);
            };
        };

        function comparePrecinct(p1, p2) {
            if (p1.Id > p2.Id) {
                return 1;
            } else if (p1.Id < p2.Id) {
                return -1;
            } else {
                return 0;
            }
        };

        $scope.saveAddress = function (oldValue, ind) {

            if (!$scope.precinct.Id) {
                $rootScope.errorMsg = "Спочатку необхідно зберегти дільницю";
                return;
            }

            if (!$scope.selected.address.CityId) {
                $rootScope.errorMsg = "Населений пункт '" + $scope.selected.address.City + "' не знайдено";
                return;
            }

            if (!$scope.selected.address.StreetId && $scope.selected.address.Street) {
                $rootScope.errorMsg = "Вулицю '" + $scope.selected.address.Street + "' не знайдено";
                return;
            }

            $scope.savingAddress = true;
            // todo: factory method
            var address = {
                "CityId": 0,
                "StreetId": 0,
                "House": '',
                "PrecinctId": 0
            };
            serviceUtil.copyProperties($scope.selected.address, address);
            address.PrecinctId = $scope.precinct.Id;
            if ($scope.addAddressMode || copyAddressMode) {
                saveAddressData(address);
            } else {
                precinctAddressesData.remove(serviceUtil.getAddressKey(oldValue),
                    function () {
                        saveAddressData(address, ind);
                    }, errorHandler);
            }

            function saveAddressData(data, i) {
                precinctAddressesData.save(data,
                    function (saved) {
                        precinctAddressesData.query(serviceUtil.getAddressKey(saved), function (res) {
                            $scope.savingAddress = false;
                            $scope.savingAddresses = false;
                            if (i == undefined) {
                                $scope.precinctAddresses.push(res);
                            } else {
                                $scope.precinctAddresses[i] = res;
                            }
                            //$scope.precinctAddresses.sort(compareAddresses);
                            sortAddresses($scope.precinctAddresses);
                            $scope.resetAddress();
                        }, errorHandler);
                    }, errorHandler);
            };
        };

        $scope.addNewAddress = function () {
            $scope.resetAddress();
            $scope.addAddressMode = true;
            if ($scope.precinct.City) {
                $scope.selected.address.City = $scope.precinct.City;
                $scope.selected.address.CityId = $scope.precinct.City.Id;
            }
        };

        $scope.getTemplate = function (address) {
            if (address === editableAddress) {
                return $scope.changingPresinct ? 'changePresinct' : 'edit';
            } else return 'display';
        };

        $scope.resetAddress = function () {
            $scope.addAddressMode = false;
            $scope.changingPresinct = false;
            $scope.selected.address = {};
            $scope.selected.newPrecinct = '';
            $scope.selected.newPrecinctId = 0;
            if (copyAddressMode) {
                var findInd = $scope.precinctAddresses.indexOf(editableAddress);
                if (findInd >= 0) {
                    $scope.precinctAddresses.splice(findInd, 1);
                }
            }
            copyAddressMode = false;
            editableAddress = undefined;
        };

        function errorHandler(e) {
            //$scope.successMsg = '';
            $scope.saving = false;
            $scope.savingAddress = false;
            $scope.savingAddresses = false;
            $scope.loading = false;
            $scope.resetAddress();
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
        $scope.backToList = function () {
            $location.path('/list');
        };

        $scope.autoCompleteAddresses = function () {
            if (!$scope.precinct.Id) {
                $rootScope.errorMsg = "Спочатку необхідно зберегти дільницю";
                return;
            }

            if (!$scope.autocomplete.CityId) {
                $rootScope.errorMsg = "Населений пункт '" + $scope.autocomplete.City + "' не знайдено";
                return;
            }

            if (!$scope.autocomplete.StreetId) {
                $rootScope.errorMsg = "Вулицю '" + $scope.autocomplete.Street + "' не знайдено";
                return;
            }

            var startNumb, endNumb;
            startNumb = parseInt($scope.autocomplete.HouseFrom);
            endNumb = parseInt($scope.autocomplete.HouseTo);
            if (startNumb > endNumb || startNumb <= 0 || endNumb <= 0) {
                alert("Не вірно заданий інтервал номерів будинків!");
                return;
            }

            var ok = confirm("Буде створено " + (endNumb - startNumb + 1) + " адрес. Продовжити?");
            if (!ok) return;

            function Address(house) {
                this.CityId = $scope.autocomplete.CityId,
                this.StreetId = $scope.autocomplete.StreetId,
                this.House = house.toString(),
                this.PrecinctId = $scope.precinct.Id;
            };

            function getArrayAddresses() {
                var arr = [], houseNumb;
                houseNumb = startNumb;
                while (houseNumb <= endNumb) {
                    arr.push(new Address(houseNumb));
                    houseNumb++;
                }
                return arr;
            };

            $scope.savingAddresses = true;
            precinctData.saveAll({ PrecinctAddresses: getArrayAddresses() }, function () {
                precinctData.getById({ id: $scope.precinct.Id }, function (res) {
                    $scope.savingAddresses = false;
                    $scope.precinctAddresses = res.PrecinctAddresses;
                    //$scope.precinctAddresses.sort(compareAddresses);
                    sortAddresses($scope.precinctAddresses);
                }, errorHandler);
            }, errorHandler);
        };

        function sortAddresses(addresses) {
            function compareAddressesWithHouse(a1, a2) {
                var compCity, compStreet, compHouse, compTypeStreet, h1, h2;
                compCity = serviceUtil.compareByName(a1.City, a2.City);
                compStreet = serviceUtil.compareByName(a1.Street, a2.Street);
                compTypeStreet = serviceUtil.compareByName(a1.Street.StreetType, a2.Street.StreetType);
                h1 = parseInt(a1.House);
                h2 = parseInt(a2.House);
                compHouse = h1 > h2 ? 1 : h1 < h2 ? -1 : 0;
                if (compCity === 0) {
                    if (compStreet === 0) {
                        if (compTypeStreet === 0) {
                            return compHouse;
                        } else {
                            return compTypeStreet;
                        }
                    } else {
                        return compStreet;
                    }
                } else {
                    return compCity;
                }
            };
            if (addresses) {
                addresses.sort(function (a1, a2) {
                    var compCity, compStreet, compTypeStreet;
                    compCity = serviceUtil.compareByName(a1.City, a2.City);
                    compStreet = serviceUtil.compareByName(a1.Street, a2.Street);
                    compTypeStreet = serviceUtil.compareByName(a1.Street.StreetType, a2.Street.StreetType);
                    if (compCity === 0) {
                        if (compStreet === 0) {
                            return compTypeStreet;
                        } else {
                            return compStreet;
                        }
                    } else {
                        return compCity;
                    }
                });
                addresses.sort(compareAddressesWithHouse);
            }
        };

        $scope.onSelectStreet = function ($item, $model, $label, model) {
            model.Street = $item;
            model.StreetId = $model;
        };

        $scope.onSelectCity = function ($item, $model, $label, model) {
            model.City = $item;
            model.CityId = $model;
        };

        $scope.onSelectPrecinctNumber = function ($item, $model, $label) {
            $scope.selected.newPrecinct = $item;
            $scope.selected.newPrecinctId = $model;
        };

        $scope.onSelectRegionPart = function ($item, $model, $label) {
            $scope.precinct.RegionPart = $item;
            $scope.precinct.RegionPartId = $model;
        };

        $scope.changePrecinct = function (address) {
            $scope.changingPresinct = true;
            editableAddress = address;
        };

        $scope.saveChangesPrecinct = function (selectedAddress, ind) {
            if (!$scope.selected.newPrecinctId) {
                $rootScope.errorMsg = "Не вірний номер дільниці";
                return;
            };
            // todo: factory method
            var address = {
                "CityId": 0,
                "StreetId": 0,
                "House": '',
                "PrecinctId": 0
            };
            $scope.savingAddress = true;
            serviceUtil.copyProperties(selectedAddress, address);
            address.PrecinctId = $scope.selected.newPrecinctId;
            precinctAddressesData.changePrecinct(serviceUtil.getAddressKey(address), address, function () {
                $scope.changingPresinct = false;
                $scope.savingAddress = false;
                $scope.resetAddress();
                $scope.precinctAddresses.splice(ind, 1);
            }, errorHandler);
        };

        $scope.copyAddress = function (address, ind) {
            copyAddressMode = true;
            var countDeleted = 0,
                findInd = $scope.precinctAddresses.indexOf(editableAddress);
            if (findInd >= 0) {
                var deleted = $scope.precinctAddresses.splice(findInd, 1);
                if (findInd < ind) countDeleted = deleted.length;
            }
            var copiedAddress = {
                CityId: address.City.Id,
                City: address.City,
                StreetId: address.Street.Id,
                Street: address.Street,
                House: address.House,
                PrecinctId: address.PrecinctId
            };
            $scope.precinctAddresses.splice(ind - countDeleted + 1, 0, copiedAddress);
            $scope.editAddress(copiedAddress);
        };
    }]);