'use strict';

var districtControllers = angular.module('districtControllers', ['precinctServices']);

districtControllers.controller("listDistrictsController", ['$rootScope', '$location', '$scope', 'config', 'serviceUtil', 'districtDataService', 'filterSettings',
    function ($rootScope, $location, $scope, config, serviceUtil, districtDataService, filterSettings) {

        $rootScope.pageTitle = 'Округи';
        $scope.tableHead = ['№', '№ округу', 'Тип', 'Дії'];

        $scope.pagination = {
            currentPage: serviceUtil.getRouteParam("currPage") || 1,
            pageSize: config.pageSize
        };
        
        $scope.districts = districtDataService.cache.get();

        $scope.filter = {};
        var settings = filterSettings.get('districts');
        if (settings) {
            $scope.filter = settings;
        } else {
            $scope.filter.query = {};
            $scope.filter.expression = {};
            $scope.filter.queryBy = 'Number';
        }

        $scope.onFilterQueryChange = function (isChangeValue) {
            if (isChangeValue) {
                $scope.filter.expression = serviceUtil.getFilterExpression($scope.filter.queryBy.split("."), $scope.filter.query[$scope.filter.queryBy]);
                filterSettings.set('districts', $scope.filter);
            } else {
                $scope.filter.query = {};
                $scope.filter.expression = {};
                filterSettings.remove('districts');
            }
        };
        
        $scope.getIndex = function (ind) {
            return ($scope.pagination.currentPage - 1) * $scope.pagination.pageSize + ind;
        };

        $scope.edit = function (district) {
            $location.path('/district/' + district.Id + '/' + $scope.pagination.currentPage);
        };

        $scope.delete = function (district) {
            if (config.checkDeleteItem) {
                var ok = confirm("Увага! Округ буде видалено, продовжити?");
                if (!ok) return;
            }
            $rootScope.errorMsg = '';
            districtDataService.resource.remove({ id: district.Id }, function () {
                districtDataService.cache.remove(district);
            }, function (e) {
               e.description = 'Округ не видалено';
               $rootScope.errorMsg = serviceUtil.getErrorMessage(e);
            });
        };

        $scope.addNew = function () {
            $rootScope.errorMsg = '';
            $location.path('/district/new' + '/' + $scope.pagination.currentPage);
        };

        $scope.onPageChange = function (newPageNumber) {
            $location.path("/districts/" + newPageNumber);
        };
    }]);

