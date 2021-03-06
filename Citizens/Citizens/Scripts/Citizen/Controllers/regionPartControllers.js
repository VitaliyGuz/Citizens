﻿'use strict';

var regionPartControllers = angular.module('regionPartControllers', ['regionPartServices', 'angularUtils.directives.dirPagination', 'appCitizen']);

regionPartControllers.controller("listController", ['$timeout','$scope', 'config','serviceUtil','regionPartData','regionData','regionPartTypes',
    function ($timeout, $scope, config, serviceUtil, regionPartData, regionData, regionPartTypes) {
        var editInd;
        $scope.loading = true;
        $scope.saving = false;

        $scope.query = {};
        $scope.queryBy = 'Name';

        $scope.errorMsg = '';
        $scope.successMsg = '';

        $scope.currentPage = 1;
        $scope.pageSize = config.pageSize;
        $scope.regionParts = [];
        $scope.selected = { regionPart: {} };
        $scope.tableHead = ['№', 'Назва', 'Область', 'Тип', 'Дії'];
        $scope.regionPartTypes = regionPartTypes;

        $scope.getIndex = function (regionPart) {
            return $scope.regionParts.indexOf(regionPart);
        }

        regionPartData.query(function (regionParts) {
            $scope.regionParts = regionParts.value;
            $scope.loading = false;
            $scope.regionParts.sort(serviceUtil.compareByName);
        }, errorHandler);

        $scope.loading = true;
        regionData.query(function (regions) {
            $scope.regions = regions.value;
            $scope.loading = false;
            $scope.regions.sort(serviceUtil.compareByName);
        }, errorHandler);

        $scope.edit = function (regionPart) {
            $scope.errorMsg = '';
            $scope.addMode = false;
            $scope.reset();
            editInd = $scope.getIndex(regionPart);
            regionPartData.query({ id: regionPart.Id }, function (res) {
                $scope.selected.regionPart = res;
            }, errorHandler);
        }

        $scope.delete = function (regionPart) {
            if (config.checkDeleteItem) {
                var ok = confirm("Увага! Район буде видалено, продовжити?");
                if (!ok) return;
            }
            $scope.errorMsg = '';
            regionPartData.remove({ id: regionPart.Id },
                function () {
                    $scope.regionParts.splice($scope.getIndex(regionPart), 1);
                }, errorHandler);
        }

        $scope.save = function () {
            if (!$scope.selected.regionPart.RegionPartType) {
                $scope.errorMsg = 'Не вказаний тип району';
                return;
            }
            $scope.saving = true;

            // todo: factory method
            var regionPart = {
                "Id": 0,
                "Name": '',
                "RegionId": 0,
                "RegionPartType":''
            }
            serviceUtil.copyProperties($scope.selected.regionPart, regionPart);
            if ($scope.addMode) {
                regionPartData.save(regionPart,
                    function (newItem) {
                        regionPartData.query({ id: newItem.Id }, function (res) {
                            querySuccessHandler(res);
                        }, errorHandler);
                    }, errorHandler);
            } else {
                regionPartData.update({ id: $scope.selected.regionPart.Id }, regionPart,
                    function () {
                        regionPartData.query({ id: $scope.selected.regionPart.Id }, function (res) {
                            querySuccessHandler(res, editInd);
                        }, errorHandler);
                    }, errorHandler);
            }
        }

        $scope.addNew = function () {
            $scope.reset();
            $scope.addMode = true;
        }

        $scope.getTemplate = function (regionPart, colName) {
            if (regionPart.Id === $scope.selected.regionPart.Id) return 'edit' + colName;
            else return 'display' + colName;
        }

        $scope.reset = function () {
            $scope.addMode = false;
            $scope.selected.regionPart = {};
        };

        function errorHandler(e) {
            $scope.saving = false;
            $scope.loading = false;
            $scope.reset();
            $scope.errorMsg = serviceUtil.getErrorMessage(e);
        }

        function querySuccessHandler(res,ind) {
            $scope.saving = false;
            if (ind == undefined) {
                $scope.regionParts.push(res);
            } else {
                $scope.regionParts[ind] = res;
            }           
            $scope.regionParts.sort(serviceUtil.compareByName);
            $scope.reset();
        }

        $scope.$watch('successMsg + errorMsg', function (newValue) {
            if (newValue.length > 0) {
                closeAlertAtTimeout();
            }
        });

        function closeAlertAtTimeout() {
            $timeout(function () {
                $scope.successMsg = '';
                $scope.errorMsg = '';
            }, 2000);
        }
    }]);
