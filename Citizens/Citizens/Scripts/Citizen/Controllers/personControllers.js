'use strict';

var personControllers = angular.module('personControllers', ['personServices']);

personControllers.controller("personController", ['$scope', 'personData', 'streetData',
    function ($scope, personData, streetData) {
        var editInd;
        $scope.loading = true;
        $scope.isEdit = false;
        $scope.isNew = false;

        $scope.getIndex = function (person) {
            return $scope.persons.indexOf(person);
        }

        personData.query(function (persons) {
            $scope.persons = persons;
            $scope.loading = false;

        },
        function (err) {
            $scope.errorMsg = "Can't load persons data from resource";
            $scope.loading = false;
        });
        
        $scope.genderTitle = function (gender) {
            if (gender == '0') {
                gender = "жін.";
            }
            else {
                gender = "чол.";
            }
            return gender;
        };

        streetData.query(function (streets) {
            $scope.streets = streets;
            $scope.loading = false;
        },
        function (err) {
            $scope.errorMsg = "Can't load streets data from resource";
            $scope.loading = false;
        });

        $scope.edit = function (person) {
            editInd = $scope.getIndex(person);
            $scope.isEdit = true;
            $scope.isNew = false;
            personData.get({ id: person.Id }, function (res) {
                $scope.loading = false;
                $scope.person = res;

                /*if ($scope.person.Gender == '0') {
                    $scope.person.Gender = "жін.";
                }
                else {
                    $scope.person.Gender = "чол.";
                }*/
            },
		    function (err) {
		        $scope.loading = false;
		        $scope.errorMsg = "Can't load person data from resource";
		    });
        }

        $scope.newPerson = function () {
            $scope.isNew = true;
            $scope.isEdit = false;
        }

        $scope.delete = function (person) {
            personData.remove({ id: person.Id },
                function () {
                    $scope.persons.splice($scope.getIndex(person), 1);
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
                personData.update({ id: $scope.person.Id }, $scope.person,
                    function () {
                        personData.get({ id: $scope.person.Id },
                            function (updated) {
                                $scope.loading = false;
                                $scope.persons[editInd] = updated;
                                $scope.person = '';
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
                var newPerson = {
                    
                    LastName: $scope.person.LastName,
                    FirstName: $scope.person.FirstName,
                    MidleName: $scope.person.MidleName,
                    Gender: $scope.person.Gender,
                    DateOfBirth: $scope.person.DateOfBirth,
                    CityId: $scope.person.CityId,
                    StreetId: $scope.person.StreetId,
                    House: $scope.person.House,
                    Apartment: $scope.person.Apartment
                };
                $scope.loading = true;
                $scope.isNew = false;
                personData.save(newPerson,
                    function () {
                        personData.query(function (persons) {
                            $scope.loading = false;
                            $scope.persons = persons;
                            $scope.person = '';
                        },
                        function (err) {
                            $scope.errorMsg = "Can't load persons data after add new";
                            $scope.loading = false;
                        });
                    },
                    function (err) {
                        $scope.loading = false;
                        $scope.errorMsg = "Can't add new person into resource";
                    }
                );
            }
        }
    }]);