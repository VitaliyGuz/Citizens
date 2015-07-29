'use strict';

angular.module("precinctServices", ['ngResource'])
    .factory("precinctData", [
        '$resource', 'config', function($resource, config) {
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
                'getById': { method: 'GET', params: params, url: urlOdata + "(:id)" + baseExpand + "," + addressesExpand + "," + districtsExpand },
                'getByIdNotExpand': { method: 'GET', params: params, url: urlOdata + "(:id)" },
                'getAllNotExpand': { method: 'GET', url: urlOdata + "?$orderby=Number asc", cache: false },
                'getByRegionPartId': { method: 'GET', params: { regionPartId: '@regionPartId' }, url: urlOdata + baseExpand + "&$filter=RegionPartId eq :regionPartId", cache: false },
                'getPageItems': { method: 'GET', params: { skip: "@skip" }, url: urlOdata + baseExpand + paginate + order },
                'getFilteredPageItems': { method: 'GET', params: { skip: "@skip", filter: '@filter' }, url: urlOdata + baseExpand + "&$filter=:filter" + paginate + order },
                'saveAll': { method: 'PATCH', url: urlOdata },
                'update': { method: 'PUT', params: params, url: urlOdata + "(:id)" },
                'save': { method: "POST", url: urlOdata },
                'remove': { method: 'DELETE', params: params, url: urlOdata + "(:id)" }
            });
        }
    ])
    .factory("districtData", [
        '$resource', 'config', function($resource, config) {
            var urlOdata = config.baseUrl + '/odata/Districts',
                urlDistrictTypes = config.baseUrl + '/odata/DistrictTypes',
                urlDistrictPrecincts = config.baseUrl + '/odata/DistrictPrecincts',
                params = { id: "@id" },
                paramKey = { districtId: "@districtId", precinctId: "@precinctId" },
                key = "(DistrictId=:districtId,PrecinctId=:precinctId)";
            return $resource('', {},
            {
                'query': { method: 'GET', params: params, url: urlOdata + "(:id)?$expand=DistrictType", cache: true },
                'getById': { method: 'GET', params: params, url: urlOdata + "(:id)?$expand=DistrictType,DistrictPrecincts($expand=Precinct)" },
                'update': { method: 'PUT', params: params, url: urlOdata + "(:id)" },
                'save': { method: "POST", url: urlOdata },
                'remove': { method: 'DELETE', params: params, url: urlOdata + "(:id)" },
                'getTypes': { method: 'GET', url: urlDistrictTypes, cache: true },
                'getPrecinctDistricts': { method: 'GET', params: paramKey, url: urlDistrictPrecincts + key + '?$expand=District($expand=DistrictType)' },
                'updatePrecinctDistrict': { method: 'PUT', params: paramKey, url: urlDistrictPrecincts + key },
                'savePrecinctDistrict': { method: "POST", url: urlDistrictPrecincts },
                'removePrecinctDistrict': { method: 'DELETE', params: paramKey, url: urlDistrictPrecincts + key }
            });
        }
    ])
    .factory("precinctAddressesData", [
        '$resource', 'config', function($resource, config) {
            var urlOdata = config.baseUrl + '/odata/PrecinctAddresses',
                params = { cityId: "@cityId", streetId: "@streetId", house: "@house" },
                key = "(CityId=:cityId,StreetId=:streetId,House=':house')";
            return $resource('', {},
            {
                'query': { method: 'GET', params: params, url: urlOdata + key + "?$expand=City($expand=CityType,RegionPart),Street($expand=StreetType)" },
                'save': { method: "POST", url: urlOdata },
                'update': { method: 'PUT', params: params, url: urlOdata + key },
                'remove': { method: 'DELETE', params: params, url: urlOdata + key }
            });
        }
    ])
    .factory('dataForEditPrecinctPage', [
        '$q', 'serviceUtil', 'precinctData', 'districtData', 'userData', 'usersHolder', function($q, serviceUtil, precinctData, districtData, userData, usersHolder) {

            function getPrecinctPromise(routeParam) {
                var deferred = $q.defer();
                if (routeParam) {
                    precinctData.getById({ id: routeParam }, function(res) {
                        deferred.resolve(res);
                    }, function(err) {
                        err.description = 'Дільницю не знайдено',
                            deferred.reject(serviceUtil.getErrorMessage(err));
                    });
                } else {
                    deferred.resolve();
                }
                return deferred.promise;
            };

            function getDistrictsPromise() {
                var deferred = $q.defer();
                districtData.query(function(res) {
                    deferred.resolve(res.value);
                }, function(err) {
                    err.description = 'Округи не завантажено',
                        deferred.reject(serviceUtil.getErrorMessage(err));
                });
                return deferred.promise;
            };

            function getUserPrecintcsPromise(precinctId) {
                var deferred = $q.defer();
                usersHolder.asyncLoad().then(function() {
                    if (!precinctId) {
                        deferred.resolve();
                        return deferred.promise;
                    }
                    userData.getUserPrecinctsByPrecinctId({ precinctId: precinctId }, function(res) {
                        function mappedUsers(users) {
                            if (users && users.length > 0) {
                                res.value = res.value.map(function(userPrecinct) {
                                    userPrecinct.User = users.filter(function(user) {
                                        return userPrecinct.UserId === user.Id;
                                    })[0];
                                    return userPrecinct;
                                });
                            }
                            res.value.sort(function(a, b) {
                                return a.User.FirstName.localeCompare(b.User.FirstName);
                            });
                            deferred.resolve(res.value);
                        };

                        mappedUsers(usersHolder.get());
                    }, function(err) {
                        err.description = 'Користувачі, закріплені за дільницею не завантажено';
                        deferred.reject(serviceUtil.getErrorMessage(err));
                    });
                }, function(err) {
                    deferred.reject(serviceUtil.getErrorMessage(err));
                });

                return deferred.promise;
            };

            function getPrecinctsPromise() {
                var deferred = $q.defer();
                precinctData.getAllNotExpand(function(res) {
                    deferred.resolve(res.value);
                }, function(err) {
                    err.description = 'Дільниці не завантажено',
                        deferred.reject(serviceUtil.getErrorMessage(err));
                });
                return deferred.promise;
            };

            return {
                asyncLoad: function(routeParam) {
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
                        districts: getDistrictsPromise(),
                        userPrecincts: getUserPrecintcsPromise(routeParam)
                        //precincts: getPrecinctsPromise() // precincts async loading in controller
                    });
                }
            };
        }
    ]).
    factory('districtsHolder', function() {
        var districts, index;
        return {
            get: function() {
                return districts;
            },
            set: function(data) {
                if (data && angular.isArray(data)) districts = data;
            },
            setEditIndex: function(ind) {
                index = undefined;
                if (ind != undefined && ind >= 0) index = ind;
            },
            updateElem: function(elem) {
                if (index >= 0 && elem) districts[index] = elem;
            },
            addElem: function(elem) {
                if (districts && elem) districts.push(elem);
            },
            removeElem: function(elem) {
                districts.splice(this.indexOf(elem), 1);
            },
            isEmpty: function() {
                return districts ? districts.length <= 0 : true;
            },
            indexOf: function(elem) {
                return elem && districts ? districts.indexOf(elem) : undefined;
            },
            sort: function() {
                if (districts) {
                    districts.sort(function(a, b) {
                        return a.Number - b.Number;
                    });
                }
            }
        }
    })
    .constant("houseTypes", ['Приватний', 'Багатоповерхівка']);