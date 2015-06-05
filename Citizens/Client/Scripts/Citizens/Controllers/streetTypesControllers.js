'use strict';

var streetTypesControllers = angular.module('streetTypesControllers', ['streetTypesServices']);

streetTypesControllers.controller("streetTypesController", ['$scope', 'typeStreetData',
    function ($scope, typeStreetData) {
        var editInd;
        $scope.loading = true;
        $scope.isEdit = false;
        $scope.isNew = false;
        typeStreetData.query(function (streetTypes) {
            $scope.streetTypes = streetTypes;
            $scope.loading = false;
        },
        function (err) {
            $scope.errorMsg = "Can't load street data from resource";
            $scope.loading = false;
        });

        $scope.edit = function (id, ind) {
            editInd = ind;
            $scope.isEdit = true;
            typeStreetData.get({ id: id }, function (streetType) {
                $scope.loading = false;
                $scope.streetType = streetType;
            },
		    function (err) {
		        $scope.loading = false;
		        $scope.errorMsg = "Can't load street data from resource";
		    });
        }

        $scope.newStreetType = function () {
            $scope.isNew = true;
        }

        $scope.delete = function (id, ind) {
            typeStreetData.remove({ id: id },
                function () {
                    $scope.streetTypes.splice(ind, 1);
                },
                function (err) {
                    $scope.errorMsg = "Can't remove data from resource";
                }
            );
        }

        $scope.submit = function () {
            if ($scope.isEdit) {
                $scope.isEdit = false;
                $scope.loading = true;
                typeStreetData.update({ id: $scope.streetType.Id }, $scope.streetType,
                    function () {
                        typeStreetData.get({ id: $scope.streetType.Id },
                            function (updated) {
                                $scope.loading = false;
                                $scope.streetTypes[editInd] = updated;
                                $scope.streetType = '';
                            },
                            function (err) {
                                $scope.loading = false;
                                $scope.errorMsg = "Can't get data after update";
                            });
                    },
                    function (err) {
                        $scope.loading = false;
                        $scope.errorMsg = "Can't update data";
                    }
                );
            };

            if ($scope.isNew) {
                var newStreetType = {
                    Id: 0,
                    Name: $scope.streetType.Name,
                    
                };
                $scope.loading = true;
                $scope.isNew = false;
                typeStreetData.save(newStreetType,
                    function () {
                        typeStreetData.query(function (streetTypes) {
                            $scope.loading = false;
                            $scope.streetTypes = streetTypes;
                            $scope.streetType = '';
                        },
                        function (err) {
                            $scope.errorMsg = "Can't load streets data after add new";
                            $scope.loading = false;
                        });
                    },
                    function (err) {
                        $scope.loading = false;
                        $scope.errorMsg = "Can't add new street into resource";
                    }
                );
            }
        }
    }]);