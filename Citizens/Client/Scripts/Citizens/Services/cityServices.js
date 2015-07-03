'use strict';

angular.module("cityServices", ['ngResource', 'regionPartServices']).
    factory("cityData", ['$resource', 'config', function ($resource, config) {
        var urlOdata = config.baseUrl + '/odata/Cities',
            params = { id: "@id" };
        return $resource('', {},
		{
		    'getAll': { method: 'GET', url: urlOdata + "?$expand=CityType,RegionPart&$orderby=CityTypeId,Name asc", cache: false },
		    'getById': { method: 'GET', params: params, url: urlOdata + "(:id)?$expand=CityType,RegionPart,CityRegionParts($expand=RegionPart)" },
		    'update': { method: 'PUT', params: params, url: urlOdata + "(:id)" },
		    'save': { method: "POST", url: urlOdata },
		    'remove': { method: 'DELETE', params: params, url: urlOdata + "(:id)" }
		});
    }])
    .factory("cityTypesData", ['$resource', 'config', function ($resource, config) {
        var urlOdata = config.baseUrl + '/odata/CityTypes',
            params = { id: "@id" };
        return $resource('', {},
		{
		    'query': { method: 'GET', params: params, url: urlOdata + "(:id)", cache: true },
		    'update': { method: 'PUT', params: params, url: urlOdata + "(:id)" },
		    'save': { method: "POST", url: urlOdata },
		    'remove': { method: 'DELETE', params: params, url: urlOdata + "(:id)" }
		});
    }])
    .factory("cityRegionPartsData", ['$resource', 'config', function ($resource, config) {
        var urlOdata = config.baseUrl + '/odata/CityRegionParts',
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
    .factory("dataForEditCityPage", ['$q', 'cityData', 'cityTypesData', 'regionPartData', 'regionPartTypes', 'serviceUtil',
        function ($q, cityData, cityTypesData, regionPartData, regionPartTypes, serviceUtil) {
        
        function getCityPromise(routeParam) {
            var deferred = $q.defer();
            if (routeParam) {
                cityData.getById({ id: routeParam }, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    err.description = 'Населений пункт не знайдено';
                    deferred.reject(serviceUtil.getErrorMessage(err));
                });
            } else {
                deferred.resolve();
            }
            return deferred.promise;
        };

        function getCityTypesPromise() {
            var deferred = $q.defer();
            cityTypesData.query(function (res) {
                deferred.resolve(res.value);
            }, function (err) {
                err.description = 'Типи населених пунктів не завантажено';
                deferred.reject(serviceUtil.getErrorMessage(err));
            });
            return deferred.promise;
        };

        function getRegionPartByTypePromise(type) {
            var deferred = $q.defer();
            regionPartData.getAllByType({ type: type.val }, function (res) {
                deferred.resolve(res.value);
            }, function (err) {
                err.description = "Райони з типом '" + type.desc + "' не завантажено";
                deferred.reject(serviceUtil.getErrorMessage(err));
            });
            return deferred.promise;
        };

        return {
            asyncLoad: function (routeParam) {
                // v.1: resolve without chain promises
                //return $q.all({
                //    city: getCityPromise(routeParam),
                //    cityTypes: getCityTypesPromise(),
                //    regionParts: getRegionPartByTypePromise(regionPartTypes.REGION),
                //    cityRegionParts: getRegionPartByTypePromise(regionPartTypes.CITY)
                //});

                // v.2: resolve with chain promises
                var resolved = {}, deferred = $q.defer();
                function errorHandler(err) {
                    deferred.reject(err);
                };
                getRegionPartByTypePromise(regionPartTypes.REGION).then(function(regionParts) {
                    resolved.regionParts = regionParts;
                    return getRegionPartByTypePromise(regionPartTypes.CITY);
                }, errorHandler).then(function (cityRegionParts) {
                    resolved.cityRegionParts = cityRegionParts;
                    return getCityTypesPromise();
                },errorHandler).then(function (cityTypes) {
                    resolved.cityTypes = cityTypes;
                    return getCityPromise(routeParam);
                }, errorHandler).then(function (city) {
                    resolved.city = city;
                    deferred.resolve(resolved);// deferred.resolve must be in last iteration
                }, errorHandler);
                return deferred.promise;
            }
        };
    }]);