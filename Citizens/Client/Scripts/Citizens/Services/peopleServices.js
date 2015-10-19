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
		    'getPageItems': { method: 'GET', params: { skip: '@skip', filter: '@filter' }, url: urlOdata + "?" + paginate + ":filter" },
		    'getFilteredItems': { method: 'GET', params: { filter: '@filter', top: '@top', orderby: '@orderby' }, url: urlOdata + "?$filter=:filter&$top=:top :orderby" },
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
    .factory('peopleDataService', ['$q', 'serviceUtil', 'peopleResource', 'additionalPropsResource', 'propertyTypes',
        function ($q, serviceUtil, peopleResource, additionalPropsResource, propertyTypes) {

        function getPersonLabel(person) {
            if (!person.City || !person.Street) serviceUtil.expandAddress(person);
            var strAddress = serviceUtil.addressToString(person),
                dateOfBirth = new Date(person.DateOfBirth),
                strDateOfBirth = serviceUtil.isEmptyDate(dateOfBirth) ? '' : ', ' + dateOfBirth.toLocaleDateString() + ' р.н.';
            strAddress = strAddress ? ', ' + strAddress : '';
            var label = person.LastName + ' ' + person.FirstName + ' ' + person.MidleName + '' + strDateOfBirth + '' + strAddress;
            return label.trim();
        };

        return {
            asyncLoadData: function (routeParam) {
                if (routeParam) {
                    var promise = peopleResource.getById({ id: routeParam }).$promise;
                    promise.catch(function (err) {
                        err.description = 'Фізичну особу не знайдено';
                        return $q.reject(err);
                    });
                    return $q.all({ person: promise });
                } else {
                    return $q.when();
                }
            },

            asyncLoadAdditionalProperties: function () {
                function errorHandler(err) {
                    err.description = 'Додаткові характеристики не завантажено';
                    return $q.reject(err);
                };
                return $q.all({
                    keys: additionalPropsResource.getKeys().$promise.then(function (data) {
                        propertyTypes.castToObject(data.value);
                        return data.value;
                    }, errorHandler),
                    values: additionalPropsResource.getValues().$promise.then(function(data) {
                        return data.value;
                    }, errorHandler) 
                });
                
            },

            getPersonLabel: getPersonLabel,

            typeaheadPersonByName: function (viewValue) {
                var names = viewValue.split(" "),
                name = {
                    last: names[0],
                    first: names[1],
                    midle: names[2]
                };
                if (names.length > 3) {
                    for (var i = 3; i < names.length; i++) {
                        name.midle += ' ' + names[i];
                    }
                }
                if (name.last && !name.first && !name.midle) {
                    return peopleResource.lastNames({ "startsWith": name.last }).$promise.then(function (res) {
                        return res.value.map(function(lastName) {
                            return { label: lastName};
                        });
                    });
                }
                if (name.last && name.first && !name.midle) {
                    return peopleResource.firstNames({ "startsWith": name.first }).$promise.then(function (res) {
                        return res.value.map(function (firstName) {
                            return { label: firstName, input: name.last };
                        });
                    });
                }
                var filterQuery = "LastName eq 'lname' and FirstName eq 'fname' and startswith(MidleName,'mname') eq true"
                    .replace(/lname/, name.last)
                    .replace(/fname/, name.first)
                    .replace(/mname/, name.midle);

                return peopleResource.getFilteredItems({filter: filterQuery, top: 10, orderby: '&$orderby=MidleName' }).$promise.then(function (res) {
                    return res.value.map(function (person) {
                        person.label = getPersonLabel(person);
                        return person;
                    });
                });
            },
            resource: peopleResource,
            additionalPropsResource: additionalPropsResource,
            propertyTypes: propertyTypes
        };
    }]);