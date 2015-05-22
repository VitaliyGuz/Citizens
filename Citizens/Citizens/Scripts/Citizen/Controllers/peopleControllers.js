'use strict';

var peopleModule = angular.module('peopleModule', ['peopleServices', 'streetServices', 'cityServices', 'precinctServices', 'angularUtils.directives.dirPagination', 'appCitizen', 'ngRoute', 'ui.bootstrap']);

peopleModule.config(['$routeProvider', function ($routeProvider) {
        $routeProvider.
            when('/list', {
                templateUrl: '/People/ListPeople',
                controller: 'listController'
            }).
            when('/new', {
                templateUrl: '/People/EditPerson',
                controller: 'editController'
            }).
            when('/edit/:id', {
                templateUrl: '/People/EditPerson',
                controller: 'editController'
            }).
            otherwise({
                redirectTo : 'list'
            });
    }]);


peopleModule.controller("listController", ['$rootScope','$scope','$location', 'peopleData', 'config', 'serviceUtil', '$timeout',
    function ($rootScope, $scope, $location, peopleData, config, serviceUtil, $timeout) {
        $scope.loading = true;
        $scope.saving = false;

        $scope.query = {};

        $rootScope.errorMsg = '';
        $rootScope.successMsg = '';

        if (!$rootScope.currentPage) {
            $rootScope.currentPage = 1;
        }
        $scope.pageSize = config.pageSize;
        $scope.totalItems = 0;

        $scope.people = [];
        $scope.tableHead = ['№', 'П.І.Б.', 'Дата народження', 'Адреса','Дільниця', 'Дії'];

        $scope.getIndex = function (ind) {
            return ($rootScope.currentPage - 1) * config.pageSize + ind + 1;
        }
        
        setPeopleOnPage(($rootScope.currentPage - 1) * config.pageSize);

        $scope.edit = function (person) {
            $location.path('edit/' + person.Id);
        };

        $scope.delete = function (people) {
            peopleData.remove({ id: people.Id },
                function () {
                    setPeopleOnPage(($rootScope.currentPage - 1) * config.pageSize);
                }, errorHandler);
        };

        $scope.addNew = function () {
            $location.path('new');
        };

        function errorHandler(e) {
            $scope.loading = false;
            $rootScope.errorMsg = serviceUtil.getErrorMessage(e);
        };

        function closeAlertAtTimeout() {
            $timeout(function () {
                $rootScope.successMsg = '';
                $rootScope.errorMsg = '';
            }, 2000);
        };

        $scope.$watch('successMsg + errorMsg', function (newValue) {
            if (newValue.length > 0) {
                closeAlertAtTimeout();
            }
        });
        
        $scope.onPageChange = function (newPageNumber) {
            $rootScope.currentPage = newPageNumber;
            setPeopleOnPage((newPageNumber - 1) * config.pageSize);
        };
        
        function setPeopleOnPage(skipItems) {
            var filterString = getFilterString();
            if (skipItems == undefined) skipItems = 0;
            if (filterString.length === 0) {
                peopleData.getPageItems({ skip: skipItems }, successHandler, errorHandler);
            } else {
                peopleData.getFilteredPageItems({ skip: skipItems, filter: filterString }, successHandler, errorHandler);
            }
        };
        
        function successHandler(data) {
            $scope.loading = false;
            $scope.people = data.value;
            $scope.totalItems = data['@odata.count'];
        };

        function getFilterString() {
            var filterStr = '',
                filterQuery = $scope.filterQuery,
                filterPattern = "startswith(tolower(:prop), ':val') eq true";

            for (var prop in filterQuery) {
                if (filterQuery.hasOwnProperty(prop)) {
                    var val = filterQuery[prop];
                    if (val == undefined || val.length === 0) continue;
                    if (filterStr.length > 0) {
                        filterStr = filterStr + " and ";
                    }
                    filterStr = filterStr + filterPattern.replace(':prop', prop).replace(':val', val.toLowerCase());
                }
            }
            return filterStr;
        };

        $scope.onFilterChange = function () {
            setPeopleOnPage();
        };
        
    }]);

