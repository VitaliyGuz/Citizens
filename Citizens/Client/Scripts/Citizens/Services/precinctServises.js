'use strict';

angular.module("precinctServices", ['ngResource'])
    .factory("precinctData", ['$resource', 'config', function ($resource, config) {
        var urlOdata = config.baseUrl + '/odata/Precincts',
            baseExpand = "?$expand=City($expand=CityType,RegionPart),Street($expand=StreetType),RegionPart",
            addressesExpand = "PrecinctAddresses($expand=City($expand=CityType)),PrecinctAddresses($expand=Street($expand=StreetType))",
            districtsExpand = 'DistrictPrecincts($expand = District($expand = DistrictType))',
            order = "&$orderby=Id asc",
            paginate = "&$count=true&$skip=:skip&$top=" + config.pageSize,
            params = { id: "@id" };
        return $resource('', {},
		{
		    'getAll': { method: 'GET', url: urlOdata + baseExpand + order, cache: false },
		    'getById': { method: 'GET', params: params, url: urlOdata + "(:id)" + baseExpand + "," + addressesExpand + "," + districtsExpand },
		    'getByIdNotExpand': { method: 'GET', params: params, url: urlOdata + "(:id)" },
		    'getAllNotExpand': { method: 'GET', url: urlOdata + "?$orderby=Id asc", cache: false },
		    'getPageItems': { method: 'GET', params: { skip: "@skip" }, url: urlOdata + baseExpand + paginate + order },
		    'getFilteredPageItems': { method: 'GET', params: { skip: "@skip", filter: '@filter' }, url: urlOdata + baseExpand + "&$filter=:filter" + paginate + order },
		    'saveAll': { method: 'PATCH', url: urlOdata },
		    'update': { method: 'PUT', params: params, url: urlOdata + "(:id)" },
			'save': { method: "POST", url: urlOdata },
			'remove': { method: 'DELETE', params: params, url: urlOdata + "(:id)" }
		});
    }])
    .factory("districtData", ['$resource', 'config', function ($resource, config) {
        var urlOdata = config.baseUrl + '/odata/Districts',
            urlDistrictTypes = config.baseUrl + '/odata/DistrictTypes',
            urlDistrictPrecincts = config.baseUrl + '/odata/DistrictPrecincts',
            params = { id: "@id" },
            paramKey = { districtId: "@districtId", precinctId: "@precinctId"},
            key = "(DistrictId=:districtId,PrecinctId=:precinctId)";
        return $resource('', {},
        {
            'query': { method: 'GET', params: params, url: urlOdata + "(:id)?$expand=DistrictType", cache: true },
            'update': { method: 'PUT', params: params, url: urlOdata + "(:id)" },
            'save': { method: "POST", url: urlOdata },
            'remove': { method: 'DELETE', params: params, url: urlOdata + "(:id)" },
            'getTypes': { method: 'GET', url: urlDistrictTypes, cache: true },
            'getPrecinctDistricts': { method: 'GET', params: paramKey, url: urlDistrictPrecincts + key + '?$expand=District($expand=DistrictType)' },
            'updatePrecinctDistrict': { method: 'PUT', params: paramKey, url: urlDistrictPrecincts + key },
            'savePrecinctDistrict': { method: "POST", url: urlDistrictPrecincts },
            'removePrecinctDistrict': { method: 'DELETE', params: paramKey, url: urlDistrictPrecincts + key }
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
    .factory('dataForEditPrecinctPage', ['$q', 'serviceUtil', 'precinctData', 'districtData', function ($q, serviceUtil, precinctData, districtData) {

        function getPrecinctPromise(routeParam) {
            var deferred = $q.defer();
            if (routeParam) {
                precinctData.getById({ id: routeParam }, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    var errMsg = 'Дільницю не знайдено',
                        errDetail = serviceUtil.getErrorMessage(err);
                    if (errDetail) errMsg = errMsg + ' (' + errDetail + ')';
                    deferred.reject(errMsg);
                });
            } else {
                deferred.resolve();
            }
            return deferred.promise;
        };

        function getDistrictsPromise() {
            var deferred = $q.defer();
            districtData.query(function (res) {
                deferred.resolve(res.value);
            }, function (err) {
                var errMsg = 'Округи не завантажено',
                    errDetail = serviceUtil.getErrorMessage(err);
                if (errDetail) errMsg = errMsg + ' (' + errDetail + ')';
                deferred.reject(errMsg);
            });
            return deferred.promise;
        };

        function getPrecinctsPromise() {
            var deferred = $q.defer();
            precinctData.getAllNotExpand(function (res) {
                deferred.resolve(res.value);
            }, function (err) {
                var errMsg = 'Дільниці не завантажено',
                    errDetail = serviceUtil.getErrorMessage(err);
                if (errDetail) errMsg = errMsg + ' (' + errDetail + ')';
                deferred.reject(errMsg);
            });
            return deferred.promise;
        };

        return {
            asyncLoad: function (routeParam) {
                //var resolved = {}, deferred = $q.defer();
                //function errorHandler(err) {
                //    deferred.reject(err);
                //};
                //getPrecinctPromise(routeParam).then(function (precinct) {
                //    resolved.precinct = precinct;
                //    return getDistrictsPromise();
                //}, errorHandler).then(function (districts) {
                //    resolved.districts = districts;
                //    return getPrecinctsPromise();
                //}, errorHandler).then(function (precincts) {
                //    resolved.precincts = precincts;
                //    deferred.resolve(resolved);
                //}, errorHandler);

                //return deferred.promise;
                return $q.all({
                    precinct: getPrecinctPromise(routeParam),
                    districts: getDistrictsPromise()
                    //precincts: getPrecinctsPromise() // precincts async loading in controller
                });
            }
        };
    }])
    .service('asyncLoadPrecincts', ['$q', 'precinctData', 'serviceUtil', function ($q, precinctData, serviceUtil) {
        function getPrecinctsPromise() {
            var deferred = $q.defer();
            precinctData.getAll(function (res) {
                deferred.resolve(res.value);
            }, function (err) {
                var errMsg = 'Дільниці не завантажено',
                    errDetail = serviceUtil.getErrorMessage(err);
                if (errDetail) errMsg = errMsg + ' (' + errDetail + ')';
                deferred.reject(errMsg);
            });
            return deferred.promise;
        };

        return function () {
            var deferred = $q.defer();
            function errorHandler(err) {
                deferred.reject(err);
            };
            getPrecinctsPromise().then(function (precincts) {
                deferred.resolve(precincts);
            }, errorHandler);

            return deferred.promise;
        };
    }])