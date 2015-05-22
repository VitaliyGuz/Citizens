'use strict';

angular.module("peopleServices", ['ngResource', 'appCitizen']).
    factory("peopleData", ['$resource', 'config', function ($resource, config) {
        var urlOdata = '/odata/People',
            order = '&$orderby=LastName,FirstName,MidleName',
            expand = '?$expand=City($expand=CityType,RegionPart),Street($expand=StreetType),PrecinctAddress',
            paginate = "&$count=true&$skip=:skip&$top=" + config.pageSize;

        return $resource('', {},
		{
		    'getById': { method: 'GET', params: { id: "@id" }, url: urlOdata + "(:id)" + expand + ",PersonAdditionalProperties($expand=PropertyKey,PropertyValue)" },
		    'query': { method: 'GET', params: { id: "@id", skip: "@skip" }, url: urlOdata + expand },
		    'getPageItems': { method: 'GET', params: { skip: "@skip" }, url: urlOdata + expand + paginate + order },
		    'getFilteredPageItems': { method: 'GET', params: { skip: "@skip", filter: '@filter' }, url: urlOdata + expand + "&$filter=:filter"+ paginate + order },
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
            params = { personId: "@personId", propertyKeyId: "@propertyKeyId"};
        return $resource('', {},
		{
		    'getByKey': { method: 'GET', params: params, url: urlOdata + key },
		    'update': { method: 'PUT', params: params, url: urlOdata + key },
		    'save': { method: "POST", url: urlOdata },
		    'remove': { method: 'DELETE', params: params, url: urlOdata + key },
		    'getKey': { method: 'GET', params: { id: "@id" }, url: urlOdataKeys + "(:id)" },
		    'getKeys': { method: 'GET', url: urlOdataKeys },
		    'getValue': { method: 'GET', params: { id: "@id" }, url: urlOdataValues + "(:id)" },
		    'getValues': { method: 'GET', url: urlOdataValues },
		    'updateKey': { method: 'PUT', params: { id: "@id" }, url: urlOdataKeys + "(:id)" },
		    'updateValue': { method: 'PUT', params: { id: "@id" }, url: urlOdataValues + "(:id)" },
		    'saveKey': { method: "POST", url: urlOdataKeys },
		    'saveValue': { method: "POST", url: urlOdataValues },
		    'removeKey': { method: 'DELETE', params: { id: "@id" }, url: urlOdataKeys + "(:id)" },
		    'removeValue': { method: 'DELETE', params: { id: "@id" }, url: urlOdataValues + "(:id)" }
		});
    }])