peopleModule.controller('editController',['$timeout','$filter','$rootScope','$scope','$location','$routeParams','streetData','cityData','peopleData','serviceUtil', 'precinctData', 'precinctAddressesData','additionalPropsData',
    function ($timeout, $filter, $rootScope, $scope, $location, $routeParams, streetData, cityData, peopleData, serviceUtil, precinctData, precinctAddressesData, additionalPropsData) {
        var addMode, editInd;
        $rootScope.errorMsg = '';
        $rootScope.successMsg = '';
        addMode = true;
        $scope.tableHead = ['№', 'Назва', 'Значення'];
        $scope.selected = { property: {} };

        $scope.loading = true;
        streetData.query(function (streets) {
            $scope.loading = false;
            $scope.streets = streets.value;
        }, errorHandler);

        $scope.loading = true;
        cityData.getAll(function (cities) {
            $scope.loading = false;
            $scope.cities = cities.value;
        }, errorHandler);

        $scope.loading = true;
        precinctData.getAll(function (precincts) {
            $scope.loading = false;
            $scope.precincts = precincts.value;
        }, errorHandler);
        
        $scope.loading = true;
        additionalPropsData.getKeys(function (keys) {
            $scope.loading = false;
            $scope.propKeys = keys.value;
            convertTypes($scope.propKeys);
        }, errorHandler);

        $scope.loading = true;
        additionalPropsData.getValues(function (values) {
            $scope.loading = false;
            $scope.propValues = values.value;
        }, errorHandler);

        if ($routeParams.id != undefined) {
            $scope.loading = true;
            peopleData.getById({ id: $routeParams.id }, function (res) {
                $scope.loading = false;
                addMode = false;
                $scope.person = res;
                $scope.dateOfBirth = new Date(res.DateOfBirth);
                $scope.person.PrecinctId = res.PrecinctAddress.PrecinctId;
                $scope.additionalProperties = getPropertyPairs(res.PersonAdditionalProperties);
            }, errorHandler);
        }

        function getPropertyPairs(properties) {
            var result;
            function getPair(item) {
                var pair = { key: item.PropertyKey };
                if (item.IntValue) {
                    pair.key.PropertyType = 'number';
                    pair.value = { desc: item.IntValue };
                    return pair;
                }
                if (item.StringValue) {
                    pair.key.PropertyType = 'text';
                    pair.value = { desc: item.StringValue };
                    return pair;
                }
                if (item.DateTimeValue) {
                    pair.key.PropertyType = 'date';
                    pair.value = { desc: item.DateTimeValue };
                    return pair;
                }
                if (item.PropertyValue) {
                    pair.key.PropertyType = 'ref';
                    pair.value = { desc: item.PropertyValue.Value, obj: item.PropertyValue };
                    return pair;
                }
            };
            if (angular.isArray(properties)) {
                result = [];
                angular.forEach(properties, function (item) {
                    result.push(getPair(item));
                });
            } else {
                result = getPair(properties);
            }
            return result;
        };
        
        function getFieldName(strType) {
            switch (strType) {
                case 'number':  return 'IntValue';
                case 'text':    return 'StringValue';
                case 'date':    return 'DateTimeValue';
                case 'ref':     return 'PropertyValueId';
            }
        };
        
        function convertTypes(keys) {
            angular.forEach(keys, function (item) {
                switch (item.PropertyType) {
                    case 'Число':
                        item.PropertyType = 'number';
                        break;
                    case 'Рядок':
                        item.PropertyType = 'text';
                        break;
                    case 'Дата':
                        item.PropertyType = 'date';
                        break;
                    case 'Довідник':
                        item.PropertyType = 'ref';
                        break;
                }
            });
        };

        function errorHandler(e) {
            $scope.loading = false;
            $scope.saving = false;
            $scope.savingProp = false;
            $rootScope.errorMsg = serviceUtil.getErrorMessage(e);
        };

        $scope.save = function () {
            if (!$scope.person.PrecinctId) {
                $rootScope.errorMsg = 'Не вірний номер дільниці';
                return;
            };

            if (!$scope.person.CityId) {
                $rootScope.errorMsg = "Населений пункт '" + $scope.person.City + "' не знайдено";
                return;
            };

            if (!$scope.person.StreetId) {
                $rootScope.errorMsg = "Вулицю '" + $scope.person.Street + "' не знайдено";
                return;
            };

            $scope.saving = true;
            // todo: factory method
            var person = {
                "Id": 0,
                "LastName": '',
                "FirstName": '',
                "MidleName": '',
                "DateOfBirth": '',
                "Gender": 0,
                "CityId": 0,
                "StreetId": 0,
                "House": '',
                "Apartment": 0
            },
            // todo: factory method
            precinctAddress =  {
                "CityId": 0,
                "StreetId": 0,
                "House": '',
                "PrecinctId": 0
            };
            serviceUtil.copyProperties($scope.person, person);
            serviceUtil.copyProperties(person, precinctAddress);
            precinctAddress.PrecinctId = $scope.person.PrecinctId;
            person.DateOfBirth = formatDateToDateTime($scope.dateOfBirth);
            if (!person.Apartment) person.Apartment = null;

            precinctData.getByIdNotExpand({ id: precinctAddress.PrecinctId }, function () {
                    savePrecinctAddress();
                }, function () {
                    precinctData.save({"Id": precinctAddress.PrecinctId}, function () {
                        savePrecinctAddress();
                }, errorHandler);
            });

            function savePrecinctAddress() {
                var addressKey = serviceUtil.getAddressKey(precinctAddress);
                precinctAddressesData.query(addressKey, function (success) {
                    if(precinctAddress.PrecinctId === success.PrecinctId) {
                        savePerson();
                    } else {
                        precinctAddressesData.changePrecinct(addressKey, precinctAddress, function () {
                            savePerson();
                        }, errorHandler);
                    }
                }, function () {
                    precinctAddressesData.save(precinctAddress, function () {
                        savePerson();
                    }, errorHandler);
                });
            };

            function savePerson() {
                if (addMode) {
                    peopleData.save(person, function () {
                        $scope.saving = false;
                        $rootScope.successMsg = "Фізичну особу створено успішно!";
                    }, errorHandler);
                } else {
                    peopleData.update({ id: $scope.person.Id }, person, function () {
                        $scope.saving = false;
                        $rootScope.successMsg = "Зміни успішно збережено!";
                    }, errorHandler);
                }
            };
        };
        
        function formatDateToDateTime(date) {
            return $filter('date')(date, 'yyyy-MM-ddT00:00:00+00:00');
        };
    
        function closeAlertAtTimeout() {
            $timeout(function () {
                $rootScope.successMsg = '';
                $rootScope.errorMsg = '';
            }, 2000);
        };

        $scope.$watch('successMsg + errorMsg', function (newValue) {
            if (newValue.length > 0) {
                closeAlertAtTimeout();
            }
        });

        $scope.backToList = function () {
            $location.path('list');
        };

        $scope.onSelectStreet = function ($item, $model, $label) {
            $scope.person.Street = $item;
            $scope.person.StreetId = $model;
        };

        $scope.onSelectCity = function ($item, $model, $label) {
            $scope.person.City = $item;
            $scope.person.CityId = $model;
        };

        $scope.onSelectPrecinctNumber = function ($item, $model, $label) {
            $scope.person.PrecinctId = $model;
        };

        $scope.onSelectProperty = function ($item, $model, $label) {
            $scope.selected.property.Value = $item;
            $scope.selected.property.ValueId = $model;
        };
        
        $scope.onChangePropertyKey = function () {
            $scope.selected.property.Key.PropertyType === 'ref' ? $scope.isPrimitive = false : $scope.isPrimitive = true;
            $scope.selected.property.Value = '';
        };
    
        $scope.getTemplate = function (prop) {
            $scope.isDate = false;
            if (prop.key.PropertyType === 'date') $scope.isDate = true;
            if ($scope.selected.property.Key && prop.key.Id === $scope.selected.property.Key.Id && !$scope.addPropertyMode) return 'edit';
            else return 'display';
        };

        $scope.editProperty = function (prop, ind) {
            var type = prop.key.PropertyType;
            $scope.addPropertyMode = false;
            editInd = ind;
            $scope.isPrimitive = true;
            if (type === 'ref') {
                $scope.isPrimitive = false;
            }
            if (type === 'date') {
                $scope.selected.property.Value = new Date(prop.value.desc);
            } else if (type === 'number') {
                $scope.selected.property.Value = Number(prop.value.desc);
            } else {
                $scope.selected.property.Value = prop.value.desc;
                if (!$scope.isPrimitive) {
                    $scope.selected.property.ValueId = prop.value.obj.id;
                    $scope.selected.property.Value = prop.value.obj;
                }          
            }
            $scope.selected.property.Key = prop.key;
        };

        $scope.reset = function () {
            $scope.addPropertyMode = false;
            $scope.selected.property = {};
        };
        
        $scope.addNewProperty = function () {
            $scope.addPropertyMode = true;
        };

        $scope.saveProperty = function (paramProp) {
            var propType, newProperty, newPropValue;
            if (!$scope.selected.property.Key) {
                $rootScope.errorMsg = 'Не вибрано тип характеристики';
                return;
            }
            propType = $scope.selected.property.Key.PropertyType;
            if (propType === 'ref' && !$scope.selected.property.ValueId) {
                $rootScope.errorMsg = 'Значення ' + $scope.selected.property.Value + ' для характеристики ' + $scope.selected.property.Key.Name + ' не знайдено';
                return;
            }
            newPropValue = $scope.selected.property.Value;
            if (!newPropValue) {
                $rootScope.errorMsg = 'Не вказано значення характеристики';
                return;
            }
            $scope.savingProp = true;
            // todo: factory method
            newProperty = {
                "PersonId": $scope.person.Id,
                "PropertyKeyId": $scope.selected.property.Key.Id,
                "IntValue": null,
                "StringValue": null,
                "DateTimeValue": null,
                "PropertyValueId": null
            };
            
            if (propType === 'ref') {
                newPropValue = $scope.selected.property.ValueId;
            }
            newProperty[getFieldName(propType)] = newPropValue;
            if ($scope.addPropertyMode) {
                additionalPropsData.save(newProperty, successHandler, errorHandler);
            } else {
                additionalPropsData.update({ personId: newProperty.PersonId, propertyKeyId: newProperty.PropertyKeyId }, newProperty,
                    successHandler, errorHandler);
            }
            
            function successHandler() {
                $scope.savingProp = false;
                newProperty.PropertyKey = $scope.selected.property.Key;
                newProperty.PropertyValue = $scope.selected.property.Value;
                if ($scope.addPropertyMode) {
                    $scope.additionalProperties.push(getPropertyPairs(newProperty));
                } else {
                    $scope.additionalProperties[editInd] = getPropertyPairs(newProperty);
                }
                $scope.reset();
            };
        };
        
        $scope.deleteProperty = function (prop,ind) {
            additionalPropsData.remove({ personId: $scope.person.Id, propertyKeyId: prop.key.Id }, function () {
                $scope.additionalProperties.splice(ind, 1);
            }, errorHandler);
        };
}]);
