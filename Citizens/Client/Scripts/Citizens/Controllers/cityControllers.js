﻿'use strict';

var cityControllers = angular.module('cityControllers', ['cityServices']);

cityControllers.controller("listCitiesController", ['$rootScope', '$location', '$scope', 'config', 'serviceUtil', 'cityData', 'filterSettings',
    function ($rootScope, $location, $scope, config, serviceUtil, cityData, filterSettings) {

        $rootScope.pageTitle = 'Населені пункти';
        $rootScope.editInd = -1;
        $scope.currentPage = serviceUtil.getRouteParam("currPage") || 1;
        $scope.pageSize = config.pageSize;

        $scope.tableHead = ['№', 'Населений пункт', 'Район', 'Дії'];

        var citiesQuery = filterSettings.get('cities');
        if (citiesQuery) {
            $scope.query = citiesQuery;
            $scope.queryBy = Object.keys(citiesQuery)[0];
        } else {
            $scope.query = {};
            $scope.queryBy = 'Name';
        }

        $scope.onFilterQueryChange = function (isChangeValue) {
            if (isChangeValue) {
                filterSettings.set('cities', $scope.query);
            } else {
                $scope.query = {};
                filterSettings.remove('cities');
            }
        };

        $scope.getIndex = function (city) {
            return $rootScope.cities.indexOf(city);
        };

        $scope.edit = function (city) {
            $rootScope.editInd = $scope.getIndex(city);
            $location.path('/city/' + city.Id +'/' + $scope.currentPage);
        };

        $scope.delete = function (city) {
            if (config.checkDeleteItem) {
                var ok = confirm("Увага! Населений пункт буде видалено, продовжити?");
                if (!ok) return;
            }
            $rootScope.errorMsg = '';
            cityData.remove({ id: city.Id },
                function () {
                    $rootScope.cities.splice($scope.getIndex(city), 1);
                }, function(e) {
                    $rootScope.errorMsg = serviceUtil.getErrorMessage(e);
                });
        };

        $scope.addNew = function () {
            $rootScope.errorMsg = '';
            $location.path('/city/new' + '/' + $scope.currentPage);
        };

        $scope.onPageChange = function (newPageNumber) {
            //todo: change location path without reload page
            $location.path("/cities/" + newPageNumber);
        };
    }]);

