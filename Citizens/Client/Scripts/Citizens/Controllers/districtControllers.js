'use strict';

var districtControllers = angular.module('districtControllers', ['precinctServices']);

districtControllers.controller("listDistrictsController", ['$rootScope', '$location', '$scope', 'config', 'serviceUtil', 'districtData', 'filterSettings', 'districtsHolder',
    function ($rootScope, $location, $scope, config, serviceUtil, districtData, filterSettings, districtsHolder) {

        $rootScope.pageTitle = 'Округи';
        $scope.currentPage = serviceUtil.getRouteParam("currPage") || 1;
        $scope.pageSize = config.pageSize;

        $scope.tableHead = ['№', '№ округу', 'Тип', 'Дії'];

        // todo: get data before load page (see listUsersController )
        if (districtsHolder.isEmpty()) {
            $scope.loadingDistricts = true;
            districtData.query(function (res) {
                $scope.loadingDistricts = false;
                districtsHolder.set(res.value);
                districtsHolder.sort();
            }, function (err) {
                $scope.loadingDistricts = false;
                err.description = 'Округи не завантажено',
                $rootScope.errorMsg = serviceUtil.getErrorMessage(err);
            });
        }

        $scope.getDistricts = districtsHolder.get;

        var districtsQuery = filterSettings.get('districts');
        if (districtsQuery) {
            $scope.query = districtsQuery;
            $scope.queryBy = Object.keys(districtsQuery)[0];
        } else {
            $scope.query = {};
            $scope.queryBy = 'Number';
        }

        $scope.onFilterQueryChange = function (isChangeValue) {
            if (isChangeValue) {
                filterSettings.set('districts', $scope.query);
            } else {
                $scope.query = {};
                filterSettings.remove('districts');
            }
        };

        $scope.getIndex = function (district) {
            return districtsHolder.indexOf(district);
        };

        $scope.edit = function (district,ind) {
            districtsHolder.setEditIndex(ind);
            $location.path('/district/' + district.Id + '/' + $scope.currentPage);
        };

        $scope.delete = function (district) {
            if (config.checkDeleteItem) {
                var ok = confirm("Увага! Округ буде видалено, продовжити?");
                if (!ok) return;
            }
            $rootScope.errorMsg = '';
            districtData.remove({ id: district.Id },
                function () {
                    districtsHolder.removeElem(district);
                }, function (e) {
                    e.description = 'Округ не видалено';
                    $rootScope.errorMsg = serviceUtil.getErrorMessage(e);
                });
        };

        $scope.addNew = function () {
            $rootScope.errorMsg = '';
            $location.path('/district/new' + '/' + $scope.currentPage);
        };

        $scope.onPageChange = function (newPageNumber) {
            $location.path("/districts/" + newPageNumber);
        };
    }]);

