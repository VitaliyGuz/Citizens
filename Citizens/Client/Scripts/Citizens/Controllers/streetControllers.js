'use strict';

var streetControllers = angular.module('streetControllers', ['streetServices']);

streetControllers.controller("listStreetsController", ['$location', '$rootScope', '$scope', 'streetData', 'typeStreetData', 'config', 'serviceUtil', 'modelFactory',
    function ($location, $rootScope, $scope, streetData, typeStreetData, config, serviceUtil, modelFactory) {
        var editInd;
        $rootScope.pageTitle = 'Вулиці';
        
        $scope.saving = false;

        $scope.query = {};
        $scope.queryBy = 'Name';

        $scope.currentPage = serviceUtil.getRouteParam("currPage") || 1;

        $scope.pageSize = config.pageSize;
        $scope.selected = { street: {}};
        $scope.tableHead = ['№', 'Назва', 'Тип', 'Дії'];

        $scope.getIndex = function (street) {
            return $rootScope.streets.indexOf(street);
        };

        typeStreetData.query(function (types) {
            $scope.typesStreet = types.value;
        },errorHandler);

        $scope.edit = function (street) {
            $rootScope.errorMsg = '';
            $scope.addMode = false;
            $scope.reset();
            editInd = $scope.getIndex(street);
            streetData.getById({ id: street.Id }, function (res) {
                $scope.selected.street = res;
            }, errorHandler);
        };

        $scope.delete = function (street) {
            if (config.checkDeleteItem) {
                var ok = confirm("Увага! Вулицю буде видалено, продовжити?");
                if (!ok) return;
            }
            $rootScope.errorMsg = '';
            streetData.remove({ id: street.Id },
                function () {
                    $rootScope.streets.splice($scope.getIndex(street), 1);
                }, errorHandler);
        };

        $scope.save = function () {
            $rootScope.errorMsg = '';
            $scope.saving = true;
            if ($scope.selected.street.StreetType) $scope.selected.street.StreetTypeId = $scope.selected.street.StreetType.Id;
            var street = modelFactory.createObject('street', $scope.selected.street);
            if ($scope.addMode) {
                streetData.save(street, function (newItem) {
                    $scope.saving = false;
                    $scope.selected.street.Id = newItem.Id;
                    $rootScope.streets.push($scope.selected.street);
                    $rootScope.streets.sort(serviceUtil.compareByName);
                    $scope.reset();
                }, errorHandler);
            } else {
                streetData.update({ id: $scope.selected.street.Id }, street, function () {
                    $scope.saving = false;
                    $rootScope.streets[editInd] = $scope.selected.street;
                    $rootScope.streets.sort(serviceUtil.compareByName);
                    $scope.reset();
                }, errorHandler);
            }
        };

        $scope.addNew = function () {
            $rootScope.errorMsg = '';
            $scope.reset();
            $scope.addMode = true;
        };

        $scope.getTemplate = function (street, colName) {
            if (street.Id === $scope.selected.street.Id) return 'edit' + colName;
            else return 'display' + colName;
        };

        $scope.reset = function () {
            $scope.addMode = false;
            $scope.selected.street = {};
        };

        function errorHandler(e) {
            $scope.saving = false;
            $scope.reset();
            $rootScope.errorMsg = serviceUtil.getErrorMessage(e);
        };

        $scope.onPageChange = function (newPageNumber) {
            //$location.path("/streets/" + newPageNumber);
        };
}]);
