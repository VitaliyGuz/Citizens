'use strict';

angular.module("neighborhoodServices", ['ngResource'])
    .factory("neighborhoodData", ['$resource', 'config', function ($resource, config) {
        var urlOdata = config.baseUrl + '/odata/Neighborhoods';
        return $resource('', {},
		{
		    'getAll': { method: 'GET', url: urlOdata + "?$orderby=Name asc", cache: true },
		    'getById': { method: 'GET', params: { id: "@id" }, url: urlOdata + "(:id)" },
		    'update': { method: 'PUT', params: { id: "@id" }, url: urlOdata + "(:id)" },
		    'save': { method: "POST", url: urlOdata },
		    'remove': { method: 'DELETE', params: { id: "@id" }, url: urlOdata + "(:id)" }
		});
    }])