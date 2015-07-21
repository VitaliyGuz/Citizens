'use strict';

var peopleControllers = angular.module('peopleControllers', ['peopleServices', 'streetServices', 'cityServices', 'precinctServices']);

peopleControllers.controller("listPeopleController", ['$rootScope', '$scope', '$location', 'peopleData', 'config', 'serviceUtil', 'genlPeopleData', 'filterSettings',
    function ($rootScope, $scope, $location, peopleData, config, serviceUtil, genlPeopleData, filterSettings) {
        var propValues = [], DATE_FORMAT = 'yyyy-MM-ddT00:00:00';
        
        $rootScope.pageTitle = 'Фізичні особи';
        $scope.saving = false;
        //$scope.filterQuery = {};

        $scope.currentPage = serviceUtil.getRouteParam("currPage") || 1;
        
        $scope.pageSize = config.pageSize;
        $scope.totalItems = 0;

        $scope.people = [];
        $scope.tableHead = ['№', 'П.І.Б.', 'Дата народження', 'Адреса','Дільниця', 'Дії'];

        $scope.propKeys = genlPeopleData.propKeys;
        propValues = genlPeopleData.propValues;

        var peopleQuery = filterSettings.get('people');
        //todo: include filterQuery in propKyes, personNameQuery is temp
        var personNameQuery = filterSettings.get('people_name');
        if (peopleQuery) {
            angular.forEach($scope.propKeys, function (propKey) {
                var findedKeys = peopleQuery.filter(function (query) {
                    return query.Id === propKey.Id;
                });
                if (findedKeys.length > 0) {
                    propKey.input = findedKeys[0].input;
                    $scope.showFilters = true;
                } 
            });
        }
        if (personNameQuery) {
            $scope.filterQuery = personNameQuery;
        } else {
            $scope.filterQuery = {};
        }

        $scope.getPropertyValuesByKeyId = function (keyId) {
            return propValues.filter(function (item) {
                return item.PropertyKeyId === keyId;
            });
        };

        $scope.getIndex = function(ind) {
            return ($scope.currentPage - 1) * config.pageSize + ind + 1;
        };

        $scope.loadingPeople = true;
        setPeopleOnPage(($scope.currentPage - 1) * config.pageSize);

        $scope.edit = function (person) {
            $location.path('/person/' + person.Id + '/' + $scope.currentPage);
        };

        $scope.delete = function (person) {
            if (config.checkDeleteItem) {
                var ok = confirm("Увага! Фізичну особу буде видалено, продовжити?");
                if (!ok) return;
            }
            $rootScope.errorMsg = '';
            peopleData.remove({ id: person.Id },function () {
                    setPeopleOnPage(($scope.currentPage - 1) * config.pageSize);
                }, errorHandler);
        };

        $scope.addNew = function () {
            $location.path('/person/new/' + $scope.currentPage);
        };

        function errorHandler(e) {
            $scope.loadingPeople = false;
            $scope.filtering = false;
            $rootScope.errorMsg = serviceUtil.getErrorMessage(e);
        };
        
        $scope.onPageChange = function (newPageNumber) {
            $location.path("/people/" + newPageNumber);
            //setPeopleOnPage((newPageNumber - 1) * config.pageSize);
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
            $rootScope.errorMsg = '';
            $scope.loadingPeople = false;
            $scope.filtering = false;
            $scope.people = data.value;
            $scope.totalItems = data['@odata.count'];
        };

        function getFilterString() {
            var filterStr = '', filterInnerStr = '',
                filterQuery = $scope.filterQuery,
                filterPattern = "startswith(:fieldName, ':val') eq true",
                filterBasePatternProp = "PersonAdditionalProperties/any(p::innerPattern and p/PropertyKeyId eq :propKeyId)",
                filterPatternProp = filterBasePatternProp.replace(':innerPattern',"p/:fieldName eq :val"),
                filterPatternPropInterval = filterBasePatternProp.replace(':innerPattern', "p/:fieldName ge :from and p/:fieldName le :to"),
                innerPatternRef = "p/:fieldName eq :val",
                propKeyType;

            function concatIfExist(baseStr, str) {
                if (baseStr.length > 0) {
                    baseStr = baseStr + str;
                }
                return baseStr;
            };
            // filter by base fields
            for (var prop in filterQuery) {
                if (filterQuery.hasOwnProperty(prop)) {
                    var val = filterQuery[prop];
                    if (!val || val.length === 0) continue;
                    filterStr = concatIfExist(filterStr, " and ") + filterPattern.replace(':fieldName', prop).replace(':val', val);
                }
            }
            // filter by additional properties
            angular.forEach($scope.propKeys, function (propKey) {
                filterInnerStr = '';
                if (propKey.input) {
                    propKeyType = propKey.PropertyType.html;
                    if (propKeyType === 'ref' && propKey.input.length > 0) {
                        angular.forEach(propKey.input, function (propVal) {
                            filterInnerStr = concatIfExist(filterInnerStr, " or ") + innerPatternRef
                                .replace(/:fieldName/g, propKey.PropertyType.field)
                                .replace(/:val/g, propVal.Id);
                        });
                        filterStr = concatIfExist(filterStr, " and ") + filterBasePatternProp
                            .replace(/:innerPattern/g, filterInnerStr);
                    } else if ((propKeyType === 'date' || propKeyType === 'number') && propKey.input.from && propKey.input.to) {
                        //console.log(propKey.input.from.toISOString());
                        filterStr = concatIfExist(filterStr, " and ") + filterPatternPropInterval
                            .replace(/:from/g, propKeyType === 'date' ? serviceUtil.formatDate(propKey.input.from, DATE_FORMAT) + 'Z' : propKey.input.from)
                            .replace(/:to/g, propKeyType === 'date' ? serviceUtil.formatDate(propKey.input.to, DATE_FORMAT) + 'Z' : propKey.input.to);
                    } else if (propKeyType === 'text' && propKey.input.length > 0) {
                        filterStr = concatIfExist(filterStr, " and ") + filterPatternProp
                            .replace(/:val/g, "'" + propKey.input + "'");
                    } else if (propKeyType === 'refCity' && propKey.input.City.Id) {
                        filterStr = concatIfExist(filterStr, " and ") + filterPatternProp
                            .replace(/:val/g, propKey.input.City.Id);
                    } else if (propKeyType === 'refStreet' && propKey.input.Street.Id) {
                        filterStr = concatIfExist(filterStr, " and ") + filterPatternProp
                            .replace(/:val/g, propKey.input.Street.Id);
                    }
                    filterStr = filterStr.replace(/:fieldName/g, propKey.PropertyType.field).replace(/:propKeyId/g, propKey.Id);
                }
            });
            //console.log(filterStr);
            return filterStr;
        };
        
        $scope.applyFilter = function () {
            $scope.filtering = true;
            filterSettings.set('people', $scope.propKeys);
            setPeopleOnPage();
        };

        $scope.onFilterChange = function () {
            if ($scope.filterQuery.LastName || $scope.filterQuery.FirstName || $scope.filterQuery.MidleName) {
                filterSettings.set('people_name', $scope.filterQuery);
            } else {
                filterSettings.remove('people_name');
            }
            setPeopleOnPage();
        };

        $scope.toggleSelection = function (propKey,checkedValue) {
            if (!propKey.input) {
                propKey.input = [];
                propKey.input.push(checkedValue);
                return;
            }
            var ind = propKey.input.indexOf(checkedValue);
            if (ind < 0) {
                propKey.input.push(checkedValue);
            } else {
                propKey.input.splice(ind, 1);
            }
        };

        $scope.onSelectFilterCity = function ($item, $model, $label, input) {
            input.City = $item;
        };

        $scope.onSelectFilterStreet = function ($item, $model, $label, input) {
            input.Street = $item;
        };

        $scope.resetFilter = function () {
            angular.forEach($scope.propKeys, function (propKey) {
                if (propKey.input) propKey.input = undefined;
            });
            filterSettings.remove('people');
            setPeopleOnPage();
        };

        $scope.checkedPropValue = function (propKey, checkVal) {
            if (!propKey.input) return false;
            return propKey.input.some(function (val) {
                return val.Id === checkVal.Id;
            });
        };

    }]);

