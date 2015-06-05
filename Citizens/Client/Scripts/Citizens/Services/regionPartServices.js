'use strict';

angular.module("regionPartServices", ['ngResource'])
    .factory("regionPartData", ['$resource', 'config', function ($resource, config) {
        var urlOdata = config.baseUrl + '/odata/RegionParts',
            filterByType = "$filter=RegionPartType eq :type";
        return $resource('', {},
		{
		    'query': { method: 'GET', params: { id: "@id" }, url: urlOdata + "(:id)?$expand=Region", cache: true },
		    'getAllByType': { method: 'GET', params: { type: "@type" }, url: urlOdata + "?$expand=Region" + "&" + filterByType },
		    'update': { method: 'PUT', params: { id: "@id" }, url: urlOdata + "(:id)" },
		    'save': { method: "POST", url: urlOdata },
		    'remove': { method: 'DELETE', params: { id: "@id" }, url: urlOdata + "(:id)" }
		});
    }])
    .factory("regionData", ['$resource', 'config', function ($resource, config) {
        var urlOdata = config.baseUrl + '/odata/Regions',
            params = { id: "@id" };
        return $resource('', {},
		{
		    'query': { method: 'GET', params: params, url: urlOdata + "(:id)" },
		    'update': { method: 'PUT', params: params, url: urlOdata + "(:id)" },
		    'save': { method: "POST", url: urlOdata },
		    'remove': { method: 'DELETE', params: params, url: urlOdata + "(:id)" }
		});
    }])
    .constant("regionPartTypes", {
        REGION: { val: "Citizens.Models.RegionPartType'область'", desc: 'область' },
        CITY: { val: "Citizens.Models.RegionPartType'місто'", desc: 'місто' }
        }
    )