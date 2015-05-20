'use strict';

angular.module("peopleServices", ['ngResource', 'appCitizen']).
    factory("peopleData", ['$resource', 'config', function ($resource, config) {
        var urlOdata = '/odata/People',
            order = '&$orderby=LastName,FirstName,MidleName',
            expand = '?$expand=City($expand=CityType,RegionPart),Street($expand=StreetType),PrecinctAddress',
            paginate = "&$count=true&$skip=:skip&$top=" + config.pageSize;

        return $resource('', {},
		{
		    'query': { method: 'GET', params: { id: "@id", skip: "@skip" }, url: urlOdata + "(:id)" + expand },
		    'getPageItems': { method: 'GET', params: { skip: "@skip" }, url: urlOdata + expand + paginate + order },
		    'getFilteredPageItems': { method: 'GET', params: { skip: "@skip", filter: '@filter' }, url: urlOdata + expand + "&$filter=:filter"+ paginate + order },
		    'update': { method: 'PUT', params: { id: "@id" }, url: urlOdata + "(:id)" },
		    'save': { method: "POST", url: urlOdata },
		    'remove': { method: 'DELETE', params: { id: "@id" }, url: urlOdata + "(:id)" }
		});
    }])