peopleControllers.controller('editPersonController', ['$rootScope', '$scope', '$location', 'peopleData', 'serviceUtil', 'precinctData', 'precinctAddressesData', 'additionalPropsData', 'propertyTypes', 'config', 'resolvedData', 'genlPeopleData',
    function ($rootScope, $scope, $location, peopleData, serviceUtil, precinctData, precinctAddressesData, additionalPropsData, propertyTypes, config, resolvedData, genlPeopleData) {
        var addMode = true, editInd, propValues = [], DATE_FORMAT = 'yyyy-MM-ddT00:00:00+00:00';
        $rootScope.pageTitle = 'Фізична особа';
        $scope.tableHead = ['№', 'Назва', 'Значення'];
        $scope.selected = { property: {} };
        
        $scope.propKeys = genlPeopleData.propKeys;
        propValues = genlPeopleData.propValues;

        function getPropertyValuesByKeyId (keyId) {
            return propValues.filter(function (item) {
                return item.PropertyKeyId === keyId;
            });
        };

        if (resolvedData) {
            if (resolvedData.person) {
                addMode = false;
                $scope.person = resolvedData.person;
                if (resolvedData.person.DateOfBirth) {
                    $scope.dateOfBirth = serviceUtil.formatDate(new Date(resolvedData.person.DateOfBirth), 'dd.MM.yyyy');
                }
                $scope.person.PrecinctId = resolvedData.person.PrecinctAddress.PrecinctId;
                $scope.person.Precinct = resolvedData.person.PrecinctAddress.Precinct;
                $scope.additionalProperties = getPropertyPairs(resolvedData.person.PersonAdditionalProperties);
            }
            $scope.precincts = resolvedData.precincts;
        }

        function getPropertyPairs(properties) {
            var result, types = propertyTypes.getAll();
            function getPair(item) {
                var pair = { key: item.PropertyKey }, type, val, isTypeEqual;
                for (var i = 0; i < types.length; i++){
                    type = types[i], val = item[type.field];
                    if (angular.isObject(pair.key.PropertyType)) {
                        isTypeEqual = pair.key.PropertyType === type;
                    } else {
                        isTypeEqual = pair.key.PropertyType === type.label;
                    }
                    if (val && isTypeEqual) {
                        pair.key.PropertyType = type;
                        if (type.html === 'ref') {
                            pair.value = { desc: item.PropertyValue.Value, obj: item.PropertyValue };
                        } else if (type.html === 'refCity') {
                            var arrCities = $scope.cities.filter(function (city) {
                                return city.Id === val;
                            });
                            if (arrCities.length > 0) {
                                var c = arrCities[0];
                                pair.value = { desc: c.CityType.Name + ' ' + c.Name + ' (' + c.RegionPart.Name + ' р-н)', obj: c };
                            }
                        } else if (type.html === 'refStreet') {
                            var arrStreets = $scope.streets.filter(function (street) {
                                return street.Id === val;
                            });
                            if (arrStreets.length > 0) {
                                var s = arrStreets[0];
                                pair.value = { desc: s.StreetType.Name + ' ' + s.Name, obj: s };
                            }
                        } else {
                            pair.value = { desc: val };
                        }
                        break;
                    }
                };
                return pair;
            };
            if (angular.isArray(properties)) {
                result = properties.map(function (prop) {
                    return getPair(prop);
                });
            } else {
                result = getPair(properties);
            }
            return result;
        };

        function errorHandler(e) {
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
            $rootScope.errorMsg = '';
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
            person.DateOfBirth = serviceUtil.formatDate($scope.dateOfBirth, DATE_FORMAT);
            if (!person.DateOfBirth) {
                $scope.saving = false;
                $rootScope.errorMsg = "Не вірно вказана дата народження";
                return;
            }
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
                    peopleData.save(person, function (res) {
                        addMode = false;
                        $scope.saving = false;
                        $scope.person.Id = res.Id;
                        $scope.additionalProperties = [];
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

        $scope.backToList = function () {
            $rootScope.errorMsg = '';
            var currPage = serviceUtil.getRouteParam("currPage");
            if (!currPage) currPage = 1;
            $location.path('/people/' + currPage);
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
            $scope.person.Precinct = $item;
            $scope.person.PrecinctId = $model;
        };

        $scope.onSelectProperty = function ($item, $model, $label) {
            $scope.selected.property.Value = $item;
            $scope.selected.property.ValueId = $model;
        };
        
        $scope.onChangePropertyKey = function () {
            $scope.selected.property.Key.PropertyType.html.indexOf('ref') === 0  ? $scope.isPrimitive = false : $scope.isPrimitive = true;
            $scope.selected.property.Value = '';
            $scope.selected.property.ValueId = 0;
            if ($scope.selected.property.Key.PropertyType.html === 'ref'){
                $scope.propFilteredValues = getPropertyValuesByKeyId($scope.selected.property.Key.Id);
            }
        };
    
        $scope.getTemplate = function (prop) {
            $scope.isDate = false;
            if (prop.key.PropertyType.html === 'date') $scope.isDate = true;
            if ($scope.selected.property.Key && prop.key.Id === $scope.selected.property.Key.Id && !$scope.addPropertyMode) return 'edit';
            else return 'display';
        };

        $scope.editProperty = function (propKeyId, ind) {
            var typeStr, prop;
            $scope.addPropertyMode = false;
            editInd = ind;
            $scope.isPrimitive = true;
            additionalPropsData.getByKey({ personId: $scope.person.Id, propertyKeyId: propKeyId }, function (res) {
                prop = getPropertyPairs(res);
                typeStr = prop.key.PropertyType.html;
                if (typeStr.indexOf('ref') === 0) {
                    $scope.isPrimitive = false;
                }
                if (typeStr === 'date') {
                    //$scope.selected.property.Value = new Date(prop.value.desc);
                    $scope.selected.property.Value = serviceUtil.formatDate(new Date(prop.value.desc),'dd.MM.yyyy');
                } else if (typeStr === 'number') {
                    $scope.selected.property.Value = Number(prop.value.desc);
                } else {
                    $scope.selected.property.Value = prop.value.desc;
                    if (!$scope.isPrimitive) {
                        $scope.selected.property.Value = prop.value.obj;
                        if (typeStr === 'ref') {
                            $scope.propFilteredValues = getPropertyValuesByKeyId(prop.key.Id);
                        }
                    }
                }
                $scope.selected.property.Key = prop.key;
            }, errorHandler);
        };

        $scope.reset = function () {
            $scope.addPropertyMode = false;
            $scope.selected.property = {};
        };
        
        $scope.addNewProperty = function () {
            $scope.addPropertyMode = true;
            $scope.isPrimitive = true;
        };

        $scope.saveProperty = function () {
            var propType, newProperty, newPropValue;
            if (!$scope.person.Id) {
                $rootScope.errorMsg = 'Спочатку необхідно зберегти фіз. особу';
                return;
            }
            if (!$scope.selected.property.Key) {
                $rootScope.errorMsg = 'Не вибрано тип характеристики';
                return;
            }
            newPropValue = $scope.selected.property.Value;
            if (!newPropValue) {
                $rootScope.errorMsg = 'Не вказано значення характеристики';
                return;
            }
            propType = $scope.selected.property.Key.PropertyType;
            if (propType.html.indexOf('ref') === 0 && !$scope.selected.property.ValueId) {
                $rootScope.errorMsg = "Значення '" + $scope.selected.property.Value + "' для характеристики '" + $scope.selected.property.Key.Name + "' не знайдено";
                return;
            }
            $rootScope.errorMsg = '';
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
            
            if (propType.html.indexOf('ref') === 0) {
                newPropValue = $scope.selected.property.ValueId;
            }
            if (propType.html === 'date') {
                newPropValue = serviceUtil.formatDate(newPropValue, DATE_FORMAT);
                if (!newPropValue) {
                    $scope.savingProp = false;
                    $rootScope.errorMsg = "Не вірно вказана дата";
                    return;
                }
            }            
            newProperty[propType.field] = newPropValue;
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
        
        $scope.deleteProperty = function (prop, ind) {
            if (config.checkDeleteItem) {
                var ok = confirm("Увага! Характеристику фіз. особи буде видалено, продовжити?");
                if (!ok) return;
            }
            additionalPropsData.remove({ personId: $scope.person.Id, propertyKeyId: prop.key.Id }, function () {
                $scope.additionalProperties.splice(ind, 1);
            }, errorHandler);
        };
    }]);
