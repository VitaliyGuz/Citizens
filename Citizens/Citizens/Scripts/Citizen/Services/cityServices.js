'use strict';

angular.module("cityServices", ['ngResource']).
    factory("cityData", ['$resource', function ($resource) {
        var urlOdata = '/odata/Cities',
            params = { id: "@id" };
        return $resource('', {},
		{
		    'getAll': { method: 'GET', url: urlOdata + "?$expand=CityType,RegionPart&$orderby=Name asc" },
		    'getById': { method: 'GET', params: params, url: urlOdata + "(:id)?$expand=CityType,RegionPart,CityRegionParts($expand=RegionPart)" },
		    'update': { method: 'PUT', params: params, url: urlOdata + "(:id)" },
		    'save': { method: "POST", url: urlOdata },
		    'remove': { method: 'DELETE', params: params, url: urlOdata + "(:id)" }
		});
    }])
    .factory("cityTypesData", ['$resource', function ($resource) {
        var urlOdata = '/odata/CityTypes',
            params = { id: "@id" };
        return $resource('', {},
		{
		    'query': { method: 'GET', params: params, url: urlOdata + "(:id)" },
		    'update': { method: 'PUT', params: params, url: urlOdata + "(:id)" },
		    'save': { method: "POST", url: urlOdata },
		    'remove': { method: 'DELETE', params: params, url: urlOdata + "(:id)" }
		});
    }])
    .factory("cityRegionPartsData", ['$resource', function ($resource) {
        var urlOdata = '/odata/CityRegionParts',
            expand = '?$expand=RegionPart',
            filterByType = "RegionPart/RegionPartType eq :type",
            filterByCityId = '$filter=CityId eq :cityId',
            key = "(CityId=:cityId,RegionPartId=:regionPartId)";
        return $resource('', {},
		{
		    'getAllByType': { method: 'GET', params: { type: "@type" }, url: urlOdata + expand + "&$filter=" + filterByType },
		    'getAllByCityIdAndType': { method: 'GET', params: { cityId: "@cityId", type: "@type" }, url: urlOdata + expand + "&" + filterByCityId + " and " + filterByType },
		    'getByKey': { method: 'GET', params: { cityId: "@cityId", regionPartId: "@regionPartId" }, url: urlOdata + key + expand },
		    'update': { method: 'PUT', params: { cityId: "@cityId", regionPartId: "@regionPartId" }, url: urlOdata + key },
		    'save': { method: "POST", url: urlOdata },
		    'remove': { method: 'DELETE', params: { cityId: "@cityId", regionPartId: "@regionPartId" }, url: urlOdata + key }
		});
    }])