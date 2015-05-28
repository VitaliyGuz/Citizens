'use strict';

angular.module("peopleServices", ['ngResource', 'appCitizen']).
    factory("peopleData", ['$resource', 'config', function ($resource, config) {
        var urlOdata = '/odata/People',
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
    factory("additionalPropsData", ['$resource', function ($resource) {
        var urlOdata = '/odata/PersonAdditionalProperties',
            urlOdataValues = '/odata/PropertyValues',
            urlOdataKeys = '/odata/PropertyKeys',
            key = "(PersonId=:personId,PropertyKeyId=:propertyKeyId)",
            params = { personId: "@personId", propertyKeyId: "@propertyKeyId" };
        return $resource('', {},
		{
		    'getByKey': { method: 'GET', params: params, url: urlOdata + key },
		    'update': { method: 'PUT', params: params, url: urlOdata + key },
		    'save': { method: "POST", url: urlOdata },
		    'remove': { method: 'DELETE', params: params, url: urlOdata + key },
		    'getKey': { method: 'GET', params: { id: "@id" }, url: urlOdataKeys + "(:id)" },
		    'getKeys': { method: 'GET', url: urlOdataKeys, cache: true },
		    'getValue': { method: 'GET', params: { id: "@id" }, url: urlOdataValues + "(:id)" },
		    'getValuesByKeyId': { method: 'GET', params: { keyId: "@keyId" }, url: urlOdataValues + "?$filter=PropertyKeyId eq :keyId" },
		    'getValues': { method: 'GET', url: urlOdataValues, cache: true },
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