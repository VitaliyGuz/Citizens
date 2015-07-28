'use strict';

var neighborhoodControllers = angular.module('neighborhoodControllers', ['neighborhoodServices']);

neighborhoodControllers.controller("listNeighborhoodsController", ['$rootScope', '$location', '$scope', 'config', 'serviceUtil', 'neighborhoodData',
    function ($rootScope, $location, $scope, config, serviceUtil, neighborhoodData) {
        var editInd;
        $rootScope.pageTitle = 'Мікрорайони';

        $scope.currentPage = serviceUtil.getRouteParam("currPage") || 1;

        $scope.pageSize = config.pageSize;
        $scope.selected = { neighborhood: {} };
        $scope.tableHead = ['№', 'Назва'];
        
        $scope.getIndex = function (neighborhood) {
            return $rootScope.neighborhoods.indexOf(neighborhood);
        };

        $scope.edit = function (neighborhood) {
            $rootScope.errorMsg = '';
            $scope.addMode = false;
            $scope.reset();
            editInd = $scope.getIndex(neighborhood);
            neighborhoodData.getById({ id: neighborhood.Id }, function (res) {
                $scope.selected.neighborhood = res;
            }, errorHandler);
        };

        $scope.delete = function (neighborhood) {
            if (config.checkDeleteItem) {
                var ok = confirm("Увага! Мікрорайон буде видалено, продовжити?");
                if (!ok) return;
            }
            $rootScope.errorMsg = '';
            neighborhoodData.remove({ id: neighborhood.Id },
                function () {
                    $rootScope.neighborhoods.splice($scope.getIndex(neighborhood), 1);
                }, errorHandler);
        };

        $scope.save = function () {
            if (!$scope.selected.neighborhood.Name) {
                $rootScope.errorMsg = 'Не вказана назва мікрорайону';
                return;
            }
            $scope.saving = true;

            if ($scope.addMode) {
                neighborhoodData.save({ Name: $scope.selected.neighborhood.Name }, successHandler, errorHandler);
            } else {
                neighborhoodData.update({ id: $scope.selected.neighborhood.Id }, { Id: $scope.selected.neighborhood.Id, Name: $scope.selected.neighborhood.Name },
                    successHandler, errorHandler);
            }
        };

        $scope.addNew = function () {
            $scope.reset();
            $scope.addMode = true;
        };

        $scope.getTemplate = function (neighborhood, colName) {
            if (neighborhood.Id === $scope.selected.neighborhood.Id) return 'edit' + colName;
            else return 'display' + colName;
        };

        $scope.reset = function () {
            $scope.addMode = false;
            $scope.selected.neighborhood = {};
        };

        function errorHandler(e) {
            $scope.saving = false;
            $scope.reset();
            $rootScope.errorMsg = serviceUtil.getErrorMessage(e);
        };

        function successHandler(res) {
            $scope.saving = false;
            if ($scope.addMode) {
                $rootScope.neighborhoods.push(res);
            } else {
                $rootScope.neighborhoods[editInd] = res;
            }
            $rootScope.neighborhoods.sort(serviceUtil.compareByName);
            $scope.reset();
        };

        $scope.onPageChange = function (newPageNumber) {
            //$location.path("/neighborhoods/" + newPageNumber);
            //$location.search("currPage", newPageNumber);
        };
    }]);