districtControllers.controller('editDistrictController', ['$rootScope', '$scope', '$location', 'serviceUtil', 'districtData', 'config','precinctData','districtsHolder',
    function ($rootScope, $scope, $location, serviceUtil, districtData, config, precinctData, districtsHolder) {
        var editablePrecinctDistrict, addMode;
        $rootScope.pageTitle = 'Округ';
        $scope.saving = false;
        addMode = true;
        $scope.tableHead = ['№', 'Дільниця'];
        $scope.selected = { precinct: undefined };
        $scope.districtPrecincts = [];
        // todo: get all data before load page (see listUsersController )
        var id = serviceUtil.getRouteParam("id");
        if (id) {
            addMode = false;
            $scope.loadingDistrict = true;
            districtData.getById({ id: id }, function (res) {
                $scope.loadingDistrict = false;
                $scope.district = res;
                $scope.districtPrecincts = res.DistrictPrecincts;
            }, function(err) {
                $scope.loadingDistrict = false;
                err.description = 'Округ не знайдено',
                $rootScope.errorMsg = serviceUtil.getErrorMessage(err);
            });
        }

        $scope.loadingDistrict = true;
        districtData.getTypes(function (res) {
            $scope.loadingDistrict = false;
            $scope.districtTypes = res.value;
        }, function (err) {
            $scope.loadingDistrict = false;
            err.description = 'Типи округів не завантажено',
            $rootScope.errorMsg = serviceUtil.getErrorMessage(err);
        });

        $scope.loadingDistrict = true;
        precinctData.getAllNotExpand(function (data) {
            $scope.loadingDistrict = false;
            $scope.precincts = data.value;
        }, function (err) {
            $scope.loadingDistrict = false;
            err.description = "Дільниці не завантажено";
            $rootScope.errorMsg = serviceUtil.getErrorMessage(err);
        });

        $scope.save = function () {
            $scope.saving = true;
            $rootScope.errorMsg = '';
            var district = {
                "Id": 0,
                "Number": 0,
                "DistrictTypeId": 0
            }
            serviceUtil.copyProperties($scope.district, district);
            if (addMode) {
                districtData.save(district, successHandler, errorHandler);
            } else {
                districtData.update({ id: district.Id }, district, successHandler, errorHandler);
            }

            function successHandler(res) {
                $scope.saving = false;
                if (!districtsHolder.isEmpty()) {
                    var arrFinded = $scope.districtTypes.filter(function (type) {
                        return type.Id === $scope.district.DistrictTypeId;
                    });
                    if (arrFinded) $scope.district.DistrictType = arrFinded[0];
                }
                if (addMode) {
                    $scope.district.Id = res.Id;
                    districtsHolder.addElem($scope.district);
                    $rootScope.successMsg = 'Округ успішно створено!';
                } else {
                    districtsHolder.updateElem($scope.district);
                    $rootScope.successMsg = 'Зміни успішно збережено!';
                }
                districtsHolder.sort();
                addMode = false;
            };
        };

        $scope.edit = function (precinctDistrict) {
            $scope.reset();
            $rootScope.errorMsg = '';
            $scope.addPrecinctMode = false;
            editablePrecinctDistrict = precinctDistrict;
            precinctData.getByIdNotExpand({ id: precinctDistrict.PrecinctId }, function (res) {
                $scope.selected.precinct = res;
            }, errorHandler);
        };

        $scope.delete = function (precinctDistrict, ind) {
            if (config.checkDeleteItem) {
                var ok = confirm("Увага! Дільницю буде видалено зі списку, продовжити?");
                if (!ok) return;
            }
            $rootScope.errorMsg = '';
            districtData.removePrecinctDistrict({ districtId: $scope.district.Id, precinctId: precinctDistrict.PrecinctId }, function () {
                $scope.districtPrecincts.splice(ind, 1);
            }, errorHandler);
        };

        $scope.addNewPrecinct = function () {
            $rootScope.errorMsg = '';
            $scope.addPrecinctMode = true;
        };

        $scope.savePrecinct = function (precinctDistrict, ind) {
            $rootScope.errorMsg = '';
            if (!$scope.district.Id) {
                $rootScope.errorMsg = "Спочатку необхідно зберегти округ";
                return;
            }
            if (!$scope.selected.precinctId) {
                $rootScope.errorMsg = "Не вірно вибрано дільницю";
                return;
            }
            $scope.savingPrecinct = true;
            var _precinctDistrict = {
                "DistrictId": $scope.district.Id,
                "PrecinctId": $scope.selected.precinct.Id
            };

            if ($scope.addPrecinctMode) {
                districtData.savePrecinctDistrict(_precinctDistrict, successHandler, errorHandler);
            } else {
                districtData.updatePrecinctDistrict({ districtId: $scope.district.Id, precinctId: precinctDistrict.PrecinctId }, _precinctDistrict, successHandler, errorHandler);
            }

            function successHandler(res) {
                $scope.savingPrecinct = false;
                res.Precinct = $scope.selected.precinct;
                if ($scope.addPrecinctMode) {
                    $scope.districtPrecincts.push(res);
                } else {
                    $scope.districtPrecincts[ind] = res;
                }
                $scope.districtPrecincts.sort(function (a, b) {
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
            $scope.saving = false;
            $scope.savingPrecinct = false;
            $scope.reset();
            $rootScope.errorMsg = serviceUtil.getErrorMessage(e);
        };

        $scope.reset = function () {
            $scope.addPrecinctMode = false;
            $scope.selected.precinct = undefined;
            editablePrecinctDistrict = undefined;
        };

        $scope.onSelectPrecinct = function ($item, $model, $label) {
            $scope.selected.precinct = $item;
            $scope.selected.precinctId = $model;
        };

        $scope.getTemplate = function (districtPrecinct) {
            if (districtPrecinct === editablePrecinctDistrict) return 'edit';
            else return 'display';
            return 'display';
        };
    }]);