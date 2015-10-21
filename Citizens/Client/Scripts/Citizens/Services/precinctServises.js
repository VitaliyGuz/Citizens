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
    .factory("districtResource", ['$resource', 'config', function ($resource, config) {
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
            'getPrecinctDistrict': { method: 'GET', params: paramKey, url: urlDistrictPrecincts + key + '?$expand=District($expand=DistrictType)' },
            'updatePrecinctDistrict': { method: 'PUT', params: paramKey, url: urlDistrictPrecincts + key },
            'savePrecinctDistrict': { method: "POST", url: urlDistrictPrecincts },
            'removePrecinctDistrict': { method: 'DELETE', params: paramKey, url: urlDistrictPrecincts + key }
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
    .factory('precinctDataService', ['$q', 'precinctResource', 'districtResource', 'userData', 'usersHolder', 'precinctAddressResource',
        function ($q, precinctResource, districtResource, userData, usersHolder, precinctAddressResource) {

            function getUsersByPrecinctId(precinctId) {
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

                    promises.districts = districtResource.query().$promise
                        .then(successHandler, function (err) {
                            err.description = 'Округи не завантажено';
                            return $q.reject(err);
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
                    district: districtResource
                } 
            };
    }])//todo: refactor like userHolder
    .factory('districtsHolder', function () {
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
            update: function(elem) {
                if (index >= 0 && elem) districts[index] = elem;
            },
            add: function(elem) {
                if (districts && elem) districts.push(elem);
            },
            remove: function(elem) {
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
    });