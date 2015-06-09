'use strict';

var cityModule = angular.module('cityControllers', ['cityServices', 'regionPartServices']);

cityModule.controller("listCitiesController", ['$rootScope', '$location', '$timeout', '$scope', 'config', 'serviceUtil', 'cityTypesData', 'cityData', 'cityRegionPartsData',
    function ($rootScope, $location, $timeout, $scope, config, serviceUtil, cityTypesData, cityData) {

        $scope.query = {};
        $scope.queryBy = 'Name';

        $rootScope.errorMsg = '';
        $rootScope.successMsg = '';

        $scope.currentPage = serviceUtil.getRouteParam("currPage") || 1;
        $scope.pageSize = config.pageSize;

        $scope.tableHead = ['№', 'Населений пункт', 'Район', 'Дії'];
        
        $scope.getIndex = function (city) {
            return $rootScope.cities.indexOf(city);
        };

        //if ($rootScope.cities == undefined || $rootScope.cities.length === 0) {
        //    $scope.loading = true;
        //    cityData.getAll(function (res) {
        //        $rootScope.errorMsg = '';
        //        $scope.loading = false;
        //        $rootScope.cities = res.value;
        //    }, errorHandler);
        //};

        $scope.edit = function (city) {
            $rootScope.editInd = $scope.getIndex(city);
            $location.path('/city/' + city.Id);
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
                }, errorHandler);
        };

        $scope.addNew = function () {
            $location.path('/city/new');
        };

        function errorHandler(e) {
            $scope.loading = false;
            $scope.errorMsg = serviceUtil.getErrorMessage(e);
        };
    }]);

cityModule.controller('editCityController', ['$timeout', '$rootScope', '$scope', '$location', '$routeParams', 'cityData', 'cityTypesData', 'serviceUtil', 'regionPartTypes', 'regionPartData', 'cityRegionPartsData','config',
    function ($timeout, $rootScope, $scope, $location, $routeParams, cityData, cityTypesData, serviceUtil, regionPartTypes, regionPartData, cityRegionPartsData, config) {
        var editInd, editableCityDistrict, addMode, routeId;
        $scope.loading = true;
        $scope.saving = false;
        addMode = true;
        $rootScope.errorMsg = '';
        $rootScope.successMsg = '';
        $scope.tableHead = ['№', 'Район'];
        $scope.selected = { cityDistrict: {} };
        $scope.cityDistricts = [];
        routeId = serviceUtil.getRouteParam("id");
        if (routeId) {
            cityData.getById({ id: routeId }, function (res) {
                $scope.loading = false;
                addMode = false;
                $scope.city = res;
                $scope.cityDistricts = res.CityRegionParts;
            }, errorHandler);
        }

        $scope.loading = true;
        cityTypesData.query(function (res) {
            $scope.cityTypes = res.value;
            $scope.loading = false;
            //$scope.cityTypes.sort(serviceUtil.compareByName);
        }, errorHandler);

        $scope.loading = true;
        regionPartData.getAllByType({ type: regionPartTypes.REGION.val }, function (res) {
            $scope.regionParts = res.value;
            $scope.loading = false;
            $scope.regionParts.sort(serviceUtil.compareByName);
        }, errorHandler);

        $scope.loading = true;
        regionPartData.getAllByType({ type: regionPartTypes.CITY.val }, function (res) {
            $scope.cityRegionParts = res.value;
            $scope.loading = false;
            $scope.cityRegionParts.sort(serviceUtil.compareByName);
        }, errorHandler);

        $scope.save = function () {
            $scope.saving = true;
            $rootScope.errorMsg = '';
            // todo: factory method
            var city = {
                "Id": 0,
                "Name": '',
                "CityTypeId": 0,
                "IncludedToRegionPart": null,
                "RegionPartId": 0
            }
            serviceUtil.copyProperties($scope.city, city);
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
                        $rootScope.cities.push(res);
                    } else {
                        $rootScope.cities[$rootScope.editInd] = res;
                    }
                    $rootScope.cities.sort(compareCities);
                }
                $rootScope.successMsg = msg;
                
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
            if ($scope.city.Id == null) {
                $rootScope.errorMsg = "Спочатку необхідно зберегти населений пункт";
                return;
            }
            $rootScope.errorMsg = '';
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
                $scope.cityDistricts.sort(serviceUtil.compareByName);            
            };
        };

        function getKey(cityDistrict) {
            return { cityId: cityDistrict.CityId, regionPartId: cityDistrict.RegionPartId };
        };

        $scope.backToList = function () {
            $scope.reset();
            $rootScope.errorMsg = '';
            $location.path('cities');
        };

        function errorHandler(e) {
            $scope.saving = false;
            $scope.loading = false;
            $scope.savingCityDistrict = false;
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