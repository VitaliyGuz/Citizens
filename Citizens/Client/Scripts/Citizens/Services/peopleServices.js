'use strict';

angular.module("peopleServices", ['ngResource', 'precinctServices']).
    factory("peopleData", ['$resource', 'config', function ($resource, config) {
        var urlOdata = config.baseUrl + '/odata/People',
            order = '&$orderby=LastName,FirstName,MidleName',
            expand = '?$expand=City($expand=CityType,RegionPart),Street($expand=StreetType),PrecinctAddress',
            expandWithProps = expand + ",PersonAdditionalProperties($expand=PropertyKey,PropertyValue)",
            paginate = "&$count=true&$skip=:skip&$top=" + config.pageSize;

        return $resource('', {},
		{
		    'getById': { method: 'GET', params: { id: "@id" }, url: urlOdata + "(:id)" + expandWithProps },
		    'query': { method: 'GET', params: { id: "@id", skip: "@skip" }, url: urlOdata + expand },
		    'getPageItems': { method: 'GET', params: { skip: "@skip" }, url: urlOdata + expand + paginate + order },
		    'getFilteredPageItems': { method: 'GET', params: { skip: "@skip", filter: '@filter' }, url: urlOdata + expandWithProps + "&$filter=:filter" + paginate + order },
		    'update': { method: 'PUT', params: { id: "@id" }, url: urlOdata + "(:id)" },
		    'save': { method: "POST", url: urlOdata },
		    'remove': { method: 'DELETE', params: { id: "@id" }, url: urlOdata + "(:id)"}
		});
    }]).
    factory("additionalPropsData", ['$resource', 'config',function ($resource, config) {
        var urlOdata = config.baseUrl + '/odata/PersonAdditionalProperties',
            urlOdataValues = config.baseUrl + '/odata/PropertyValues',
            urlOdataKeys = config.baseUrl + '/odata/PropertyKeys',
            key = "(PersonId=:personId,PropertyKeyId=:propertyKeyId)",
            params = { personId: "@personId", propertyKeyId: "@propertyKeyId" };
        return $resource('', {},
		{
		    'getByKey': { method: 'GET', params: params, url: urlOdata + key + "?$expand=PropertyKey,PropertyValue" },
		    'update': { method: 'PUT', params: params, url: urlOdata + key },
		    'save': { method: "POST", url: urlOdata },
		    'remove': { method: 'DELETE', params: params, url: urlOdata + key },
		    'getKey': { method: 'GET', params: { id: "@id" }, url: urlOdataKeys + "(:id)" },
		    'getKeys': { method: 'GET', url: urlOdataKeys + "?$orderby=Name", cache: false },
		    'getValue': { method: 'GET', params: { id: "@id" }, url: urlOdataValues + "(:id)" },
		    'getValuesByKeyId': { method: 'GET', params: { keyId: "@keyId" }, url: urlOdataValues + "?$filter=PropertyKeyId eq :keyId&$orderby=Value" },
		    'getValues': { method: 'GET', url: urlOdataValues + "?$orderby=PropertyKeyId,Value", cache: false },
		    'updateKey': { method: 'PUT', params: { id: "@id" }, url: urlOdataKeys + "(:id)" },
		    'updateValue': { method: 'PUT', params: { id: "@id" }, url: urlOdataValues + "(:id)" },
		    'saveKey': { method: "POST", url: urlOdataKeys },
		    'saveValue': { method: "POST", url: urlOdataValues },
		    'removeKey': { method: 'DELETE', params: { id: "@id" }, url: urlOdataKeys + "(:id)" },
		    'removeValue': { method: 'DELETE', params: { id: "@id" }, url: urlOdataValues + "(:id)" }
		});
    }]).
    factory("propertyTypes", [function () {
        var types = [
                        { field: 'IntValue',        html: 'number',     label: 'Число' },
                        { field: 'StringValue',     html: 'text',       label: 'Рядок' },
                        { field: 'DateTimeValue',   html: 'date',       label: 'Дата' },
                        { field: 'PropertyValueId', html: 'ref',        label: 'Довідник' },
                        { field: 'IntValue',        html: 'refCity',    label: 'Місто' },
                        { field: 'IntValue',        html: 'refStreet',  label: 'Вулиця' }
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
    .factory('dataForEditPersonPage', ['$q', 'serviceUtil', 'peopleData', 'precinctData', function ($q, serviceUtil, peopleData, precinctData) {

        function getPersonPromise(routeParam) {
            var deferred = $q.defer();
            if (routeParam) {
                peopleData.getById({ id: routeParam }, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    var errMsg = 'Фізичну особу не знайдено';
                    if (err && err.length > 0) errMsg = errMsg + ' (' + serviceUtil.getErrorMessage(err) + ')';
                    deferred.reject(errMsg);
                });
            } else {
                deferred.resolve();
            }
            return deferred.promise;
        };

        function getPrecinctsPromise() {
            var deferred = $q.defer();
            precinctData.getAllNotExpand(function (res) {
                deferred.resolve(res.value);
            }, function (err) {
                var errMsg = 'Дільниці не завантажено';
                if (err && err.length > 0) errMsg = errMsg + ' (' + serviceUtil.getErrorMessage(err) + ')';
                deferred.reject(errMsg);
            });
            return deferred.promise;
        };

        return {
            asyncLoad: function (routeParam) {
                var resolved = {}, deferred = $q.defer();
                function errorHandler(err) {
                    deferred.reject(err);
                };
                getPersonPromise(routeParam).then(function(person) {
                    resolved.person = person;
                    return getPrecinctsPromise();
                }, errorHandler).then(function (precincts) {
                    resolved.precincts = precincts;
                    deferred.resolve(resolved);
                }, errorHandler);

                return deferred.promise;
            }
        };
    }])
    .factory('genlPeopleData', ['$q', 'additionalPropsData', 'propertyTypes', 'serviceUtil', function ($q, additionalPropsData, propertyTypes, serviceUtil) {
        function getAdditionalPropertiesPromise(method) {
            var deferred = $q.defer();
            
            additionalPropsData[method](function (res) {
                deferred.resolve(res.value);
            }, function (err) {
                var errMsg = 'Додаткові характеристики не завантажено';
                if (err && err.length > 0) errMsg = errMsg + ' (' + serviceUtil.getErrorMessage(err) + ')';
                deferred.reject(errMsg);
            });
            
            return deferred.promise;
        };

        return {
            asyncLoad: function () {
                var resolved = {}, deferred = $q.defer();
                function errorHandler(err) {
                    deferred.reject(err);
                };
                getAdditionalPropertiesPromise('getKeys').then(function (propKeys) {
                    propertyTypes.castToObject(propKeys);
                    resolved.propKeys = propKeys;
                    return getAdditionalPropertiesPromise('getValues');
                }, errorHandler).then(function (propValues) {
                    resolved.propValues = propValues;
                    deferred.resolve(resolved);
                }, errorHandler);

                return deferred.promise;
            }
        };
    }])