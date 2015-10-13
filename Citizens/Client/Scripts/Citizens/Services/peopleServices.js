'use strict';

angular.module("peopleServices", ['ngResource', 'precinctServices']).
    factory("peopleResource", ['$resource', 'config', function ($resource, config) {
        var urlOdata = config.baseUrl + '/odata/People',
            order = '&$orderby=LastName,FirstName,MidleName',
            expand = '?$expand=City($expand=CityType,RegionPart),Street($expand=StreetType)',
            expandSingle = expand + ",Major,PrecinctAddress($expand=Precinct),PrecinctAddress($expand=WorkArea($expand=Top,Precinct)),PersonAdditionalProperties($expand=PropertyKey,PropertyValue)",
            //paginate = "&$count=true&$skip=:skip&$top=" + config.pageSize,
            paginate = "$count=true&$skip=:skip"; // page size on server-side

        return $resource('', {},
		{
		    'getById': { method: 'GET', params: { id: "@id" }, url: urlOdata + "(:id)" + expandSingle },
		    'getByIdNotExpand': { method: 'GET', params: { id: "@id" }, url: urlOdata + "(:id)" },
		    //'getPageItems': { method: 'GET', params: { skip: "@skip" }, url: urlOdata + "?" + paginate },
		    //'getFilteredPageItems': { method: 'GET', params: { skip: "@skip", filter: '@filter' }, url: urlOdata + "?$filter=:filter" + paginate },
		    'getPageItems': { method: 'GET', params: { skip: '@skip', filter: '@filter' }, url: urlOdata + "?" + paginate + ":filter" },
		    'getFilteredItems': { method: 'GET', params: { filter: '@filter' }, url: urlOdata + "?$filter=:filter" },
		    'update': { method: 'PUT', params: { id: "@id" }, url: urlOdata + "(:id)" },
		    'save': { method: "POST", url: urlOdata },
		    'remove': { method: 'DELETE', params: { id: "@id" }, url: urlOdata + "(:id)" },
		    'firstNames': { method: 'GET', params: { startsWith: "@startsWith" }, url: urlOdata + "/FirstNames(StartsWith=':startsWith')" },
		    'midleNames': { method: 'GET', params: { startsWith: "@startsWith" }, url: urlOdata + "/MidleNames(StartsWith=':startsWith')" },
		    'lastNames': { method: 'GET', params: { startsWith: "@startsWith" }, url: urlOdata + "/LastNames(StartsWith=':startsWith')" },
		    'clearMajor': { method: 'POST', params: { id: "@id" }, url: urlOdata + "(:id)/ClearMajor" }
		});
    }]).
    factory("additionalPropsResource", ['$resource', 'config', function ($resource, config) {
        var urlOdata = config.baseUrl + '/odata/PersonAdditionalProperties',
            urlOdataValues = config.baseUrl + '/odata/PropertyValues',
            urlOdataKeys = config.baseUrl + '/odata/PropertyKeys',
            key = "(PersonId=:personId,PropertyKeyId=:propertyKeyId)",
            params = { id: { id: "@id" } };
        params.propertyKey = { propertyKeyId: "@propertyKeyId" };
        params.key = angular.extend({}, { personId: "@personId" }, params.propertyKey);
        params.filter = { filter: "@filter" };
        return $resource('', {},
		{
		    'getByKey': { method: 'GET', params: params.key, url: urlOdata + key + "?$expand=PropertyKey,PropertyValue" },
		    'update': { method: 'PUT', params: params.key, url: urlOdata + key },
		    'save': { method: "POST", url: urlOdata },
		    'remove': { method: 'DELETE', params: params.key, url: urlOdata + key },
		    'getKey': { method: 'GET', params: params.id, url: urlOdataKeys + "(:id)" },
		    'getKeys': { method: 'GET', params: params.filter, url: urlOdataKeys + "?$orderby=Name:filter", cache: true },
		    'getValue': { method: 'GET', params: params.id, url: urlOdataValues + "(:id)" },
		    'getValuesByKeyId': { method: 'GET', params: params.propertyKey, url: urlOdataValues + "?$filter=PropertyKeyId eq :propertyKeyId&$orderby=Value" },
		    'getValues': { method: 'GET', params: params.filter, url: urlOdataValues + "?$orderby=PropertyKeyId,Value:filter", cache: true },
		    'getRange': { method: 'POST', url: urlOdata + "/GetRange"},
		    'addRange': { method: 'POST', url: urlOdata + "/AddRange"},
		    'removeRange': { method: 'POST', url: urlOdata + "/RemoveRange"},
		    'updateKey': { method: 'PUT', params: params.id, url: urlOdataKeys + "(:id)" },
		    'updateValue': { method: 'PUT', params: params.id, url: urlOdataValues + "(:id)" },
		    'saveKey': { method: "POST", url: urlOdataKeys },
		    'saveValue': { method: "POST", url: urlOdataValues },
		    'removeKey': { method: 'DELETE', params: params.id, url: urlOdataKeys + "(:id)" },
		    'removeValue': { method: 'DELETE', params: params.id, url: urlOdataValues + "(:id)" }
		});
    }]).
    factory("propertyTypes", [function () {
        var types = [
                        { field: 'IntValue',        html: 'number',     label: 'Число', isPrimitive: true },
                        { field: 'StringValue',     html: 'text',       label: 'Рядок', isPrimitive: true },
                        { field: 'DateTimeValue',   html: 'date',       label: 'Дата',  isPrimitive: true },
                        { field: 'PropertyValueId', html: 'ref',        label: 'Довідник', isPrimitive: false },
                        { field: 'IntValue',        html: 'refCity',    label: 'Місто', isPrimitive: false },
                        { field: 'IntValue',        html: 'refStreet',  label: 'Вулиця', isPrimitive: false }
        ];
        return {
            getAll: function () { return types; },
            castToObject: function (keys) {
                angular.forEach(keys, function (item) {
                    angular.forEach(types, function (type) {
                        if (item.PropertyType === type.label) item.PropertyType = type;
                    });
                });
            }
        }
    }])
    .factory('peopleDataService', ['$q', '$rootScope', 'serviceUtil', 'peopleResource', 'precinctData', 'additionalPropsResource', 'propertyTypes',
        function ($q, $rootScope, serviceUtil, peopleResource, precinctData, additionalPropsResource, propertyTypes) {
        
        //function getPersonPromise(routeParam) {
        //    var deferred = $q.defer();
        //    if (routeParam) {
        //        peopleResource.getById({ id: routeParam
        //        }, function (res) {
        //            deferred.resolve(res);
        //        }, function (err) {
        //            err.description = 'Фізичну особу не знайдено';
        //            deferred.reject(serviceUtil.getErrorMessage(err));
        //        });
        //    } else {
        //        deferred.resolve();
        //    }
        //    return deferred.promise;
        //};

        function getAdditionalPropertiesPromise(method) {
            var deferred = $q.defer();
            additionalPropsResource[method](function (res) {
                    deferred.resolve(res.value);
                }, function (err) {
                    err.description = 'Додаткові характеристики не завантажено';
                    deferred.reject(serviceUtil.getErrorMessage(err));
            });
            return deferred.promise;
        };

        //function getPrecinctsPromise() {
        //    var deferred = $q.defer();
        //    precinctData.getAllNotExpand(function (res) {
        //        deferred.resolve(res.value);
        //    }, function (err) {
        //        err.description = 'Дільниці не завантажено';
        //        deferred.reject(serviceUtil.getErrorMessage(err));
        //    });
        //    return deferred.promise;
        //};

        return {
            asyncLoadData: function (routeParam) {
                //var resolved = {}, deferred = $q.defer();
                //function errorHandler(err) {
                //    deferred.reject(err);
                //};
                //getPersonPromise(routeParam).then(function(person) {
                //    resolved.person = person;
                //    return getPrecinctsPromise();
                //}, errorHandler).then(function (precincts) {
                //    resolved.precincts = precincts;
                //    deferred.resolve(resolved);
                //}, errorHandler);

                //return deferred.promise;
                if (routeParam) {
                    var promise = peopleResource.getById({ id: routeParam }).$promise;
                    promise.catch(function (err) {
                        err.description = 'Фізичну особу не знайдено';
                        $rootScope.errorMsg = serviceUtil.getErrorMessage(err);
                    });
                    //return $q.all({ person: promise });
                } else {
                    //return $q.when();
                }
                return routeParam ? $q.all({ person: promise }) : $q.when();
            },
            asyncLoadAdditionalProperties: function () {
                var resolved = { }, deferred = $q.defer();
                function errorHandler(err) {
                    deferred.reject(err);
                };
                getAdditionalPropertiesPromise('getKeys').then(function (propKeys) {
                    propertyTypes.castToObject(propKeys);
                    resolved.keys = propKeys;
                    return getAdditionalPropertiesPromise('getValues');
                    }, errorHandler).then(function (propValues) {
                        resolved.values = propValues;
                    deferred.resolve(resolved);
                }, errorHandler);

                return deferred.promise;
            },
            getPersonLabel: function (person) {
                if (!person.City || !person.Street) serviceUtil.expandAddress(person);
                var strAddress = serviceUtil.addressToString(person),
                    dateOfBirth = new Date(person.DateOfBirth),
                    srtDateOfBirth = serviceUtil.isEmptyDate(dateOfBirth) ? '' : ', ' + dateOfBirth.toLocaleDateString() + ' р.н.';
                strAddress = strAddress ? ', ' + strAddress : '';
                return person.LastName + ' ' + person.FirstName + ' ' + person.MidleName + '' + srtDateOfBirth + '' + strAddress;
            },
            typeaheadPersonByNameFn: function () {
                var odataFilterPattern = ":propName eq ':val'";
                var getPersonLabel = this.getPersonLabel;
                return function (viewValue) {
                    var names = viewValue.split(" "), filterQuery = '';
                    if (names.length < 3) return [];
                    var name = {
                        LastName: names[0],
                        FirstName: names[1],
                        MidleName: names[2]
                    };
                    if (names.length > 3) {
                        for (var i = 3; i < names.length; i++) {
                            name.MidleName += ' ' + names[i];
                        }
                    }
                    Object.keys(name).forEach(function (prop) {
                        if (filterQuery) filterQuery = filterQuery + " and ";
                        filterQuery = filterQuery + odataFilterPattern
                            .replace(/:propName/g, prop)
                            .replace(/:val/g, name[prop]);
                    });

                    return peopleResource.getFilteredItems({filter: filterQuery }).$promise.then(function (res) {
                        return res.value.map(function (person) {
                            person.label = getPersonLabel(person);
                            return person;
                        });
                    });
                }
            },
            resource: peopleResource,
            additionalPropsResource: additionalPropsResource,
            propertyTypes: propertyTypes
        };
    }]);