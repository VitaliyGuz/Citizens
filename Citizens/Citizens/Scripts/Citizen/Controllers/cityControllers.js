'use strict';

var cityModule = angular.module('cityModule', ['cityServices', 'regionPartServices', 'angularUtils.directives.dirPagination', 'appCitizen','ngRoute']);

cityModule.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
        when('/list', {
            templateUrl: '/City/ListCities',
            controller: 'listController'
        }).
        when('/new', {
            templateUrl: '/City/EditCity',
            controller: 'editController'
        }).
        when('/edit/:id', {
            templateUrl: '/City/EditCity',
            controller: 'editController'
        }).
        otherwise({
            redirectTo: 'list'
        });
}]);

cityModule.controller("listController", ['$rootScope', '$location', '$timeout', '$scope', 'config', 'serviceUtil', 'cityTypesData', 'cityData', 'cityRegionPartsData',
    function ($rootScope, $location, $timeout, $scope, config, serviceUtil, cityTypesData, cityData, cityRegionPartsData) {

        $scope.query = {};
        $scope.queryBy = 'Name';

        $rootScope.errorMsg = '';
        $rootScope.successMsg = '';

        $scope.currentPage = 1;
        $scope.pageSize = config.pageSize;

        $scope.tableHead = ['№', 'Населений пункт', 'Район', 'Дії'];
        
        $scope.getIndex = function (city) {
            return $scope.cities.indexOf(city);
        };

        if ($rootScope.cities == undefined || $rootScope.cities.length === 0) {
            $scope.loading = true;
            cityData.getAll(function (res) {
                $rootScope.cities = res.value;
                $scope.loading = false;
                //$rootScope.cities.sort(serviceUtil.compareByName);
            }, errorHandler);
        };

        $scope.edit = function (city) {
            $rootScope.editInd = $scope.getIndex(city);
            $location.path('edit/' + city.Id);
        };

        $scope.delete = function (city) {
            cityData.remove({ id: city.Id },
                function () {
                    $rootScope.cities.splice($scope.getIndex(city), 1);
                }, errorHandler);
        };

        $scope.addNew = function () {
            $location.path('new');
        };

        function errorHandler(e) {
            $scope.loading = false;
            $scope.errorMsg = serviceUtil.getErrorMessage(e);
        };

        //$scope.$watch('successMsg + errorMsg', function (newValue) {
        //    if (newValue.length > 0) {
        //        closeAlertAtTimeout();
        //    }
        //});

        //function closeAlertAtTimeout() {
        //    $timeout(function () {
        //        $rootScope.successMsg = '';
        //        $rootScope.errorMsg = '';
        //    }, 2000);
        //};
    }]);

cityModule.controller('editController', ['$timeout', '$rootScope', '$scope', '$location', '$routeParams', 'cityData', 'cityTypesData', 'serviceUtil', 'regionPartTypes', 'regionPartData', 'cityRegionPartsData',
    function ($timeout, $rootScope, $scope, $location, $routeParams, cityData, cityTypesData, serviceUtil, regionPartTypes, regionPartData, cityRegionPartsData) {
        var editInd, editableCityDistrict, addMode;
        $scope.loading = true;
        $scope.saving = false;
        addMode = true;
        $rootScope.errorMsg = '';
        $rootScope.successMsg = '';
        $scope.tableHead = ['№', 'Район'];
        $scope.selected = { cityDistrict: {} };
        $scope.cityDistricts = [];

        if ($routeParams.id != undefined) {
            cityData.getById({ id: $routeParams.id }, function (res) {
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
                    $rootScope.cities.sort(serviceUtil.compareByName);
                }
                $rootScope.successMsg = msg;
                
            };
        };

        $scope.editCityDistrict = function (cityDistrict) {
            $scope.reset();
            editableCityDistrict = cityDistrict;
            $scope.addCityDistrictMode = false;
            editInd = $scope.getIndex(cityDistrict);
            cityRegionPartsData.getByKey(getKey(cityDistrict), function (res) {
                $scope.selected.cityDistrict = res;
            }, errorHandler);
        };

        $scope.deleteCityDistrict = function (cityDistrict) {
            cityRegionPartsData.remove(getKey(cityDistrict),
                function () {
                    $scope.cityDistricts.splice($scope.getIndex(cityDistrict), 1);
                }, errorHandler);
        };

        $scope.addNewCityDistrict = function () {
            $scope.addCityDistrictMode = true;
        };

        $scope.saveCityDistrict = function () {
            if ($scope.city.Id == null) {
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
                $scope.cityDistricts.sort(serviceUtil.compareByName);            
            };
        };

        function getKey(cityDistrict) {
            return { cityId: cityDistrict.CityId, regionPartId: cityDistrict.RegionPartId };
        };

        $scope.backToList = function () {
            $scope.reset();
            $location.path('list');
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

        //$scope.$watch('successMsg + errorMsg', function (newValue) {
        //    if (newValue.length > 0) {
        //        closeAlertAtTimeout();
        //    }
        //});

        //function closeAlertAtTimeout() {
        //    $timeout(function () {
        //        $rootScope.successMsg = '';
        //        $rootScope.errorMsg = '';
        //    }, 2000);
        //};

        $scope.getTemplate = function (cityDistrict) {
            if (cityDistrict === editableCityDistrict) return 'edit';
            else return 'display';
        };
    }]);