districtControllers.controller('editDistrictController', ['$rootScope', '$scope', '$location', 'serviceUtil', 'precinctDataService', 'config', 'districtDataService', 'resolvedData',
    function ($rootScope, $scope, $location, serviceUtil, precinctDataService, config, districtDataService, resolvedData) {
        var editablePrecinctDistrict;
        $rootScope.pageTitle = 'Округ';
        $scope.tableHead = ['№', 'Дільниця'];
        $scope.addMode = {
            district: resolvedData.district == undefined
        }
        
        $scope.selected = { precinct: undefined };
        $scope.loader = {};

        $scope.data = resolvedData;
        $scope.getPrecinctsByNumber = precinctDataService.typeaheadPrecinctByNumber;

        $scope.save = function () {
            $scope.loader.saving = true;
            $rootScope.errorMsg = '';
            // todo: model factory
            var districtModel = {
                "Id": 0,
                "Number": 0,
                "DistrictTypeId": 0
            }
            serviceUtil.copyProperties($scope.data.district, districtModel);
            if ($scope.addMode.district) {
                districtDataService.resource.save(districtModel, successHandler, errorHandler);
            } else {
                districtDataService.resource.update({ id: districtModel.Id }, districtModel, successHandler, errorHandler);
            }

            function successHandler(resp) {
                $scope.loader.saving = false;
                resp.DistrictType = $scope.data.types.filter(function (type) {
                    return type.Id === resp.DistrictTypeId
                })[0];
                if ($scope.addMode.district) {
                    $scope.data.district.Id = resp.Id;
                    if (!districtDataService.cache.isEmpty()) districtDataService.cache.add(resp);
                    $rootScope.successMsg = 'Округ успішно створено!';
                } else {
                    districtDataService.cache.update({ Id: resp.Id }, resp);
                    $rootScope.successMsg = 'Зміни успішно збережено!';
                }
                districtDataService.cache.sort();
                $scope.addMode.district = false;
            }
        };

        $scope.edit = function (precinctDistrict) {
            $scope.reset();
            $rootScope.errorMsg = '';
            $scope.addMode.precinct = false;
            editablePrecinctDistrict = precinctDistrict;
            precinctDataService.resources.precinct.getByIdNotExpand({ id: precinctDistrict.PrecinctId }, function (res) {
                $scope.selected.precinct = res;
            }, errorHandler);
        };

        $scope.delete = function (precinctDistrict, ind) {
            if (config.checkDeleteItem) {
                var ok = confirm("Увага! Дільницю буде видалено зі списку, продовжити?");
                if (!ok) return;
            }
            $rootScope.errorMsg = '';
            districtDataService.resource.removePrecinctDistrict({ districtId: $scope.data.district.Id, precinctId: precinctDistrict.PrecinctId }, function () {
                $scope.data.district.DistrictPrecincts.splice(ind, 1);
            }, errorHandler);
        };

        $scope.addNewPrecinct = function () {
            $rootScope.errorMsg = '';
            $scope.addMode.precinct = true;
        };

        $scope.savePrecinct = function (precinctDistrict, ind) {
            $rootScope.errorMsg = '';
            if (!$scope.data.district || !$scope.data.district.Id) {
                $rootScope.errorMsg = "Спочатку необхідно зберегти округ";
                return;
            }
            if (!$scope.selected.precinct || !$scope.selected.precinct.Id) {
                $rootScope.errorMsg = "Не вірно вибрано дільницю";
                return;
            }
            $scope.loader.savingPrecinct = true;
            var precinctDistrictModel = {
                "DistrictId": $scope.data.district.Id,
                "PrecinctId": $scope.selected.precinct.Id
            };

            if ($scope.addMode.precinct) {
                districtDataService.resource.savePrecinctDistrict(precinctDistrictModel, successHandler, errorHandler);
            } else {
                districtDataService.resource.updatePrecinctDistrict({
                    districtId: $scope.data.district.Id,
                    precinctId: precinctDistrict.PrecinctId
                }, precinctDistrictModel, successHandler, errorHandler);
            }

            function successHandler(resp) {
                $scope.loader.savingPrecinct = false;
                resp.Precinct = $scope.selected.precinct;
                if ($scope.addMode.precinct) {
                    if (!$scope.data.district.DistrictPrecincts) $scope.data.district.DistrictPrecincts = [];
                    $scope.data.district.DistrictPrecincts.push(resp);
                } else {
                    $scope.data.district.DistrictPrecincts[ind] = resp;
                }
                $scope.data.district.DistrictPrecincts.sort(function (a, b) {
                    return a.Precinct.Number - b.Precinct.Number;
                });
                $scope.reset();
            };
        };

        $scope.backToList = function () {
            $scope.reset();
            $rootScope.errorMsg = '';
            var currPage = serviceUtil.getRouteParam("currPage") || 1;
            $location.path('/districts/' + currPage);
        };

        function errorHandler(e) {
            $scope.loader = {};
            $scope.reset();
            $rootScope.errorMsg = serviceUtil.getErrorMessage(e);
        };

        $scope.reset = function () {
            $scope.addMode.precinct = false;
            $scope.selected.precinct = undefined;
            editablePrecinctDistrict = undefined;
        };

        $scope.getTemplate = function (districtPrecinct) {
            if (districtPrecinct === editablePrecinctDistrict) return 'edit';
            return 'display';
        };
    }]);