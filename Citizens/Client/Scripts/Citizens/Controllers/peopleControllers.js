'use strict';

var peopleControllers = angular.module('peopleControllers', ['peopleServices']);

peopleControllers.controller("listPeopleController", ['$rootScope', '$scope', '$location', 'peopleDataService', 'config', 'serviceUtil', 'resolvedAdditionalProperties', 'filterSettings', 'houseTypes',
    function ($rootScope, $scope, $location, peopleDataService, config, serviceUtil, resolvedAdditionalProperties, filterSettings, houseTypes) {
        var propValues = [], odataFilter;
        
        $rootScope.pageTitle = 'Фізичні особи';
        $scope.tableHead = ['№', 'П.І.Б.', 'Дата народження', 'Адреса', 'Дії'];
        
        $scope.pagination = {
            currentPage: serviceUtil.getRouteParam("currPage") || 1,
            pageSize: config.pageSize,
            totalItems: 0
        };
        
        $scope.people = [];
        $scope.houseTypes = [];
        $scope.enumGender = [];
        $scope.query = {};
        $scope.loader = {};
        $scope.loader.loading = true;

        $scope.propKeys = resolvedAdditionalProperties.keys;
        propValues = resolvedAdditionalProperties.values;
        
        $scope.houseTypes.push({ val: undefined, desc: '-Всі типи-' });
        $scope.houseTypes.push({ val: 'null', desc: 'Без типу' });
        houseTypes.forEach(function (type) {
            $scope.houseTypes.push({ val: "Citizens.Models.HouseType':type'".replace(/:type/g, type), desc: type });
        });

        $scope.enumGender.push({ val: undefined, desc: '- Будь-яка -' });
        $scope.enumGender.push({ val: "Citizens.Models.Gender'ч'", desc: 'Чоловіча' });
        $scope.enumGender.push({ val: "Citizens.Models.Gender'ж'", desc: 'Жіноча' });
        
        var search = $location.search();
        var peopleQuerySettings = filterSettings.get('people');
        if (peopleQuerySettings) {
            if (peopleQuerySettings.props) {
                $scope.query = peopleQuerySettings.props;
                if ($scope.query.DateOfBirth) {
                    $scope.query.DateOfBirth.from = serviceUtil.formatDate($scope.query.DateOfBirth.from, config.LOCALE_DATE_FORMAT);
                    $scope.query.DateOfBirth.to = serviceUtil.formatDate($scope.query.DateOfBirth.to, config.LOCALE_DATE_FORMAT);
                }
            }
            if (peopleQuerySettings.additionalProps) {
                angular.forEach($scope.propKeys, function(propKey) {
                    var foundKeys = peopleQuerySettings.additionalProps.filter(function (query) {
                        return query.Id === propKey.Id;
                    });
                    if (foundKeys.length > 0) {
                        propKey.input = foundKeys[0].input;
                        if (propKey.input && propKey.PropertyType.html === 'date') {
                            propKey.input.from = serviceUtil.formatDate(propKey.input.from, config.LOCALE_DATE_FORMAT);
                            propKey.input.to = serviceUtil.formatDate(propKey.input.to, config.LOCALE_DATE_FORMAT);
                        }
                    } else {
                        propKey.input = undefined;
                    }
                });
            }
            if (peopleQuerySettings.odataFilter) {
                $scope.showFilters = true;
                odataFilter = peopleQuerySettings.odataFilter;
            }
            setPeopleOnPage();
        } else if (search.query) {
            $scope.showFilters = true;
            $scope.query = angular.fromJson(search.query);
            doFilter();
        } else {
            setPeopleOnPage();
        }

        $scope.getPropertyValuesByKeyId = function (keyId) {
            return propValues.filter(function (item) {
                return item.PropertyKeyId === keyId;
            });
        };

        function getSkip() {
            return ($scope.pagination.currentPage - 1) * $scope.pagination.pageSize || 0;
        };

        $scope.getIndex = function(ind) {
            return getSkip() + ind + 1;
        };

        $scope.edit = function (person) {
            $location.path('/person/' + person.Id + '/' + $scope.pagination.currentPage);
        };

        $scope.delete = function (person) {
            if (config.checkDeleteItem) {
                var ok = confirm("Увага! Фізичну особу буде видалено, продовжити?");
                if (!ok) return;
            }
            $rootScope.errorMsg = '';
            peopleDataService.resource.remove({ id: person.Id }, function () {
                setPeopleOnPage();
                }, errorHandler);
        };

        $scope.addNew = function () {
            $location.path('/person/new/' + $scope.pagination.currentPage);
        };

        function errorHandler(e) {
            $scope.loader = {};
            $rootScope.errorMsg = serviceUtil.getErrorMessage(e);
        };
        
        $scope.onPageChange = function (newPageNumber) {
            $location.path("/people/" + newPageNumber);
        };
        
        function setPeopleOnPage() {
            peopleDataService.resource.getPageItems({ skip: getSkip(), filter: odataFilter }, successHandler, errorHandler);
        };

        function successHandler(data) {
            var people = data.value, keys = [];
            $rootScope.errorMsg = '';
            $scope.loader = {};
            //var start = new Date().getTime();
            // include city and street in person model
            $scope.people = people.map(function (p) {
                serviceUtil.expandAddress(p);
                return p;
            });
            $scope.pagination.totalItems = data['@odata.count'];

            //console.debug(new Date().getTime() - start);
            //function getFilterKeys() {
            //    var filterBuilder = [];

            //    keys.forEach(function (k) {
            //        if (filterBuilder.length > 0) filterBuilder.push("or");
            //        //filterBuilder.push("(CityId eq " + k.CityId + " and StreetId eq " + k.StreetId + " and House eq '" + p.House + "')");
            //        filterBuilder.push("(CityId eq " + k.CityId + " and (StreetId eq " + k.StreetId + " or StreetId eq 1))");
            //    });

            //    if (filterBuilder.length === 0) return undefined;
            //    console.debug(filterBuilder.join(''));
            //    return "&$filter=" + filterBuilder.join('');
            //};

            //function contains(arr, val) {
            //    for (var i = 0; i < arr.length; i++) {
            //        if (arr[i].CityId === val.CityId && arr[i].StreetId === val.StreetId) {
            //            return true;
            //        }
            //    }
            //    return false;
            //};

            //keys = people.reduce(function (previousValue, currentValue) {
            //    var key = {};
            //    key.CityId = currentValue.CityId;
            //    key.StreetId = currentValue.StreetId;
            //    if (!contains(previousValue, key)) previousValue.push(key);
            //    return previousValue;
            //}, []);

            //precinctAddressesData.getAllByKeys({ filter: getFilterKeys() }, function (addresses) {
            //    $rootScope.errorMsg = '';
            //    $scope.loader.loading = false;
            //    $scope.loader.filtering = false;
            //    var start = new Date().getTime();

            //    $scope.people = people.map(function (p) {
            //        var finded = addresses.value.filter(function(a) {
            //            return a.CityId === p.CityId && 
            //                a.StreetId === 1 ? true : a.StreetId === p.StreetId &&
            //                a.House === '' ? true : a.House.toLocaleLowerCase() === p.House.toLocaleLowerCase();
            //        });

            //        if (finded && finded.length > 0) p.PrecinctNumber = finded[0].Precinct.Number;

            //        p.City = $rootScope.cities.filter(function(c) {
            //            return c.Id === p.CityId;
            //        })[0];

            //        p.Street = $rootScope.streets.filter(function (s) {
            //            return s.Id === p.StreetId;
            //        })[0];

            //        return p;
            //    });
            //    console.debug(new Date().getTime() - start);
            //    $scope.totalItems = data['@odata.count'];
            //}, errorHandler);
        };

        function getODataFilterQuery() {
            var filterStr = '', filterInnerStr = '',
                filterPatterns = {
                    string: {
                        startswith: "startswith(:fieldName, ':val') eq true",
                        eq: ":fieldName eq ':val'"
                    },
                    num: ":fieldName eq :val",
                    ref: ":fieldNameId eq :val",
                    interval: ":fieldName ge :from and :fieldName le :to"
                },
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

            // ---------------------------- filter by base properties ----------------------------
            //redundant/hard way
            //Object.keys(filterPatterns).forEach(function(patternName) {
            //    var propNames = $scope.query[patternName];
            //    if (propNames) {
            //        Object.keys(propNames).forEach(function(propName) {
            //            if (patternName === 'interval') {
            //                var interval = $scope.query[patternName];
            //                Object.keys(interval).forEach(function (type) {
            //                    Object.keys(interval[type]).forEach(function (intervalPropName) {
            //                        var valFrom, valTo;
            //                        if (type === 'date') {
            //                            valFrom = serviceUtil.formatDateToISO(interval.date[intervalPropName].from,{startOfDay: true});
            //                            valTo = serviceUtil.formatDateToISO(interval.date[intervalPropName].to,{endOfDay: true});
            //                        } else {
            //                            valFrom = interval[type][intervalPropName].from;
            //                            valTo = interval[type][intervalPropName].to;
            //                        }
            //                        if (valFrom && valTo) {
            //                            filterStr = concatIfExist(filterStr, " and ") + filterPatterns[patternName]
            //                                .replace(/:fieldName/g, intervalPropName)
            //                                .replace(/:from/g, valFrom)
            //                                .replace(/:to/g, valTo);
            //                        }
            //                    });
            //                });
            //            } else {
            //                var val = $scope.query[patternName][propName];
            //                if (val && patternName === 'ref') val = val.Id;
            //                if (val) {
            //                    filterStr = concatIfExist(filterStr, " and ") + filterPatterns[patternName]
            //                        .replace(/:fieldName/g, propName)
            //                        .replace(/:val/g, val);
            //                }
            //            }
            //        });
            //    }
            //});

            //simple way
            if ($scope.query) {

                if ($scope.query.name) {
                    Object.keys($scope.query.name).forEach(function(propName) {
                        var val = $scope.query.name[propName];
                        if (val) {
                            filterStr = concatIfExist(filterStr, " and ") + filterPatterns.string.eq
                                .replace(/:fieldName/g, propName)
                                .replace(/:val/g, val);
                        }
                    });   
                }

                if ($scope.query.DateOfBirth) {
                    var valFrom = $scope.query.DateOfBirth.from,
                        valTo = $scope.query.DateOfBirth.to;
                    if (valFrom && valTo) {
                        filterStr = concatIfExist(filterStr, " and ") + filterPatterns.interval
                            .replace(/:fieldName/g, 'DateOfBirth')
                            .replace(/:from/g, serviceUtil.formatDateToISO($scope.query.DateOfBirth.from, { startOfDay: true }))
                            .replace(/:to/g, serviceUtil.formatDateToISO($scope.query.DateOfBirth.to, { endOfDay: true }));
                    }
                }

                if ($scope.query.ref) {
                    Object.keys($scope.query.ref).forEach(function (propName) {
                        var val = $scope.query.ref[propName];
                        if (val && val.Id) {
                            filterStr = concatIfExist(filterStr, " and ") + filterPatterns.ref
                                .replace(/:fieldName/g, propName)
                                .replace(/:val/g, val.Id);
                        }
                    });
                }

                if ($scope.query.House) {
                    filterStr = concatIfExist(filterStr, " and ") + filterPatterns.string.eq
                        .replace(/:fieldName/g, "House")
                        .replace(/:val/g, $scope.query.House);
                }

                if ($scope.query.Apartment) {
                    var valFrom = $scope.query.Apartment.from,
                        valTo = $scope.query.Apartment.to;
                    if (valFrom && valTo) {
                        filterStr = concatIfExist(filterStr, " and ") + filterPatterns.interval
                            .replace(/:fieldName/g, 'Apartment')
                            .replace(/:from/g, valFrom)
                            .replace(/:to/g, valTo);
                    }
                }

                if ($scope.query.PrecinctNum) {
                    filterStr = concatIfExist(filterStr, " and ") + filterPatterns.num
                        .replace(/:fieldName/g, "PrecinctAddress/Precinct/Number")
                        .replace(/:val/g, $scope.query.PrecinctNum);
                }

                if ($scope.query.HouseType) {
                    filterStr = concatIfExist(filterStr, " and ") + filterPatterns.num
                        .replace(/:fieldName/g, "PrecinctAddress/HouseType")
                        .replace(/:val/g, $scope.query.HouseType);
                }

                if ($scope.query.RegionPart) {
                    if ($scope.query.RegionPart.Id) {
                        filterStr = concatIfExist(filterStr, " and ") + filterPatterns.num
                            .replace(/:fieldName/g, "PrecinctAddress/Precinct/RegionPart/Id")
                            .replace(/:val/g, $scope.query.RegionPart.Id);
                    }
                }

                if ($scope.query.Gender) {
                    filterStr = concatIfExist(filterStr, " and ") + filterPatterns.num
                        .replace(/:fieldName/g, "Gender")
                        .replace(/:val/g, $scope.query.Gender);
                }
            }

            //---------------------------- filter by additional properties ----------------------------
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
                            .replace(/:from/g, propKeyType === 'date' ? serviceUtil.formatDateToISO(propKey.input.from, {startOfDay: true}) : propKey.input.from)
                            .replace(/:to/g, propKeyType === 'date' ? serviceUtil.formatDateToISO(propKey.input.to, { endOfDay: true }) : propKey.input.to);
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

        $scope.resetFilter = function () {
            if (odataFilter) {
                $scope.loader.loading = true;
                angular.forEach($scope.propKeys, function (propKey) {
                    if (propKey.input) propKey.input = undefined;
                });
                $scope.query = {};
                odataFilter = undefined;
                filterSettings.remove('people');
                setPeopleOnPage();
            }
        };

        $scope.applyFilter = doFilter;

        function doFilter() {
            $scope.loader.filtering = true;
            var filterQuery = getODataFilterQuery();
            if (filterQuery.length > 0) {
                odataFilter = '&$filter=' + filterQuery;
                filterSettings.set('people', {
                    props: angular.copy($scope.query),
                    additionalProps: angular.copy($scope.propKeys.filter(function(key) {
                        return key.input != undefined;
                    })),
                    odataFilter: odataFilter
                });
                setPeopleOnPage();
            } else {
                if (odataFilter) {
                    $scope.resetFilter();
                } else {
                    $scope.loader.filtering = false;
                }
            }  
        };

        $scope.toggleSelection = function (propKey,checkedValue) {
            function indexOf(arr, val) {
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i].Id === val.Id) {
                        return i;
                    }
                }
                return -1;
            };

            if (!propKey.input) {
                propKey.input = [];
                propKey.input.push(checkedValue);
                return;
            }
            var ind = indexOf(propKey.input, checkedValue);
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

        $scope.checkedPropValue = function (propKey, checkVal) {
            if (!propKey.input) return false;
            return propKey.input.some(function (val) {
                return val.Id === checkVal.Id;
            });
        };

        $scope.getDistinctNames = function (val, method) {
            return peopleDataService.resource[method]({ "startsWith": val }).$promise.then(function (res) {
                return res.value;
            });
        };

        $scope.getPeopleByName = peopleDataService.typeaheadPersonByNameFn();
    }]);

