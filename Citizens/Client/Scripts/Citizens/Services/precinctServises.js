'use strict';

angular.module("precinctServices", ['ngResource'])
    .factory("precinctResource", ['$resource', 'config', function($resource, config) {
        var urlOdata = config.baseUrl + '/odata/Precincts',
            baseExpand = "?$expand=City($expand=CityType,RegionPart),Street($expand=StreetType),RegionPart,Neighborhood",
            addressesExpand = "PrecinctAddresses($expand=City($expand=CityType)),PrecinctAddresses($expand=Street($expand=StreetType))",
            districtsExpand = 'DistrictPrecincts($expand = District($expand = DistrictType))',
            order = "&$orderby=Number asc",
            paginate = "&$count=true&$skip=:skip&$top=" + config.pageSize,
            params = { id: "@id" };
        return $resource('', {},
        {
            'getAll': { method: 'GET', params: { filter: '@filter' }, url: urlOdata + baseExpand + ":filter" + order, cache: false },
            'getById': { method: 'GET', params: params, url: urlOdata + "(:id)" + baseExpand + "," + districtsExpand },
            'getByIdNotExpand': { method: 'GET', params: params, url: urlOdata + "(:id)" },
            'getAllNotExpand': { method: 'GET', params: { filter: '@filter', top: '@top' }, url: urlOdata + "?$orderby=Number asc :filter :top", cache: false },
            'getByRegionPartId': { method: 'GET', params: { regionPartId: '@regionPartId' }, url: urlOdata + baseExpand + "&$filter=RegionPartId eq :regionPartId", cache: false },
            'getPageItems': { method: 'GET', params: { skip: "@skip",filter: '@filter' }, url: urlOdata + baseExpand + paginate + order +":filter" },
            //'getFilteredPageItems': { method: 'GET', params: { skip: "@skip", filter: '@filter' }, url: urlOdata + baseExpand + "&$filter=:filter" + paginate + order },
            'addAddresses': { method: 'POST', params: params, url: urlOdata + "(:id)/AddAddresses" },
            'update': { method: 'PUT', params: params, url: urlOdata + "(:id)" },
            'save': { method: "POST", url: urlOdata },
            'remove': { method: 'DELETE', params: params, url: urlOdata + "(:id)" }
        });
    }])
    .factory("districtResource", ['$resource', '$cacheFactory', 'config', function ($resource, $cacheFactory, config) {
        var urls = {base: config.baseUrl},
            params = {id: { id: "@id" }},
            key = "(DistrictId=:districtId,PrecinctId=:precinctId)";
        params.key = { districtId: "@districtId", precinctId: "@precinctId" };
        urls.districts = urls.base + '/odata/Districts';
        urls.districtTypes = urls.base + '/odata/DistrictTypes';
        urls.districtPrecincts = urls.base + '/odata/DistrictPrecincts';
        return $resource('', {},
        {
            'query': { method: 'GET', params: params.id, url: urls.districts + "(:id)?$expand=DistrictType", cache: false },// DON'T CACHE! caching already implemented in districts cache
            'getById': { method: 'GET', params: params.id, url: urls.districts + "(:id)?$expand=DistrictType,DistrictPrecincts($expand=Precinct)" },
            'update': { method: 'PUT', params: params.id, url: urls.districts + "(:id)" },
            'save': { method: "POST", url: urls.districts },
            'remove': { method: 'DELETE', params: params.id, url: urls.districts + "(:id)" },
            'getTypes': { method: 'GET', url: urls.districtTypes, cache: true },
            'getPrecinctDistrict': { method: 'GET', params: params.key, url: urls.districtPrecincts + key + '?$expand=District($expand=DistrictType)' },
            'updatePrecinctDistrict': { method: 'PUT', params: params.key, url: urls.districtPrecincts + key },
            'savePrecinctDistrict': { method: "POST", url: urls.districtPrecincts },
            'removePrecinctDistrict': { method: 'DELETE', params: params.key, url: urls.districtPrecincts + key }
        });
    }])
    .factory("precinctAddressResource", ['$resource', 'config', function($resource, config) {
        var urlOdata = config.baseUrl + '/odata/PrecinctAddresses',
            expand = "City($expand=CityType,RegionPart),Street($expand=StreetType)",
            params = { cityId: "@cityId", streetId: "@streetId", house: "@house" },
            key = "(CityId=:cityId,StreetId=:streetId,House=':house')";
        return $resource('', {},
        {
            'query': { method: 'GET', params: params, url: urlOdata + key + "?$expand=" + expand },
            'getAll': { method: 'GET', params: {filter:"@filter"}, url: urlOdata + "?$expand=" + expand +",Precinct" + ":filter" },
            'getAllByPrecinctId': { method: 'GET', params: { precinctId: '@precinctId' }, url: urlOdata + "?$expand=" + expand + "&$filter=PrecinctId eq :precinctId" },
            'save': { method: "POST", url: urlOdata },
            'update': { method: 'PUT', params: params, url: urlOdata + key },
            'remove': { method: 'DELETE', params: params, url: urlOdata + key }
        });
    }])
    .factory('precinctDataService', ['$q', 'precinctResource', 'districtDataService', 'userData', 'usersHolder', 'precinctAddressResource', 'checkPermissions',
        function ($q, precinctResource, districtDataService, userData, usersHolder, precinctAddressResource, checkPermissions) {

            function getUsersByPrecinctId(precinctId) {
                var permit = checkPermissions(['SuperAdministrators', 'Administrators']);
                if (!permit) return [];
                return usersHolder.asyncLoad().then(function () {
                    return userData.getUserPrecinctsByPrecinctId({ precinctId: precinctId }).$promise.then(function (res) {
                        if (!usersHolder.isEmpty()) {
                            var users = usersHolder.get();
                            res.value = res.value.map(function (userPrecinct) {
                                userPrecinct.User = users.filter(function (user) {
                                    return userPrecinct.UserId === user.Id;
                                })[0];
                                return userPrecinct;
                            });
                        }
                        res.value.sort(function (a, b) {
                            return a.User.FirstName.localeCompare(b.User.FirstName);
                        });
                        return res.value;
                    }, function (err) {
                        err.description = 'Користувачі, закріплені за дільницею не завантажено';
                        return $q.reject(err);
                    });
                }, function (err) {
                    err.description = 'Користувачі не завантажено';
                    return $q.reject(err);
                });
            };

            return {
                asyncLoadData: function(routeParam) {
                    var promises = {
                        districts: [],
                        precinctAddresses: [],
                        userPrecincts: []
                    };

                    var successHandler = function (data) {
                        return data.value;
                    };

                    promises.districts = districtDataService.asyncCacheAll().then(function () {
                        return districtDataService.cache.get();
                    });

                    if (routeParam) {
                        promises.precinct = precinctResource.getById({ id: routeParam }).$promise
                            .catch(function (err) {
                                err.description = 'Дільницю не знайдено';
                                return $q.reject(err);
                            });

                        promises.precinctAddresses = precinctAddressResource.getAllByPrecinctId({ precinctId: routeParam }).$promise
                            .then(successHandler, function (err) {
                                err.description = 'Адреси дільниці не завантажено';
                                return $q.reject(err);
                            });

                        promises.userPrecincts = getUsersByPrecinctId(routeParam);
                    }
                    return $q.all(promises);
                },

                asyncGetUsersByPrecinct: getUsersByPrecinctId,
                
                typeaheadPrecinctByNumber: function(viewValue) {
                    var odataFilter = "&$filter=startswith(cast(Number,Edm.String),'value') eq true".replace(/value/, viewValue);
                    return precinctResource.getAllNotExpand({ filter: odataFilter, top: '&$top=10' }).$promise.then(function (data) {
                        return data.value;
                    });
                },

                houseTypes:['Приватний', 'Багатоповерхівка'],

                resources: {
                    precinct: precinctResource,
                    address: precinctAddressResource,
                    district: districtDataService.resource
                } 
            };
    }])
    .factory('districtDataService', ['$q','Cache', 'districtResource', function ($q, Cache, districtResource) {
        var cache = new Cache();
        cache.compareFn = function (a, b) {
            return a.Number - b.Number;
        };
        return {
            asyncCacheAll: function() {
                if (!cache.isEmpty()) return $q.when();
                return districtResource.query().$promise.then(function (data) {
                    cache.set(data.value);
                    cache.sort();
                }, function(e) {
                    e.description = 'Округи не завантажено';
                    return $q.reject(e);
                });
            },
            cache: cache,
            resource: districtResource
        };
    }]);