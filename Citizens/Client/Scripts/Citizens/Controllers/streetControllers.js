'use strict';

var streetControllers = angular.module('streetControllers', ['streetServices']);

streetControllers.controller("listStreetsController", ['$location', '$rootScope', '$scope', 'streetData', 'typeStreetData', 'config', 'serviceUtil',
    function ($location, $rootScope, $scope, streetData, typeStreetData, config, serviceUtil) {
        var editInd;
        $scope.loading = true;
        $scope.saving = false;

        $scope.query = {};
        $scope.queryBy = 'Name';

        $rootScope.errorMsg = '';
        $rootScope.successMsg = '';

        $scope.currentPage = serviceUtil.getRouteParam("currPage");
        if (!$scope.currentPage) {
            $scope.currentPage = 1;
        }
        $scope.pageSize = config.pageSize;
        $scope.streets = [];
        $scope.selected = { street: {}};
        $scope.tableHead = ['№', 'Назва', 'Тип', 'Дії'];

        $scope.getIndex = function (street) {
            return $scope.streets.indexOf(street);
        };

        streetData.query(function (streets) {
            $scope.streets = streets.value;
            $scope.loading = false;
            //$scope.streets.sort(serviceUtil.compareByName);
        }, errorHandler);

        $scope.loading = true;
        typeStreetData.query(function (types) {
            $scope.typesStreet = types.value;
            $scope.loading = false;
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
            $rootScope.errorMsg = '';
            streetData.remove({ id: street.Id },
                function () {
                    $scope.streets.splice($scope.getIndex(street), 1);
                }, errorHandler);
        };

        $scope.save = function () {
            $rootScope.errorMsg = '';
            $scope.saving = true;
            var street = {
                "Id": 0,
                "Name": '',
                "StreetTypeId": 0
            }
            serviceUtil.copyProperties($scope.selected.street, street);
            if ($scope.addMode) {
                streetData.save(street,
                    function (newItem) {
                        streetData.getById({ id: newItem.Id }, function (res) {
                            $scope.saving = false;
                            $scope.streets.push(res);
                            $scope.streets.sort(serviceUtil.compareByName);
                            $scope.reset();
                        }, errorHandler);
                    }, errorHandler);
            } else {
                streetData.update({ id: $scope.selected.street.Id }, street,
                    function () {
                        streetData.getById({ id: $scope.selected.street.Id }, function (res) {
                            $scope.saving = false;
                            $scope.streets[editInd] = res;
                            $scope.streets.sort(serviceUtil.compareByName);
                            $scope.reset();
                        }, errorHandler);
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
            $scope.loading = false;
            $scope.reset();
            $rootScope.errorMsg = serviceUtil.getErrorMessage(e);
        };

        $scope.onPageChange = function (newPageNumber) {
            $location.path("/streets/" + newPageNumber);
        };
}]);