peopleControllers.controller('editPersonController', ['$rootScope', '$scope', '$location', '$modal', 'serviceUtil', 'precinctData', 'precinctAddressesData', 'config', 'resolvedData', 'houseTypes', 'modelFactory', 'peopleDataService', 'workAreaResource', 'checkPermissions',
    function ($rootScope, $scope, $location, $modal, serviceUtil, precinctData, precinctAddressesData, config, resolvedData, houseTypes, modelFactory, peopleDataService, workAreaResource, checkPermissions) {
        var addMode = true, editInd, propValues = [], DATE_FORMAT = 'yyyy-MM-ddT00:00:00+02:00';
        $rootScope.pageTitle = 'Фізична особа';
        $scope.tableHead = ['№', 'Назва', 'Значення'];
        $scope.selected = { property: {} };
        
        $scope.propKeys = resolvedData.additionalProps.keys;
        propValues = resolvedData.additionalProps.values;
        $scope.houseTypes = houseTypes;
        function getPropertyValuesByKeyId (keyId) {
            return propValues.filter(function (item) {
                return item.PropertyKeyId === keyId;
            });
        };

        if (resolvedData.data) {
            if (resolvedData.data.person) {
                addMode = false;
                $scope.person = resolvedData.data.person;
                if (resolvedData.data.person.DateOfBirth) {
                    $scope.dateOfBirth = serviceUtil.formatDate(new Date(resolvedData.data.person.DateOfBirth), config.LOCALE_DATE_FORMAT);
                }
                resolvedData.data.person.Major.label = peopleDataService.getPersonLabel(resolvedData.data.person.Major);
                //$scope.person.address = resolvedData.data.person.PrecinctAddress;
                //$scope.person.address.City = resolvedData.data.person.City;
                //$scope.person.address.Street = resolvedData.data.person.Street;
                $scope.person.additionalProperties = getPropertyPairs(resolvedData.data.person.PersonAdditionalProperties);
            }
            $scope.precincts = resolvedData.data.precincts;
        }

        function getPropertyPairs(properties) {
            var result, types = peopleDataService.propertyTypes.getAll();
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
            //if (!$scope.person.address.Precinct) {
            //    $rootScope.errorMsg = 'Не вказано номер дільниці';
            //    return;
            //};

            if (!$scope.person.CityId) {
                $rootScope.errorMsg = "Не вказана адреса будинку";
                return;
            };

            if ($scope.person.Major && !$scope.person.Major.Id) {
                $rootScope.errorMsg = "Відповідального '" + $scope.person.Major + "' не знайдено";
                return;
            };

            $rootScope.errorMsg = '';
            $scope.saving = true;
            //var person = modelFactory.createObject('person', [$scope.person, $scope.person.address]);
            var person = modelFactory.createObject('person', $scope.person);
            //var precinctAddress = modelFactory.createObject('precinctAddress', $scope.person.address);
            person.DateOfBirth = serviceUtil.formatDate($scope.dateOfBirth, DATE_FORMAT);
            if (!person.DateOfBirth) {
                $scope.saving = false;
                $rootScope.errorMsg = "Не вірно вказана дата народження";
                return;
            }
            if (person.ApartmentStr) {
                person.Apartment = parseInt(person.ApartmentStr);
                person.ApartmentStr = person.ApartmentStr.toLocaleUpperCase();
            }
            
            if (!$scope.person.Major) person.MajorId = 0;
            //if ($scope.person.address.Precinct && $scope.person.address.Precinct.Id) {
            //    savePrecinctAddress({ Id: $scope.person.address.Precinct.Id });
            //} else {
            //    savePerson();
            //    //precinctData.save({ "Number": $scope.person.address.Precinct }, savePrecinctAddress, errorHandler);
            //}

            //function savePrecinctAddress(precinct) {
            //    var addressKey = serviceUtil.getAddressKey(precinctAddress);
            //    precinctAddress.PrecinctId = precinct.Id;
            //    precinctAddressesData.query(addressKey, function () {
            //        precinctAddressesData.update(addressKey, precinctAddress, function() {
            //            savePerson();
            //        }, errorHandler);
            //    }, function () {
            //        precinctAddressesData.save(precinctAddress, function () {
            //            savePerson();
            //        }, errorHandler);
            //    });
            //};

            //function savePerson() {
                if (addMode) {
                    peopleDataService.resource.save(person, function (res) {
                        addMode = false;
                        $scope.saving = false;
                        $scope.person.Id = res.Id;
                        $scope.person.additionalProperties = [];
                        $rootScope.successMsg = "Фізичну особу створено успішно!";
                    }, errorHandler);
                } else {
                    peopleDataService.resource.update({ id: $scope.person.Id
                    }, person, function () {
                        $scope.saving = false;
                        $rootScope.successMsg = "Зміни успішно збережено!";
                    }, errorHandler);
                }
            //};
        };

        $scope.backToList = function () {
            $rootScope.errorMsg = '';
            var currPage = serviceUtil.getRouteParam("currPage") || 1;
            $location.path('/people/' + currPage);
        };

        //$scope.onSelectStreet = function ($item) {
        //    $scope.person.address.StreetId = $item.Id;
        //};

        //$scope.onSelectCity = function ($item) {
        //    $scope.person.address.CityId = $item.Id;
        //};

        $scope.onSelectProperty = function ($item, $model) {
            $scope.selected.property.Value = $item;
            $scope.selected.property.ValueId = $model;
        };
        
        $scope.onSelectMajor = function ($item) {
            $scope.person.MajorId = $item.Id;
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
            peopleDataService.additionalPropsResource.getByKey({
                personId: $scope.person.Id, propertyKeyId: propKeyId }, function (res) {
                prop = getPropertyPairs(res);
                typeStr = prop.key.PropertyType.html;
                if (typeStr.indexOf('ref') === 0) {
                    $scope.isPrimitive = false;
                }
                if (typeStr === 'date') {
                    $scope.selected.property.Value = serviceUtil.formatDate(new Date(prop.value.desc), config.LOCALE_DATE_FORMAT);
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
            var newPropValue;
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
            var propType = $scope.selected.property.Key.PropertyType;
            if (propType.html.indexOf('ref') === 0 && !$scope.selected.property.ValueId) {
                $rootScope.errorMsg = "Значення '" + $scope.selected.property.Value + "' для характеристики '" + $scope.selected.property.Key.Name + "' не знайдено";
                return;
            }
            $rootScope.errorMsg = '';
            $scope.savingProp = true;
            
            var newProperty = modelFactory.createObject('personAdditionalProperty');
            newProperty.PersonId = $scope.person.Id;
            newProperty.PropertyKeyId = $scope.selected.property.Key.Id;

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
                peopleDataService.additionalPropsResource.save(newProperty, successHandler, errorHandler);
            } else {
                peopleDataService.additionalPropsResource.update(
                   { personId: newProperty.PersonId, propertyKeyId: newProperty.PropertyKeyId },
                   newProperty,
                   successHandler,
                   errorHandler
                );
            }
            
            function successHandler() {
                $scope.savingProp = false;
                newProperty.PropertyKey = $scope.selected.property.Key;
                newProperty.PropertyValue = $scope.selected.property.Value;
                if ($scope.addPropertyMode) {
                    $scope.person.additionalProperties.push(getPropertyPairs(newProperty));
                } else {
                    $scope.person.additionalProperties[editInd] = getPropertyPairs(newProperty);
                }
                $scope.reset();
            };
        };
        
        $scope.deleteProperty = function (prop, ind) {
            if (config.checkDeleteItem) {
                var ok = confirm("Увага! Характеристику фіз. особи буде видалено, продовжити?");
                if (!ok) return;
            }
            peopleDataService.additionalPropsResource.remove(
                { personId: $scope.person.Id, propertyKeyId: prop.key.Id},
                function () {$scope.person.additionalProperties.splice(ind, 1)},
                errorHandler
            );
        };

        $scope.getPeopleByName = peopleDataService.typeaheadPersonByNameFn();

        $scope.clearMajor = function() {
            $scope.person.Major = undefined;
            $scope.person.MajorId = 0;
        };

        $scope.openWorkAreaSelection = function (searchParam) {
            var modalInstance = $modal.open({
                animation: false,
                templateUrl: 'Views/Modals/workarea.selection.html',
                controller: 'modalWorkAreaSelectionCtrl',
                backdrop: 'static',
                resolve: {
                    data: function () {
                        var promise = workAreaResource.getAll({ filter: "&$filter=PrecinctId eq " + $scope.person.PrecinctAddress.Precinct.Id }).$promise;
                        promise.catch(function(err) {
                            $rootScope.errorMsg = serviceUtil.getErrorMessage(err);
                        });
                        return promise;
                    }
                }
            });

            modalInstance.result.then(function (selectedWorkArea) {
                $location.path('/work-area/' + selectedWorkArea.Id).search(searchParam, $scope.person.Id).search("precinctId", $scope.person.PrecinctAddress.Precinct.Id);
            });
        };

        $scope.changeAddress = function() {
            var modalInstance = $modal.open({
                animation: false,
                templateUrl: 'Views/Modals/house.selection.html',
                controller: 'modalHouseSelectionCtrl',
                backdrop: 'static',
                scope: $scope,
                size: 'lg'
            });

            modalInstance.result.then(function (selectedAddress) {
                if (!$scope.person) $scope.person = { PrecinctAddress: {} };
                if ($scope.person && !$scope.person.PrecinctAddress) $scope.person.PrecinctAddress = {};
                $scope.person.CityId = selectedAddress.City.Id;
                $scope.person.StreetId = selectedAddress.Street.Id;
                $scope.person.House = selectedAddress.House;
                $scope.person.City = selectedAddress.City;
                $scope.person.Street = selectedAddress.Street;
                $scope.person.PrecinctAddress.Precinct = selectedAddress.Precinct;
                $scope.person.PrecinctAddress.HouseType = selectedAddress.HouseType;
            });
        };

        $scope.addressToString = function() {
            return $scope.person ? serviceUtil.addressToString($scope.person,true) : '';
        };

        $scope.permit = function(roles) {
            return checkPermissions(roles);
        };
    }]);

peopleControllers.controller('modalWorkAreaSelectionCtrl', ['$scope', '$modalInstance', 'data', function ($scope, $modalInstance, data) {

    $scope.items = data.value;
    $scope.selected = {
        item: undefined
    };

    $scope.ok = function () {
        $modalInstance.close($scope.selected.item);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
}]);

peopleControllers.controller('modalHouseSelectionCtrl', ['$scope', '$modalInstance', 'precinctAddressesData', 'serviceUtil', 'houseTypes', 'precinctData', 'modelFactory', function ($scope, $modalInstance, precinctAddressesData, serviceUtil, houseTypes, precinctData, modelFactory) {

    if ($scope.person) {
        $scope.searchBy = {
            city: $scope.person.City,
            street: $scope.person.Street.Name ? $scope.person.Street : undefined,
            house: $scope.person.House
        }
    }
    
    $scope.loader = {};
    $scope.alert = {};
    $scope.precinctAddresses = [];

    precinctData.getAllNotExpand(function(resp) {
        $scope.precincts = resp.value;
    }, errorHandler);

    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

    function errorHandler(error) {
        $scope.loader = {};
        $scope.alert = {
            type: "alert-danger",
            message: serviceUtil.getErrorMessage(error)
        }
    };

    $scope.reset = function () {
        $scope.addMode = false;
        $scope.newAddress = {};
        $scope.alert = {};
    };

    $scope.searchAddress = function () {
        $scope.reset();

        if ($scope.searchBy.city && !$scope.searchBy.city.Id) {
            $scope.alert = {
                type: "alert-danger",
                message: "Населений пункт '" + $scope.searchBy.city + "' не знайдено"
            }
            return;
        };

        if ($scope.searchBy.street && !$scope.searchBy.street.Id) {
            $scope.alert = {
                type: "alert-danger",
                message: "Вулицю '" + $scope.searchBy.street + "' не знайдено"
            }
            return;
        };

        var filterQuery = "CityId eq " + $scope.searchBy.city.Id;
        if ($scope.searchBy.street) filterQuery = filterQuery + " and StreetId eq :streetId".replace(/:streetId/g, $scope.searchBy.street.Id);
        if ($scope.searchBy.house) filterQuery = filterQuery + " and House eq ':house'".replace(/:house/g, $scope.searchBy.house);
        $scope.loader.searching = true;
        $scope.alert = {};
        precinctAddressesData.getAll({filter: "&$filter=" + filterQuery}, function(addresses) {
            serviceUtil.sortAddresses(addresses.value);
            $scope.precinctAddresses = addresses.value;
            $scope.loader.searching = false;
            if ($scope.precinctAddresses.length === 0) {
                $scope.alert = { type: "alert-info", message: "Адресу не знайдено" };
            }
        }, errorHandler);
    };

    $scope.add = function() {
        $scope.addMode = true;
        $scope.newAddress = {};
        if ($scope.searchBy && $scope.searchBy.city) {
            $scope.newAddress.City = $scope.searchBy.city;
            $scope.newAddress.CityId = $scope.searchBy.city.Id;
        }
        if ($scope.searchBy && $scope.searchBy.street) {
            $scope.newAddress.Street = $scope.searchBy.street;
            $scope.newAddress.StreetId = $scope.searchBy.street.Id;
        }
        if ($scope.searchBy && $scope.searchBy.house) $scope.newAddress.House = $scope.searchBy.house;
    };

    $scope.save = function () {

        if (!$scope.newAddress) return;

        if (!$scope.newAddress.CityId) {
            $scope.alert = {type: "alert-danger", message: "Не вибрано населений пункт"}
            return;
        };

        if ($scope.newAddress.Street && !$scope.newAddress.StreetId) {
            $scope.alert = {type: "alert-danger", message: "Не вибрано вулицю"}
            return;
        };

        if (!$scope.newAddress.Precinct) {
            $scope.alert = {type: "alert-danger", message: "Не вказано дільницю"}
            return;
        };

        //if (!$scope.newAddress.House) {
        //    $scope.alert = {type: "alert-danger", message: "Не вказано номер будинку"}
        //    return;
        //};

        $scope.loader.saving = true;
        $scope.alert = {};
        
        if ($scope.newAddress.Precinct && !$scope.newAddress.PrecinctId) {
            precinctData.save({ "Number": $scope.newAddress.Precinct }, savePrecinctAddress, errorHandler);
        } else {
            savePrecinctAddress($scope.newAddress.Precinct);
        }

        function savePrecinctAddress(precinct) {
            var modelAddress = modelFactory.createObject('precinctAddress', $scope.newAddress);
            modelAddress.PrecinctId = precinct.Id;
            $scope.newAddress.Precinct = precinct;
            precinctAddressesData.save(modelAddress, function (resp) {
                $scope.loader.saving = false;
                if (!$scope.newAddress.Street) $scope.newAddress.Street = { Id: resp.StreetId };
                $scope.precinctAddresses.push($scope.newAddress);
                serviceUtil.sortAddresses($scope.precinctAddresses);
                $scope.reset();
            }, errorHandler);
        };
        
    };

    $scope.onSelectAddress = function (address) {
        $modalInstance.close(address);
    };

    $scope.onSelectCity = function($item, model) {
        model.CityId = $item.Id;
    };

    $scope.onSelectStreet = function($item, model) {
        model.StreetId = $item.Id;
    };

    $scope.onSelectPrecinct = function($item) {
        $scope.newAddress.PrecinctId = $item.Id;
    };

}]);