cityControllers.controller('editCityController', ['$rootScope', '$scope', '$location', 'cityData', 'serviceUtil', 'cityRegionPartsData', 'config', 'resolvedData', 'modelFactory', 'regionPartData',
    function ($rootScope, $scope, $location, cityData, serviceUtil, cityRegionPartsData, config, resolvedData, modelFactory,regionPartData) {
        var editInd, editableCityDistrict, addMode;
        $rootScope.pageTitle = 'Населений пункт';
        $scope.loader = {};
        $scope.saving = false;
        addMode = true;
        $scope.tableHead = [
           '№',
           'Район',
           'К-сть виборців',
           'Планова к-сть старших',
           'Факт. к-сть старших',
           '% старших',
           'Явка',
           'К-сть необхідних голосів',
           'К-сть домогосподарств'
        ];
        $scope.selected = { cityDistrict: {} };
        $scope.cityDistricts = [];
        if (resolvedData) {
            if (resolvedData.city) {
                addMode = false;
                $scope.city = resolvedData.city;
                $scope.cityDistricts = resolvedData.city.CityRegionParts;
                calcComputedProperties();
            }
            $scope.cityTypes = resolvedData.cityTypes;
            $scope.regionParts = resolvedData.regionParts;
            $scope.cityRegionParts = resolvedData.cityRegionParts;
        }

        function calcComputedProperties() {
            if ($scope.cityDistricts.length === 0) return;
            $scope.loader.calculation = true;
            regionPartData.getComputedProperties(function (resp) {
                resp.value.forEach(function (computed) {
                    var found = $scope.cityDistricts.filter(function (cd) {
                        return cd.RegionPartId === computed.Id;
                    });
                    if (found.length > 0) {
                        var cityDistrict = found[0];
                        cityDistrict.countMajors = computed.CountMajors;
                        cityDistrict.countElectors = computed.CountElectors;
                        cityDistrict.countHouseholds = computed.CountHouseholds;
                        cityDistrict.countMajorsPlan = serviceUtil.computational.countMajorsPlan(computed.CountElectors);
                        cityDistrict.percentageMajors = Math.round(computed.CountMajors * 100 / cityDistrict.countMajorsPlan);
                        cityDistrict.voterTurnout = serviceUtil.computational.voterTurnout(computed.CountElectors);
                        cityDistrict.requiredVotes = serviceUtil.computational.requiredVotes(computed.CountElectors);
                    }
                });
                $scope.loader.calculation = false;
            }, errorHandler);
        };

        $scope.refreshComputedProperties = function() {
            calcComputedProperties();
        };

        $scope.save = function () {
            $scope.saving = true;
            $rootScope.errorMsg = '';
            var city = modelFactory.createObject('city', $scope.city);
            if (addMode) {
                cityData.save(city,
                    function (newItem) {
                        cityData.getById({ id: newItem.Id }, function (res) {
                            querySuccessHandler('Населений пункт успішно створено!', res);
                        }, errorHandler);
                    }, errorHandler);
            } else {
                cityData.update({ id: city.Id }, city,
                    function () {
                        cityData.getById({ id: $scope.city.Id }, function (res) {                           
                            querySuccessHandler('Зміни успішно збережено!', res);
                        }, errorHandler);
                    }, errorHandler);
            }

            function querySuccessHandler(msg, res) {
                $scope.saving = false;
                if ($rootScope.cities) {
                    if (addMode) {
                        $scope.city = res;
                        $rootScope.cities.push(res);
                    } else {
                        $rootScope.cities[$rootScope.editInd] = res;
                    }
                    $rootScope.cities.sort(compareCities);
                }
                $rootScope.successMsg = msg;
                addMode = false;
            };
        };

        function compareCities(a, b) {
            var cmpType = a.CityTypeId > b.CityTypeId ? 1 : a.CityTypeId < b.CityTypeId ? -1 : 0;
            return cmpType === 0 ? serviceUtil.compareByName(a, b) : cmpType;
        };

        $scope.editCityDistrict = function (cityDistrict) {
            $scope.reset();
            $rootScope.errorMsg = '';
            editableCityDistrict = cityDistrict;
            $scope.addCityDistrictMode = false;
            editInd = $scope.getIndex(cityDistrict);
            cityRegionPartsData.getByKey(getKey(cityDistrict), function (res) {
                $scope.selected.cityDistrict = res;
            }, errorHandler);
        };

        $scope.deleteCityDistrict = function (cityDistrict) {
            if (config.checkDeleteItem) {
                var ok = confirm("Увага! Район міста буде видалено, продовжити?");
                if (!ok) return;
            }
            $rootScope.errorMsg = '';
            cityRegionPartsData.remove(getKey(cityDistrict),
                function () {
                    $scope.cityDistricts.splice($scope.getIndex(cityDistrict), 1);
                }, errorHandler);
        };

        $scope.addNewCityDistrict = function () {
            $rootScope.errorMsg = '';
            $scope.addCityDistrictMode = true;
        };

        $scope.saveCityDistrict = function () {
            $rootScope.errorMsg = '';
            if (!$scope.city.Id) {
                $rootScope.errorMsg = "Спочатку необхідно зберегти населений пункт";
                return;
            }
            $scope.savingCityDistrict = true;
            var cityDistrict = {
                "CityId": $scope.city.Id,
                "RegionPartId": $scope.selected.cityDistrict.RegionPartId
            };
            
            if ($scope.addCityDistrictMode) {
                cityRegionPartsData.save(cityDistrict, function () {
                    cityRegionPartsData.getByKey(getKey(cityDistrict), successHandler, errorHandler);
                }, errorHandler);
            } else {
                cityRegionPartsData.update(getKey($scope.cityDistricts[editInd]), cityDistrict, function (updated) {
                    cityRegionPartsData.getByKey(getKey(updated), successHandler, errorHandler);
                }, errorHandler);
            }
            function successHandler(res) {
                $scope.savingCityDistrict = false;
                if ($scope.addCityDistrictMode) {
                    $scope.cityDistricts.push(res);
                } else {
                    $scope.cityDistricts[editInd] = res;
                }
                $scope.reset();
                $scope.cityDistricts.sort(function(a, b) {
                    return serviceUtil.compareByName(a.RegionPart, b.RegionPart);
                });            
            };
        };

        function getKey(cityDistrict) {
            return { cityId: cityDistrict.CityId, regionPartId: cityDistrict.RegionPartId };
        };

        $scope.backToList = function () {
            $scope.reset();
            $rootScope.errorMsg = '';
            var currPage = serviceUtil.getRouteParam("currPage") || 1;
            $location.path('/cities/'+ currPage);
        };

        function errorHandler(e) {
            $scope.saving = false;
            $scope.loading = false;
            $scope.savingCityDistrict = false;
            $scope.loader = {};
            $scope.reset();
            $rootScope.errorMsg = serviceUtil.getErrorMessage(e);
        };

        $scope.reset = function () {
            $scope.addCityDistrictMode = false;
            $scope.selected.cityDistrict = {};
            editableCityDistrict = {};
        };

        $scope.getIndex = function (cityDistrict) {
            if ($scope.cityDistricts == undefined) return undefined;
            return $scope.cityDistricts.indexOf(cityDistrict);
        };

        $scope.getTemplate = function (cityDistrict) {
            if (cityDistrict === editableCityDistrict) return 'edit';
            else return 'display';
        };
    }]);