'use strict';

angular.module("streetServices", ['ngResource'])
    .factory("streetData", ['$resource', function ($resource) {
        var urlOdata = '/odata/Streets',
            params = { id: "@id" };
        return $resource('', {},
		{
		    'query': { method: 'GET', url: urlOdata + "(:id)?$expand=StreetType&$orderby=Name asc" },
		    'getById': { method: 'GET', params: params, url: urlOdata + "(:id)?$expand=StreetType" },
			'update': {method: 'PUT', params: { id: "@id" }, url: urlOdata + "(:id)"},
			'save': { method: "POST", url: urlOdata },
			'remove': { method: 'DELETE', params: { id: "@id" }, url: urlOdata + "(:id)" }
		});
    }])
    .factory("typeStreetData", ['$resource', 'config',function ($resource, config) {
        var urlOdata = '/odata/StreetTypes';
        return $resource('', {},
		{
		    'query': { method: 'GET', params: { id: "@id" }, url: urlOdata + "(:id)" },
			'update': {method: 'PUT', params: { id: "@id" }, url: urlOdata + "(:id)"},
			'save': { method: "POST", url: urlOdata },
			'remove': { method: 'DELETE', params: { id: "@id" }, url: urlOdata + "(:id)" }
		});
    }])