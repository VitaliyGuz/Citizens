'use strict';

angular.module("precinctServices", ['ngResource'])
    .factory("precinctData", ['$resource', 'config', function ($resource, config) {
        var urlOdata = config.baseUrl + '/odata/Precincts',
            baseExpand = "?$expand=City($expand=CityType,RegionPart),Street($expand=StreetType),District,RegionPart",
            addressesExpand = "PrecinctAddresses($expand=City($expand=CityType)),PrecinctAddresses($expand=Street($expand=StreetType))",
            params = { id: "@id" };
        return $resource('', {},
		{
		    'getAll': { method: 'GET', url: urlOdata + baseExpand + "&$orderby=Id asc", cache: true },
		    'getById': { method: 'GET', params: params, url: urlOdata + "(:id)" + baseExpand + "," + addressesExpand },
		    'getByIdNotExpand': { method: 'GET', params: params, url: urlOdata + "(:id)" },
		    'saveAll': { method: 'PATCH', url: urlOdata },
		    'update': { method: 'PUT', params: params, url: urlOdata + "(:id)" },
			'save': { method: "POST", url: urlOdata },
			'remove': { method: 'DELETE', params: params, url: urlOdata + "(:id)" }
		});
    }])
    .factory("districtData", ['$resource', 'config', function ($resource, config) {
        var urlOdata = config.baseUrl + '/odata/Districts',
            params = { id: "@id" };
        return $resource('', {},
        {
            'query': { method: 'GET', params: params, url: urlOdata + "(:id)" },
            'update': { method: 'PUT', params: params, url: urlOdata + "(:id)" },
            'save': { method: "POST", url: urlOdata },
            'remove': { method: 'DELETE', params: params, url: urlOdata + "(:id)" }
        });
    }])
    .factory("precinctAddressesData", ['$resource', 'config', function ($resource, config) {
        var urlOdata = config.baseUrl + '/odata/PrecinctAddresses',
            params = { cityId: "@cityId", streetId: "@streetId", house: "@house" },
            key = "(CityId=:cityId,StreetId=:streetId,House=':house')";
        return $resource('', {},
        {
            'query': { method: 'GET', params: params, url: urlOdata + key + "?$expand=City($expand=CityType,RegionPart),Street($expand=StreetType)" },
            'save': { method: "POST", url: urlOdata },
            'changePrecinct': { method: 'PUT', params: params, url: urlOdata + key },
            'remove': { method: 'DELETE', params: params, url: urlOdata + key }
        });
    }])