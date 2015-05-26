'use strict';

var precinctControllers = angular.module('precinctControllers', ['streetServices', 'precinctServices', 'cityServices', 'regionPartServices', 'angularUtils.directives.dirPagination', 'appCitizen', 'scrollable-table', 'ui.bootstrap']);

precinctControllers.filter('optionsForAddresses', function () {
    return function (input, useFilter) {
        var out = [];
        if (!useFilter) return input;
        for (var i = 0; i < input.length; i++) {
            if (input[i].forAddresses) {
                out.push(input[i]);
            }
        }
        return out;
    }
})

precinctControllers.controller("listController", ['$scope', 'streetData', 'typeStreetData', 'config', 'serviceUtil', 'precinctData', 'cityData', 'districtData', 'precinctAddressesData', '$timeout', 'regionPartData',
    function ($scope, streetData, typeStreetData, config, serviceUtil, precinctData, cityData, districtData, precinctAddressesData, $timeout, regionPartData) {
        var editInd, selectAddressInd,editableAddress;
        $scope.loading = true;
        $scope.saving = false;
        $scope.savingAddress = false;
        $scope.changingPresinct = false;

        $scope.errorMsg = '';
        $scope.successMsg = '';

        $scope.query = {};
        $scope.options = [
              { value: "Id", desc: "Дільниця", forAddresses: false },
              { value: "City.Name", desc: "Населений пункт", forAddresses: true },
              { value: "Street.Name", desc: "Вулиця", forAddresses: true },
              { value: "House", desc: "Буд", forAddresses: true },
              { value: "District.Number", desc: "Округ", forAddresses: false }
        ];
        $scope.queryBy = 'Id';
        $scope.precinctEditing = false;

        $scope.currentPage = 1;
        $scope.pageSize = config.pageSize;
        $scope.pageSizeTS = config.pageSizeTabularSection;

        $scope.precincts = [];
        $scope.precinctAddresses = [];
        $scope.selected = { precinct: {}, address: {}  };
        $scope.tableHead = ['№', 'Дільниця', 'Адреса', 'Округ', 'Дії'];
        $scope.autocomplete = {};

        $scope.getIndex = function (precinct) {
            return $scope.precincts.indexOf(precinct);
        };

        precinctData.getAll(function (precincts) {
            $scope.precincts = precincts.value;
            $scope.loading = false;
            //$scope.precincts.sort(comparePrecinct);
        },errorHandler);

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
        districtData.query(function (districts) {
            $scope.districts = districts.value;
            $scope.loading = false;
        }, errorHandler);

        $scope.loading = true;
        regionPartData.query(function (regionParts) {
            $scope.regionParts = regionParts.value;
            $scope.loading = false;
        }, errorHandler);

        $scope.edit = function (precinct) {
            editInd = $scope.getIndex(precinct);
            precinctData.getById({ id: precinct.Id }, function (res) {
                $scope.selected.precinct = res;
                $scope.precinctAddresses = res.PrecinctAddresses;
                $scope.precinctEditing = true;
                $scope.queryBy = 'City.Name';
                $scope.precinctAddresses.sort(compareAddresses);
            }, errorHandler);
        };

        $scope.delete = function (precinct) {
            precinctData.remove({ id: precinct.Id },
                function () {
                    $scope.precincts.splice($scope.getIndex(precinct), 1);
                }, errorHandler);
        };

        $scope.editAddress = function (address) {
            editableAddress = address;
            $scope.addAddressMode = false;
            precinctAddressesData.query(serviceUtil.getAddressKey(address), function (res) {
                $scope.selected.address = res;
            }, errorHandler);
        };

        $scope.delete = function (precinct) {
            precinctData.remove({ id: precinct.Id },
                function () {
                    $scope.precincts.splice($scope.getIndex(precinct), 1);
                }, errorHandler);
        };

        $scope.deleteAddress = function (address, ind) {
            precinctAddressesData.remove(serviceUtil.getAddressKey(address),
                function () {
                    $scope.precinctAddresses.splice(ind, 1);
                }, errorHandler);
        };

        $scope.save = function () {

            if (!$scope.selected.precinct.CityId) {
                $scope.errorMsg = "Населений пункт '" + $scope.selected.precinct.City + "' не знайдено";
                return;
            }

            if (!$scope.selected.precinct.StreetId) {
                $scope.errorMsg = "Вулицю '" + $scope.selected.precinct.Street + "' не знайдено";
                return;
            }

            if (!$scope.selected.precinct.RegionPartId) {
                $scope.errorMsg = "Район '" + $scope.selected.precinct.RegionPart + "' не знайдено";
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

            serviceUtil.copyProperties($scope.selected.precinct, precinct);
            if ($scope.addMode) {
                precinctData.save(precinct, function (newItem) {
                        successHandler({ id: newItem.Id });
                    }, errorHandler);
            } else {
                precinctData.update({ id: $scope.precincts[editInd].Id }, precinct, function () {
                        successHandler({ id: $scope.selected.precinct.Id });
                    }, errorHandler);
            }
            function successHandler(obj) {
                precinctData.getById(obj, function (res) {
                    $scope.saving = false;
                    if ($scope.addMode) {
                        $scope.addMode = false;
                        $scope.precincts.push(res);
                        $scope.selected.precinct = res;
                        $scope.successMsg = 'Дільницю успішно створено!';
                    } else {
                        $scope.precincts[editInd] = res;
                        $scope.successMsg = 'Зміни успішно збережено!';
                    }
                    $scope.precincts.sort(comparePrecinct);
                }, errorHandler);
            };
        };

        function closeAlertAtTimeout() {
            $timeout(function () {
                $scope.successMsg = '';
                $scope.errorMsg = '';
            }, 2000);
        };

        $scope.saveAddress = function (oldValue, ind) {
            
            if (!$scope.selected.precinct.Id) {
                $scope.errorMsg = "Спочатку необхідно зберегти дільницю";
                return;
            }

            if (!$scope.selected.address.CityId) {
                $scope.errorMsg = "Населений пункт '" + $scope.selected.address.City + "' не знайдено";
                return;
            }

            if (!$scope.selected.address.StreetId && $scope.selected.address.Street) {
                $scope.errorMsg = "Вулицю '" + $scope.selected.address.Street + "' не знайдено";
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
            address.PrecinctId = $scope.selected.precinct.Id;
            if ($scope.addAddressMode) {
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
                            $scope.precinctAddresses.sort(compareAddresses);
                            $scope.resetAddress();
                        }, errorHandler);
                    }, errorHandler);
            };
        };

        $scope.addNewPrecinct = function () {
            $scope.addMode = true;
            $scope.precinctEditing = true;
        };

        $scope.addNewAddress = function () {
            $scope.resetAddress();
            $scope.addAddressMode = true;
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
            editableAddress = {};
        };

        function errorHandler(e) {
            //$scope.successMsg = '';
            $scope.saving = false;
            $scope.savingAddress = false;
            $scope.savingAddresses = false;
            $scope.loading = false;
            $scope.resetAddress();
            $scope.errorMsg = serviceUtil.getErrorMessage(e);
        };

        //function getAddressKey(address) {
        //    return { cityId: address.CityId, streetId: address.StreetId, house: address.House.replace('/','@') };
        //};

        $scope.backToList = function () {
            $scope.queryBy = 'Id';
            $scope.precinctEditing = false;
            $scope.addMode = false;
            $scope.precinctAddresses = [];
            $scope.selected.precinct = {};
            $scope.autocomplete = {};
            $scope.resetAddress();
        };

        $scope.autoCompleteAddresses = function () {
            if (!$scope.selected.precinct.Id) {
                $scope.errorMsg = "Спочатку необхідно зберегти дільницю";
                return;
            }

            if (!$scope.autocomplete.CityId) {
                $scope.errorMsg = "Населений пункт '" + $scope.autocomplete.City + "' не знайдено";
                return;
            }

            if (!$scope.autocomplete.StreetId) {
                $scope.errorMsg = "Вулицю '" + $scope.autocomplete.Street + "' не знайдено";
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
                this.PrecinctId = $scope.selected.precinct.Id
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
                precinctData.getById({ id: $scope.selected.precinct.Id }, function (res) {
                    $scope.savingAddresses = false;
                    $scope.precinctAddresses = res.PrecinctAddresses;
                    $scope.precinctAddresses.sort(compareAddresses);
                }, errorHandler);
            }, errorHandler);
        };

        $scope.$watch('successMsg + errorMsg', function (newValue) {
            if (newValue.length > 0) {
                closeAlertAtTimeout();
            }
        });

        function compareAddresses(a1, a2) {
            var compCity, compStreet, compHouse, h1, h2;
            compCity = serviceUtil.compareByName(a1.City, a2.City);
            compStreet = serviceUtil.compareByName(a1.Street, a2.Street);
            h1 = parseInt(a1.House);
            h2 = parseInt(a2.House);
            if (h1 > h2) {
                compHouse = 1;
            } else if (h1 < h2) {
                compHouse = -1;
            } else {
                compHouse = 0;
            }
            if (compCity === 0) {
                if (compStreet === 0) {
                    return compHouse;
                } else {
                    return compStreet;
                }
            } else {
                return compCity;
            }
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

        $scope.onSelectStreet = function ($item, $model, $label) {
            $scope.selected.precinct.Street = $item;
            $scope.selected.precinct.StreetId = $model;
        };

        $scope.onSelectCity = function ($item, $model, $label) {
            $scope.selected.precinct.City = $item;
            $scope.selected.precinct.CityId = $model;
        };

        $scope.onSelectPrecinctNumber = function ($item, $model, $label) {
            $scope.selected.newPrecinct = $item;
            $scope.selected.newPrecinctId = $model;
        };

        $scope.onSelectRegionPart = function ($item, $model, $label) {
            $scope.selected.precinct.RegionPart = $item;
            $scope.selected.precinct.RegionPartId = $model;
        };

        $scope.changePrecinct = function (address) {
            $scope.changingPresinct = true;
            editableAddress = address;
        };

        $scope.saveChangesPrecinct = function (selectedAddress,ind) {
            if (!$scope.selected.newPrecinctId) {
                $scope.errorMsg = "Не вірний номер дільниці";
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
                $scope.precinctAddresses.splice(ind,1);
            },errorHandler);
        };
    }]);
