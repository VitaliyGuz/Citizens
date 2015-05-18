'use strict';

var precinctControllers = angular.module('precinctControllers', ['streetServices', 'precinctServices', 'cityServices', 'angularUtils.directives.dirPagination', 'appCitizen', 'scrollable-table', 'ui.bootstrap']);

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

precinctControllers.controller("listController", ['$scope', 'streetData', 'typeStreetData', 'config', 'serviceUtil', 'precinctData', 'cityData', 'districtData', 'precinctAddressesData', '$timeout',
    function ($scope, streetData, typeStreetData, config, serviceUtil, precinctData, cityData, districtData, precinctAddressesData, $timeout) {
        var editInd, selectAddressInd,editableAddress;
        $scope.loading = true;
        $scope.saving = false;
        $scope.savingAddress = false;

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

        $scope.precincts = [];
        $scope.precinctAddresses = [];
        $scope.selected = { precinct: {}, address: {}  };
        $scope.tableHead = ['№', 'Дільниця', 'Населений пункт', 'Вулиця', 'Буд.', 'Округ', 'Дії'];
        $scope.autocomplete = {};

        $scope.getIndex = function (precinct) {
            return $scope.precincts.indexOf(precinct);
        }

        precinctData.getAll(function (precincts) {
            $scope.precincts = precincts.value;
            $scope.loading = false;
            $scope.precincts.sort(comparePrecinct);
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

        $scope.edit = function (precinct) {
            editInd = $scope.getIndex(precinct);
            precinctData.getById({ id: precinct.Id }, function (res) {
                $scope.selected.precinct = res;
                $scope.precinctAddresses = res.PrecinctAddresses;
                $scope.precinctEditing = true;
                $scope.queryBy = 'City.Name';
                $scope.precinctAddresses.sort(compareAddresses);
            },errorHandler);
        }

        $scope.delete = function (precinct) {
            precinctData.remove({ id: precinct.Id },
                function () {
                    $scope.precincts.splice($scope.getIndex(precinct), 1);
                },errorHandler);
        }

        $scope.editAddress = function (address) {
            editableAddress = address;
            $scope.addAddressMode = false;
            precinctAddressesData.query(getAddressKey(address), function (res) {
                $scope.selected.address = res;
            }, errorHandler);
        }

        $scope.delete = function (precinct) {
            precinctData.remove({ id: precinct.Id },
                function () {
                    $scope.precincts.splice($scope.getIndex(precinct), 1);
                }, errorHandler);
        }

        $scope.deleteAddress = function (address,ind) {
            precinctAddressesData.remove(getAddressKey(address),
                function () {
                    $scope.precinctAddresses.splice(ind, 1);
                }, errorHandler);
        }

        $scope.save = function () {
            $scope.errorMsg = '';
            $scope.saving = true;
            var precinct = {
                "Id":0,
                "CityId": 0,
                "StreetId": 0,
                "House": '',
                "DistrictId": 0
            }

            serviceUtil.copyProperties($scope.selected.precinct,precinct);
            if ($scope.addMode) {
                precinctData.save(precinct,
                    function (newItem) {
                        precinctData.getById({ id: newItem.Id }, function (res) {
                            $scope.addMode = false;
                            $scope.saving = false;
                            $scope.precincts.push(res);
                            $scope.selected.precinct = res;
                            $scope.successMsg = 'Дільницю успішно створено!';
                            $scope.precincts.sort(comparePrecinct);
                        }, errorHandler);
                    },errorHandler);
            } else {
                precinctData.update({ id: $scope.precincts[editInd].Id }, precinct,
                    function () {
                        precinctData.getById({ id: $scope.selected.precinct.Id }, function (res) {
                            $scope.saving = false;
                            $scope.precincts[editInd] = res;
                            $scope.successMsg = 'Зміни успішно збережено!';
                            $scope.precincts.sort(comparePrecinct);
                        },errorHandler);
                    },errorHandler);
            }
        }

        function closeAlertAtTimeout() {
            $timeout(function () {
                $scope.successMsg = '';
                $scope.errorMsg = '';
            }, 2000);
        }

        $scope.saveAddress = function (oldValue, ind) {
            $scope.errorMsg = '';
            if ($scope.selected.precinct.Id == null) {
                $scope.errorMsg = "Спочатку необхідно зберегти дільницю";
                return;
            }
            $scope.savingAddress = true;
            var address = {
                "CityId": 0,
                "StreetId": 0,
                "House": '',
                "PrecinctId": 0
            }
            serviceUtil.copyProperties($scope.selected.address, address);
            address.PrecinctId = $scope.selected.precinct.Id;
            if ($scope.addAddressMode) {
                saveAddressData(address);
            } else {
                precinctAddressesData.remove(getAddressKey(oldValue),
                    function () {
                        saveAddressData(address, ind);
                    }, errorHandler);
            }
        }

        $scope.addNewPrecinct = function () {
            $scope.errorMsg = '';
            $scope.addMode = true;
            $scope.precinctEditing = true;
        }

        $scope.addNewAddress = function () {
            $scope.errorMsg = '';
            $scope.resetAddress();
            $scope.addAddressMode = true;
        }

        $scope.getTemplate = function (address) {
            if (address === editableAddress) return 'edit';
            else return 'display';
        }

        $scope.resetAddress = function () {
            $scope.addAddressMode = false;
            $scope.selected.address = {};
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

        function getAddressKey(address) {
            return { cityId: address.CityId, streetId: address.StreetId, house: address.House };
        };

        $scope.backToList = function () {
            //$scope.successMsg = '';
            //$scope.errorMsg = '';
            $scope.queryBy = 'Number';
            $scope.precinctEditing = false;
            $scope.addMode = false;
            $scope.precinctAddresses = [];
            $scope.selected.precinct = {};
            $scope.selected.address = {};
            $scope.autocomplete = {};
        }

        function saveAddressData(data,i) {
            precinctAddressesData.save(data,
                function (saved) {
                    precinctAddressesData.query(getAddressKey(saved), function (res) {
                        $scope.savingAddress = false;
                        $scope.savingAddresses = false;
                        if (i == undefined) {
                            $scope.precinctAddresses.push(res);
                        } else {
                            $scope.precinctAddresses[i]=res;
                        }
                        $scope.precinctAddresses.sort(compareAddresses);
                        $scope.resetAddress();
                    }, errorHandler);
                }, errorHandler);
        }

        $scope.autoCompleteAddresses = function () {
            if ($scope.selected.precinct.Id == null) {
                $scope.errorMsg = "Спочатку необхідно зберегти дільницю";
                return;
            }

            var startNumb, endNumb, currNumb;
            startNumb = parseInt($scope.autocomplete.HouseFrom);
            endNumb = parseInt($scope.autocomplete.HouseTo);
            if (startNumb > endNumb || startNumb <= 0 || endNumb <= 0) {
                alert("Не вірно заданий інтервал номерів будинків!");
                return;
            }

            var ok = confirm("Буде створено " + (endNumb - startNumb + 1) + " адрес. Продовжити?");
            if (!ok) return;

            //todo: do entity factory
            var address = {
                "CityId": $scope.autocomplete.CityId,
                "StreetId": $scope.autocomplete.StreetId,
                "House": '',
                "PrecinctId": $scope.selected.precinct.Id
            }

            function addAddress(houseNumb) {
                if (houseNumb > endNumb) return;
                $scope.savingAddresses = true;
                address.House = houseNumb.toString();
                precinctAddressesData.save(address,
                  function (newItem) {
                      precinctAddressesData.query(getAddressKey(newItem), function (res) {
                          $scope.savingAddresses = false;
                          $scope.precinctAddresses.push(res);
                          houseNumb++;
                          addAddress(houseNumb.toString());
                          $scope.precinctAddresses.sort(compareAddresses);
                      }, errorHandler);
                  }, errorHandler);
            }
            addAddress(startNumb);
        }

        $scope.$watch('successMsg + errorMsg', function (newValue) {
            if (newValue.length > 0) {
                closeAlertAtTimeout();
            }
        });

        function compareAddresses(a1, a2) {
            var compCity, compStreet, compHouse, h1,h2;
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
        }

        function comparePrecinct(p1, p2) { 
            if (p1.Number > p2.Number) {
                return 1;
            } else if (p1.Number < p2.Number) {
                return -1;
            } else {
                return 0;
            }
        }

        $scope.onSelectStreet = function ($item, $model, $label) {
            $scope.selected.precinct.Street = $item;
            $scope.selected.precinct.StreetId = $model;
        };

        $scope.onSelectAutocompleteStreet = function ($item, $model, $label) {
            $scope.autocomplete.Street = $item;
            $scope.autocomplete.StreetId = $model;
        };

        $scope.onSelectPrecinctAddressStreet = function ($item, $model, $label) {
            $scope.selected.address.Street = $item;
            $scope.selected.address.StreetId = $model;
        }
    }]);
