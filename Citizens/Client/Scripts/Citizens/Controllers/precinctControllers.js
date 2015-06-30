'use strict';

var precinctControllers = angular.module('precinctControllers', ['precinctServices', 'scrollable-table']);

precinctControllers.controller("listPrecinctsController", ['$location', '$rootScope', '$scope', 'config', 'serviceUtil', 'precinctData', 'loadedPrecincts', 'filterSettings',
    function ($location, $rootScope, $scope, config, serviceUtil, precinctData, loadedPrecincts, filterSettings) {
        
        $rootScope.pageTitle = 'Дільниці';
        $scope.tableHead = ['№', 'Дільниця', 'Адреса', 'Дії'];

        $scope.options = [
              { value: "Id", desc: "Дільниця"},
              { value: "City.Name", desc: "Населений пункт" },
              { value: "Street.Name", desc: "Вулиця" },
              { value: "House", desc: "Буд" }
              //{ value: "District.Id", desc: "Округ" }
        ];
        
        var precinctsQuery = filterSettings.get('precincts');
        if (precinctsQuery) {
            $scope.query = precinctsQuery;
            $scope.queryBy = Object.keys(precinctsQuery)[0];
        } else {
            $scope.query = {};
            $scope.queryBy = 'Id';
        }

        $scope.onFilterQueryChange = function (isChangeValue) {
            if (isChangeValue) {
                filterSettings.set('precincts', $scope.query);
            } else {
                $scope.query = {};
                filterSettings.remove('precincts');
            }
        };

        $rootScope.editInd = -1;
        $scope.currentPage = serviceUtil.getRouteParam("currPage") || 1;
        $scope.pageSize = config.pageSize;
        $scope.pageSizeTS = config.pageSizeTabularSection;
        $scope.precincts = loadedPrecincts;

        $scope.getIndex = function (precinct) {
            return $scope.precincts.indexOf(precinct);
        };

        $scope.edit = function (precinct) {
            $rootScope.errorMsg = '';
            $rootScope.editInd = $scope.getIndex(precinct);
            $location.path('/precinct/' +precinct.Id);
        };

        $scope.delete = function (precinct) {
            if (config.checkDeleteItem) {
                var ok = confirm("Увага! Дільницю буде видалено, продовжити?");
                if (!ok) return;
            }
            $rootScope.errorMsg = '';
            precinctData.remove({ id: precinct.Id },
                function () {
                    $scope.precincts.splice($scope.getIndex(precinct), 1);
                }, errorHandler);
        };        

        $scope.addNewPrecinct = function () {
            $rootScope.errorMsg = '';
            $location.path('/precinct/new');
        };

        function errorHandler(e) {
            $rootScope.errorMsg = '';
            $rootScope.errorMsg = serviceUtil.getErrorMessage(e);
        };

        $scope.onPageChange = function (newPageNumber) {
            //todo: change location path without reload page
            //$location.path("/precincts/" + newPageNumber);
        };
    }]);

