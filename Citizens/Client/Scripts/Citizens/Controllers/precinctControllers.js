'use strict';

var precinctControllers = angular.module('precinctControllers', ['precinctServices', 'scrollable-table']);

precinctControllers.controller("listPrecinctsController", ['$location', '$rootScope', '$scope', 'config', 'serviceUtil', 'precinctData', 'filterSettings',
    function ($location, $rootScope, $scope, config, serviceUtil, precinctData, filterSettings) {
        
        $rootScope.pageTitle = 'Дільниці';
        $scope.tableHead = ['№', 'Дільниця', 'Адреса','LatLng','Location type', 'Дії'];

        //$scope.options = [
        //      { value: "Number", desc: "Дільниця"},
        //      { value: "City.Name", desc: "Населений пункт" },
        //      { value: "Street.Name", desc: "Вулиця" },
        //      { value: "House", desc: "Буд" }
        //      //{ value: "District.Id", desc: "Округ" }
        //];
        
        var precinctsQuery = filterSettings.get('precincts');
        if (precinctsQuery) {
            $scope.query = precinctsQuery;
            $scope.queryBy = Object.keys(precinctsQuery)[0];
        } else {
            $scope.query = {};
            $scope.queryBy = 'Number';
        }

        //$rootScope.editInd = -1;
        $scope.currentPage = serviceUtil.getRouteParam("currPage") || 1;
        $scope.pageSize = config.pageSize;
        $scope.totalItems = 0;
        $scope.pageSizeTS = config.pageSizeTabularSection;
        
        setPrecinctsOnPage(($scope.currentPage - 1) * config.pageSize);

        function setPrecinctsOnPage(skipItems) {
            $scope.loadingPrecincts = true;
            var filterString = getFilterString();
            if (!skipItems) skipItems = 0;
            if (filterString) {
                precinctData.getFilteredPageItems({ skip: skipItems, filter: filterString }, successHandler, errorHandler);
            } else {
                precinctData.getPageItems({ skip: skipItems }, successHandler, errorHandler);
            }
        };

        function getFilterString() {
            var filterStr, filterPattern = "indexof(cast(:fieldName,Edm.String), ':val') ge 0";
            if ($scope.query && $scope.query[$scope.queryBy]) {
                filterStr = filterPattern.replace(':fieldName', $scope.queryBy).replace(':val', $scope.query[$scope.queryBy]);
            }
            //console.log(filterStr);
            return filterStr;
        };

        function successHandler(data) {
            $rootScope.errorMsg = '';
            $scope.loadingPrecincts = false;
            $scope.precincts = data.value;
            $scope.totalItems = data['@odata.count'];
        };

        $scope.getIndex = function (ind) {
            return ($scope.currentPage - 1) * config.pageSize + ind + 1;
        };

        $scope.edit = function (precinct) {
            $rootScope.errorMsg = '';
            //$rootScope.editInd = $scope.getIndex(precinct);
            $location.path('/precinct/' + precinct.Id + '/' + $scope.currentPage);
        };

        $scope.delete = function (precinct) {
            if (config.checkDeleteItem) {
                var ok = confirm("Увага! Дільницю буде видалено, продовжити?");
                if (!ok) return;
            }
            $rootScope.errorMsg = '';
            precinctData.remove({ id: precinct.Id },function () {
                setPrecinctsOnPage(($scope.currentPage - 1) * config.pageSize);
            }, errorHandler);
        };        

        $scope.addNewPrecinct = function () {
            $rootScope.errorMsg = '';
            $location.path('/precinct/new/' + $scope.currentPage);
        };

        function errorHandler(e) {
            $scope.loadingPrecincts = false;
            e.description = 'Дільниці не завантажено';
            $rootScope.errorMsg = serviceUtil.getErrorMessage(e);
        };

        $scope.onPageChange = function (newPageNumber) {
            $location.path("/precincts/" + newPageNumber);
        };

        $scope.applyFilter = function () {
            if ($scope.query[$scope.queryBy]) {
                filterSettings.set('precincts', $scope.query);
            } else {
                filterSettings.remove('precincts');
            }
            setPrecinctsOnPage();
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
            $scope.precinctAddresses = resolvedData.precinct.PrecinctAddresses;
            if (resolvedData.precinct.City) {
                $scope.autocomplete.CityId = resolvedData.precinct.City.Id;
                $scope.autocomplete.City = resolvedData.precinct.City;
            }
            //$scope.precinctAddresses.sort(compareAddresses);
            sortAddresses($scope.precinctAddresses);
            $scope.precinctDistricts = resolvedData.precinct.DistrictPrecincts;
            if ($scope.precinctDistricts){
                $scope.precinctDistricts.sort(function(a, b) {
                    return a.DistrictId - b.DistrictId;
                });
            }
        }
        $scope.districts = resolvedData.districts;
        precinctData.getAllNotExpand(function (data) {
            $scope.precincts = data.value;
        }, function (err) {
            err.description = "Дільниці не завантажено";
            $rootScope.errorMsg = serviceUtil.getErrorMessage(err);
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
                "Number": 0,
                "CityId": 0,
                "StreetId": 0,
                "House": '',
                "RegionPartId": 0,
                "lat": 0,
                "lng": 0,
                "location_type": ''
            };

            serviceUtil.copyProperties($scope.precinct, precinct);
            if ($scope.addMode) {
                precinctData.save(precinct, function (newItem) {
                    successHandler({ id: newItem.Id });
                }, errorHandler);
            } else {
                precinctData.update({ id: $scope.precinct.Id }, precinct, function () {
                    successHandler({ id: $scope.precinct.Id });
                }, errorHandler);
            }
            function successHandler(resp) {
                $scope.saving = false;
                if ($scope.addMode) {
                    $scope.addMode = false;
                    $scope.precinct.Id = resp.id;
                    $rootScope.successMsg = 'Дільницю успішно створено!';
                } else {
                    //$scope.precincts[$rootScope.editInd] = res;
                    $scope.precincts = $scope.precincts.map(function (precinct) {
                        if (precinct.Id === $scope.precinct.Id) {
                            return $scope.precinct;
                        } else {
                            return precinct;
                        }
                    });
                    $rootScope.successMsg = 'Зміни успішно збережено!';
                }
                $scope.precincts.sort(comparePrecinct);
            };
        };

        function comparePrecinct(p1, p2) {
            return p1.Number - p2.Number;
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
                districtData.savePrecinctDistrict(precinctDistrict, successHandler, errorHandler);
            } else {
                districtData.updatePrecinctDistrict({ districtId: oldValue.DistrictId, precinctId: oldValue.PrecinctId }, precinctDistrict, successHandler, errorHandler);
            }

            function successHandler(data) {
                districtData.getPrecinctDistricts({ districtId: data.DistrictId, precinctId: data.PrecinctId }, function(res) {
                    $scope.savingPrecinctDistrict = false;
                    if ($scope.addDistrictMode) {
                        $scope.precinctDistricts.push(res);
                    } else {
                        $scope.precinctDistricts[ind] = res;
                    }
                    $scope.precinctDistricts.sort(function (a, b) {
                        return a.District.Number - b.District.Number;
                    });
                    $scope.resetPrecinctDistrict();
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
            $location.path('/precincts/' + currPage);
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

            if (addresses) addresses.sort(compareAddresses);
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

precinctControllers.controller('geocodingController', ['$scope', '$rootScope', '$timeout', 'precinctData', 'serviceUtil', 'refreshToken', function ($scope, $rootScope, $timeout, precinctData, serviceUtil, refreshToken) {
    var precincts,
        length,
        nextPrecinct,
        delay, // delay geocoding
        iter, // for calculate percent progress
        geocoder = new google.maps.Geocoder(),
        infowindow = new google.maps.InfoWindow(),
        mapOptions = {
            zoom: 8,
            center: new google.maps.LatLng(49.5880818, 34.5539573)
            //mapTypeId: google.maps.MapTypeId.ROADMAP
        },
        map = new google.maps.Map(document.getElementById("map"), mapOptions),
        bounds = new google.maps.LatLngBounds(),
        poltavaRegionBounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(48.658972672150036, 31.977831054687613),
            new google.maps.LatLng(50.675018227028374, 35.661003906250016)
        );

    function createMarker(add, lat, lng) {
        var contentString = add;
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, lng),
            map: map
        });

        google.maps.event.addListener(marker, 'click', function () {
            infowindow.setContent(contentString);
            infowindow.open(map, marker);
        });

        bounds.extend(marker.position);
        
    };

    function Delay (delay, stepIncrement, stepDecrement) {
        var initialVal = delay && delay > 0 ? delay : 0,
        value = initialVal, countInc = 0,
        stepInc = stepIncrement && stepIncrement > 0 ? stepIncrement : 0,
        stepDec = stepDecrement && stepDecrement > 0 ? stepDecrement : 0;
        this.increment = function () {
            countInc++;
            value += stepInc * countInc;
        };
        this.decrement = function () {
            if (value > initialVal) value -= stepDec * countInc;
        };
        this.getValue = function () {
            return value;
        };
    };

    function geocode(precinct, next) {
        var address;
        if (precinct && precinct.Street && precinct.City) {
            address = precinct.Street.StreetType.Name + precinct.Street.Name + "," + precinct.House + "," + precinct.City.CityType.Name + precinct.City.Name + "," + precinct.City.RegionPart.Name + " район,Полтавська область,Україна";
        } else {
            next();
            return;
        }
        geocoder.geocode({ 'address': address, 'bounds': poltavaRegionBounds, 'region': 'ua' }, function (results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                var location = results[0].geometry.location;
                precinct.lat = location.lat();
                precinct.lng = location.lng();
                precinct.location_type = results[0].geometry.location_type;
            } else {
                console.debug(precinct.Id + " [" + new Date().toLocaleString() + "] status: " + status);
                if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
                    nextPrecinct--;
                    delay.increment();
                    next();
                } else {
                    precinct.location_type = "NOT FOUND: " + status;
                }
            }
            if (status === google.maps.GeocoderStatus.OK) {
                var raw = {
                    "Id": 0,
                    "Number": 0,
                    "CityId": 0,
                    "StreetId": 0,
                    "House": '',
                    "RegionPartId": 0,
                    "lat": 0,
                    "lng": 0,
                    "location_type": ''
                };
                serviceUtil.copyProperties(precinct, raw);
                precinctData.update({ id: precinct.Id }, raw, function () {
                    $rootScope.geocoging.progressNow = Math.round(iter++ / length * 100);
                    console.debug(precinct.Id + " [" + new Date().toLocaleString() + "] delay: " + delay.getValue());
                    delay.decrement();
                    next();
                }, function (err) {
                    err.description = "Геокодування дільниці " + precinct.Number + " не записано";
                    $rootScope.errorMsg = serviceUtil.getErrorMessage(err);
                });
            }
            //next();
        });
    };

    function getNextPrecinct() {
        if (nextPrecinct < length) {
            $timeout(function () {
                geocode(precincts[nextPrecinct], getNextPrecinct);
            }, delay.getValue());
            nextPrecinct++;
        }
        //if (nextPrecinct < precincts.length) {
        //    geocode(precincts[++nextPrecinct]);
        //    if (delay > initialDelay) delay -= decD;
        //}
    };

    function refreshTokenOnTimeout() {
        if (nextPrecinct < length) {
            refreshToken(function(res) {
                if (res.success) {
                    console.info("refresh token on timeout");
                    $timeout(function() {
                        refreshTokenOnTimeout();
                    }, 840000); // 14 minutes
                } else {
                    if (res.error) {
                        res.error.description = "Оновлення даних авторизації не відбулося";
                        $rootScope.errorMsg = serviceUtil.getErrorMessage(res.error);
                    }
                }
            });
        }
    };

    $scope.startGeociding = function () {
        $rootScope.geocoging = {};
        $rootScope.geocoging.isLoading = true;
        $rootScope.geocoging.progressNow = 0;
        precincts = [], length = 0, nextPrecinct = 0, iter = 1;
        precinctData.getAll({ filter: '&$filter=lat eq null and lng eq null' }, function (data) {
            precincts = data.value;
            length = precincts.length;
            refreshTokenOnTimeout();
            $rootScope.geocoging.isLoading = false;
            $rootScope.geocoging.isProgress = true;
            delay = new Delay(2000, 60000, 60000);
            geocode(precincts[0], getNextPrecinct);
        }, function(error) {
            $rootScope.geocoging.isLoading = false;
            error.description = 'Геокодування дільниць не виконано';
            $rootScope.errorMsg = serviceUtil.getErrorMessage(error);
        });
    };

    $scope.showMarkers = function () {
        if (!$scope.selected.RegionPartId) return;
        $scope.isMarkering = true;
        var precincts = [];
        precinctData.getByRegionPartId({ regionPartId: $scope.selected.RegionPartId }, function (data) {
            $scope.isMarkering = false;
            precincts = data.value;
            precincts.forEach(function (item) {
                var address = item.Street.StreetType.Name + item.Street.Name + ", " + item.House + ", " + item.City.CityType.Name + item.City.Name + ", " + item.City.RegionPart.Name + " р-н";
                createMarker(address, item.lat, item.lng);
            });
            map.fitBounds(bounds);
        }, function (error) {
            $scope.isMarkering = false;
            error.description = 'Маркування дільниць не виконано';
            $rootScope.errorMsg = serviceUtil.getErrorMessage(error);
        });
    };

    $scope.onSelectRegionPart = function ($item, $model, $label) {
        $scope.selected.RegionPart = $item;
        $scope.selected.RegionPartId = $model;
    };
}]);