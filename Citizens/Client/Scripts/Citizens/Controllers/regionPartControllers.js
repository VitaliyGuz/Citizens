'use strict';

var regionPartControllers = angular.module('regionPartControllers', ['regionPartServices']);

regionPartControllers.controller("listRegionPartsController", ['$rootScope', '$location','$timeout', '$scope', 'config', 'serviceUtil', 'regionPartData', 'regionData', 'regionPartTypes',
    function ($rootScope, $location, $timeout, $scope, config, serviceUtil, regionPartData, regionData, regionPartTypes) {
        var editInd;
        $rootScope.pageTitle = 'Райони';
        $scope.saving = false;

        $scope.query = {};
        $scope.queryBy = 'Name';

        $scope.currentPage = serviceUtil.getRouteParam("currPage") || 1;
        
        $scope.pageSize = config.pageSize;
        $scope.selected = { regionPart: {} };
        $scope.tableHead = ['№', 'Назва', 'Область', 'Тип', 'Дії'];
        $scope.regionPartTypes = regionPartTypes;

        $scope.getIndex = function(regionPart) {
            return $rootScope.regionParts.indexOf(regionPart);
        };

        //$scope.loading = true;
        regionData.query(function (regions) {
            $scope.regions = regions.value;
            //$scope.loading = false;
            $scope.regions.sort(serviceUtil.compareByName);
        }, errorHandler);

        $scope.edit = function(regionPart) {
            $rootScope.errorMsg = '';
            $scope.addMode = false;
            $scope.reset();
            editInd = $scope.getIndex(regionPart);
            regionPartData.getById({ id: regionPart.Id }, function (res) {
                $scope.selected.regionPart = res;
            }, errorHandler);
        };

        $scope.delete = function (regionPart) {
            if (config.checkDeleteItem) {
                var ok = confirm("Увага! Район буде видалено, продовжити?");
                if (!ok) return;
            }
            $rootScope.errorMsg = '';
            regionPartData.remove({ id: regionPart.Id },
                function() {
                    $rootScope.regionParts.splice($scope.getIndex(regionPart), 1);
                }, errorHandler);
        };

        $scope.save = function() {
            if (!$scope.selected.regionPart.RegionPartType) {
                $rootScope.errorMsg = 'Не вказаний тип району';
                return;
            }
            $scope.saving = true;

            // todo: factory method
            var regionPart = {
                "Id": 0,
                "Name": '',
                "RegionId": 0,
                "RegionPartType": ''
            }
            serviceUtil.copyProperties($scope.selected.regionPart, regionPart);
            if ($scope.addMode) {
                regionPartData.save(regionPart,
                    function(newItem) {
                        regionPartData.getById({ id: newItem.Id }, function (res) {
                            querySuccessHandler(res);
                        }, errorHandler);
                    }, errorHandler);
            } else {
                regionPartData.update({ id: $scope.selected.regionPart.Id }, regionPart,
                    function() {
                        regionPartData.getById({ id: $scope.selected.regionPart.Id }, function (res) {
                            querySuccessHandler(res, editInd);
                        }, errorHandler);
                    }, errorHandler);
            }
        };

        $scope.addNew = function() {
            $scope.reset();
            $scope.addMode = true;
        };

        $scope.getTemplate = function(regionPart, colName) {
            if (regionPart.Id === $scope.selected.regionPart.Id) return 'edit' + colName;
            else return 'display' + colName;
        };

        $scope.reset = function () {
            $scope.addMode = false;
            $scope.selected.regionPart = {};
        };

        function errorHandler(e) {
            $scope.saving = false;
            $scope.loading = false;
            $scope.reset();
            $rootScope.errorMsg = serviceUtil.getErrorMessage(e);
        };

        function querySuccessHandler(res,ind) {
            $scope.saving = false;
            if (ind == undefined) {
                $rootScope.regionParts.push(res);
            } else {
                $rootScope.regionParts[ind] = res;
            }           
            $rootScope.regionParts.sort(serviceUtil.compareByName);
            $scope.reset();
        };

        $scope.onPageChange = function (newPageNumber) {
            //todo: cache regionData and change location path without reload page
            //$location.path("/region-parts/" + newPageNumber);
            //$location.search("currPage", newPageNumber);
        };
    }]);