precinctControllers.controller("editPrecinctController", ['$location', '$rootScope', '$scope', '$routeParams', 'serviceUtil', 'config', 'precinctData', 'streetData', 'cityData', 'districtData', 'precinctAddressesData', 'resolvedData',
    function ($location, $rootScope, $scope, $routeParams, serviceUtil, config, precinctData, streetData, cityData, districtData, precinctAddressesData, resolvedData) {
        var copyAddressMode, editableAddress, editablePrecinctDistrict;
        $rootScope.pageTitle = 'Дільниця';
        $scope.saving = false;
        $scope.savingAddress = false;
        $scope.changingPresinct = false;
        $scope.addMode = true;

        $scope.query = {};
        $scope.options = [
              { value: "City.Name", desc: "Населений пункт" },
              { value: "Street.Name", desc: "Вулиця" },
              { value: "House", desc: "Буд" }
        ];
        $scope.queryBy = 'City.Name';
        $scope.precinctAddresses = [];
        $scope.selected = { precinct: {}, address: {}, precinctDistrict: {} };
        $scope.autocomplete = {};
        
        if (resolvedData.precinct) {
            $scope.addMode = false;
            $scope.precinct = resolvedData.precinct;
            $scope.precinct.Number = resolvedData.precinct.Id;
            $scope.precinctAddresses = resolvedData.precinct.PrecinctAddresses;
            $scope.autocomplete.CityId = $scope.precinct.City.Id;
            $scope.autocomplete.City = $scope.precinct.City;
            //$scope.precinctAddresses.sort(compareAddresses);
            sortAddresses($scope.precinctAddresses);
            $scope.precinctDistricts = resolvedData.precinct.DistrictPrecincts;
            $scope.precinctDistricts.sort(function(a,b) {
                return a.DistrictId - b.DistrictId;
            });
        }
        $scope.districts = resolvedData.districts;
        //$scope.precincts = resolvedData.precincts;
        precinctData.getAllNotExpand(function (data) {
            $scope.precincts = data.value;
        }, function (err) {
            var errDetails = serviceUtil.getErrorMessage(err);
            $rootScope.errorMsg = "Дільниці не завантажено";
            if (errDetails) $rootScope.errorMsg = $rootScope.errorMsg + ' (' + errDetails + ')';
        });

        $scope.editAddress = function (address) {
            $rootScope.errorMsg = '';
            editableAddress = address;
            $scope.addAddressMode = false;
            precinctAddressesData.query(serviceUtil.getAddressKey(address), function (res) {
                $scope.selected.address = res;
            }, errorHandler);
        };

        $scope.editPrecinctDistrict = function (precinctDistrict) {
            $rootScope.errorMsg = '';
            editablePrecinctDistrict = precinctDistrict;
            $scope.addDistrictMode = false;
            districtData.getPrecinctDistricts({ districtId: precinctDistrict.DistrictId, precinctId: precinctDistrict.PrecinctId }, function (res) {
                $scope.selected.precinctDistrict = res;
            }, errorHandler);
        };

        $scope.deleteAddress = function (address, ind) {
            if (config.checkDeleteItem) {
                var ok = confirm("Увага! Адресу дільниці буде видалено, продовжити?");
                if (!ok) return;
            }
            $rootScope.errorMsg = '';
            precinctAddressesData.remove(serviceUtil.getAddressKey(address),
                function () {
                    $scope.precinctAddresses.splice(ind, 1);
                }, errorHandler);
        };

        $scope.deletePrecinctDistrict = function (precinctDistrict, ind) {
            if (config.checkDeleteItem) {
                var ok = confirm("Увага! Округ буде видалено, продовжити?");
                if (!ok) return;
            }
            $rootScope.errorMsg = '';
            districtData.removePrecinctDistrict({ districtId: precinctDistrict.DistrictId, precinctId: precinctDistrict.PrecinctId },
                function () {
                    $scope.precinctDistricts.splice(ind, 1);
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
            $rootScope.errorMsg = '';
            $scope.saving = true;
            var precinct = {
                "Id": 0,
                "CityId": 0,
                "StreetId": 0,
                "House": '',
                //"DistrictId": 0,
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
                        $scope.precincts.push(res);
                        $scope.precinct = res;
                        $scope.precinct.Number = res.Id;
                        $rootScope.successMsg = 'Дільницю успішно створено!';
                    } else {
                        $scope.precincts[$rootScope.editInd] = res;
                        $rootScope.successMsg = 'Зміни успішно збережено!';
                    }
                    $scope.precincts.sort(comparePrecinct);
                }, errorHandler);
            };
        };

        function comparePrecinct(p1, p2) {
            return p1.Id - p2.Id;
        };

        $scope.saveAddress = function (oldValue, ind) {

            if (!$scope.precinct || !$scope.precinct.Id) {
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
            $rootScope.errorMsg = '';
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

        $scope.savePrecinctDistrict = function (oldValue, ind) {

            if (!$scope.precinct || !$scope.precinct.Id) {
                $rootScope.errorMsg = "Спочатку необхідно зберегти дільницю";
                return;
            }

            if (!$scope.selected.precinctDistrict.DistrictId) {
                $rootScope.errorMsg = "Виберіть округ";
                return;
            }

            $rootScope.errorMsg = '';
            $scope.savingPrecinctDistrict = true;
            // todo: factory method
            var precinctDistrict = {
                "DistrictId": $scope.selected.precinctDistrict.DistrictId,
                "PrecinctId": $scope.precinct.Id
            };
            
            if ($scope.addDistrictMode) {
                savePrecinctDistrictData(precinctDistrict);
            } else {
                districtData.removePrecinctDistrict({ districtId: oldValue.DistrictId, precinctId: oldValue.PrecinctId },
                    function () {
                        savePrecinctDistrictData(precinctDistrict, ind);
                    }, errorHandler);
            }

            function savePrecinctDistrictData(data, i) {
                districtData.savePrecinctDistrict(data,
                    function (saved) {
                        districtData.getPrecinctDistricts({ districtId: saved.DistrictId, precinctId: saved.PrecinctId }, function (res) {
                            $scope.savingPrecinctDistrict = false;
                            if (i == undefined) {
                                $scope.precinctDistricts.push(res);
                            } else {
                                $scope.precinctDistricts[i] = res;
                            }
                            $scope.precinctDistricts.sort(function (a, b) {
                                return a.DistrictId - b.DistrictId;
                            });
                            $scope.resetPrecinctDistrict();
                        }, errorHandler);
                    }, errorHandler);
            };
        };

        $scope.addNewAddress = function () {
            $rootScope.errorMsg = '';
            $scope.resetAddress();
            $scope.addAddressMode = true;
            if ($scope.precinct && $scope.precinct.City) {
                $scope.selected.address.City = $scope.precinct.City;
                $scope.selected.address.CityId = $scope.precinct.City.Id;
            }
        };

        $scope.addNewPrecinctDistrict = function () {
            $rootScope.errorMsg = '';
            $scope.resetPrecinctDistrict();
            $scope.addDistrictMode = true;
        };

        $scope.getTemplate = function (address) {
            if (address === editableAddress) {
                return $scope.changingPresinct ? 'changePresinct' : 'edit';
            } else return 'display';
        };

        $scope.getTemplateDistricts = function(precinctDistrict) {
            if (precinctDistrict === editablePrecinctDistrict) return 'editDistrict';
            else return 'displayDistrict';
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

        $scope.resetPrecinctDistrict = function() {
            $scope.addDistrictMode = false;
            $scope.selected.precinctDistrict = {};
            editablePrecinctDistrict = undefined;
        };

        function errorHandler(e) {
            $rootScope.errorMsg = '';
            $scope.saving = false;
            $scope.savingAddress = false;
            $scope.savingAddresses = false;
            $scope.savingPrecinctDistrict = false;
            $scope.resetAddress();
            $scope.resetPrecinctDistrict();
            $rootScope.errorMsg = serviceUtil.getErrorMessage(e);
        };

        $scope.backToList = function () {
            $rootScope.errorMsg = '';
            var currPage = serviceUtil.getRouteParam("currPage") || 1;
            $location.path('/precincts');
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
            $rootScope.errorMsg = '';
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
            function getParseHouseNumber(strNumber) {
                var houseNumbRegex = /(\d*)?([а-яА-Я]*)?\/?(\d*)/i,
                    housingRegex = /к.(\d*)/i,
                    matches = houseNumbRegex.exec(strNumber),
                    housing = housingRegex.exec(strNumber) || 0;
                return { beforeSlash: parseInt(matches[1]), letter: matches[2] || '', afterSlash: parseInt(matches[3]) || 0, housing: housing[1] || 0 };
            };

            function compareHouses(h1, h2) {
                var compInt = h1.beforeSlash - h2.beforeSlash, compLetter, compAfterSlash;
                if (compInt === 0) {
                    compLetter = h1.letter.localeCompare(h2.letter);
                    if (compLetter === 0) {
                        compAfterSlash = h1.afterSlash - h2.afterSlash;
                        if (compAfterSlash === 0) {
                            return h1.housing - h2.housing;
                        } else {
                            return compAfterSlash;
                        }
                    } else {
                        return compLetter;
                    }
                } else {
                    return compInt;
                }
            };

            function compareAddresses(a1, a2) {
                var compCity, compStreet, compHouse, compTypeStreet;
                compCity = serviceUtil.compareByName(a1.City, a2.City);
                compStreet = serviceUtil.compareByName(a1.Street, a2.Street);
                compTypeStreet = serviceUtil.compareByName(a1.Street.StreetType, a2.Street.StreetType);
                compHouse = compareHouses(getParseHouseNumber(a1.House), getParseHouseNumber(a2.House));
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
                //addresses.sort(function (a1, a2) {
                //    var compCity, compStreet, compTypeStreet;
                //    compCity = serviceUtil.compareByName(a1.City, a2.City);
                //    compStreet = serviceUtil.compareByName(a1.Street, a2.Street);
                //    compTypeStreet = serviceUtil.compareByName(a1.Street.StreetType, a2.Street.StreetType);
                //    if (compCity === 0) {
                //        if (compStreet === 0) {
                //            return compTypeStreet;
                //        } else {
                //            return compStreet;
                //        }
                //    } else {
                //        return compCity;
                //    }
                //});
                addresses.sort(compareAddresses);
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
            $rootScope.errorMsg = '';
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
            $rootScope.errorMsg = '';
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