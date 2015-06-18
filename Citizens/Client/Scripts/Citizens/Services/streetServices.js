'use strict';

angular.module("streetServices", ['ngResource'])
    .factory("streetData", ['$resource', 'config', function ($resource, config) {
        var urlOdata = config.baseUrl + '/odata/Streets',
            params = { id: "@id" };
        return $resource('', {},
		{
		    'query': { method: 'GET', url: urlOdata + "(:id)?$expand=StreetType&$orderby=Name asc", cache: false },
		    'getById': { method: 'GET', params: params, url: urlOdata + "(:id)?$expand=StreetType" },
			'update': {method: 'PUT', params: { id: "@id" }, url: urlOdata + "(:id)"},
			'save': { method: "POST", url: urlOdata },
			'remove': { method: 'DELETE', params: { id: "@id" }, url: urlOdata + "(:id)" }
		});
    }])
    .factory("typeStreetData", ['$resource', 'config', function ($resource, config) {
        var urlOdata = config.baseUrl + '/odata/StreetTypes';
        return $resource('', {},
		{
		    'query': { method: 'GET', params: { id: "@id" }, url: urlOdata + "(:id)", cache: true },
			'update': {method: 'PUT', params: { id: "@id" }, url: urlOdata + "(:id)"},
			'save': { method: "POST", url: urlOdata },
			'remove': { method: 'DELETE', params: { id: "@id" }, url: urlOdata + "(:id)" }
		});
    }])