'use strict';

angular.module("workAreaServices", ['ngResource', 'precinctServices', 'peopleServices'])
    .factory("workAreaResource", [
        '$resource', 'config', function($resource, config) {
            var urlOdata = config.baseUrl + '/odata/WorkAreas',
                expand = "?$expand=Precinct($expand=RegionPart),Top",
                paginate = "&$count=true&$skip=:skip&$top=" + config.pageSize,
                params = {};
                params.id = { id: "@id" },
                params.filter = { filter: '@filter' },
                params.skip = { skip: "@skip"};
            return $resource('', {},
            {
                'getAll': { method: 'GET', params: params.filter, url: urlOdata + expand + "&$orderby=PrecinctId,Number" + ":filter", cache: false },
                'getById': { method: 'GET', params: params.id, url: urlOdata + "(:id)" + expand },
                'getPageItems': { method: 'GET', params: angular.extend({}, params.skip, params.filter), url: urlOdata + expand + "&$orderby=PrecinctId,Number" + ":filter" + paginate },
                'update': { method: 'PUT', params: params.id, url: urlOdata + "(:id)" },
                'save': { method: "POST", url: urlOdata },
                'getCountPeopleByPrecinct': { method: 'GET', params: {precinctId: "@precinctId" }, url: urlOdata + "/GetCountPeopleByPrecinct(PrecinctId=:precinctId)" },
                'caclComputedProperties': { method: 'POST', url: urlOdata + "/CaclComputedProperties" },
                'getMajors': { method: 'GET', params: params.id, url: urlOdata + "(:id)/GetMajors()" },
                'getSupporters': { method: 'GET', params: angular.extend({}, params.id, params.filter, { expand: "@expand" }),url: urlOdata + "(:id)/GetSupporters()?:expand:filter" },
                'remove': { method: 'DELETE', params: params.id, url: urlOdata + "(:id)" }
            });
        }
    ])
    .factory('workAreaDataService', ['$q', 'serviceUtil', 'precinctDataService', 'workAreaResource', 'peopleResource',
        function ($q, serviceUtil, precinctDataService, workAreaResource, peopleResource) {

            function getPrecinctAddresses(precinctId) {
                return $q.all({
                    addresses: precinctDataService.asyncGetPrecinctAddresses(precinctId),
                    countPeople: workAreaResource.getCountPeopleByPrecinct({ "precinctId": precinctId }).$promise
                        .catch(function (e) {
                            e.description = 'Підрахунок кількості фізосіб не виконано';
                            return $q.reject(e);
                        })
                }).then(function (data) {
                    data.addresses.forEach(function (a) {
                        var found = data.countPeople.value.filter(function (c) {
                            return serviceUtil.equalsAddresses(a,c);
                        })[0];
                        a.countPeople = found ? found.CountPeople : 0;
                    });
                    return data.addresses;
                });
            };

            function reduceToAddresses(people) {
                if (!people) return [];
                var addresses = people.reduce(function (result, curr) {
                    var address = {
                        CityId: curr.CityId,
                        StreetId: curr.StreetId,
                        House: curr.House,
                        Apartment: curr.Apartment,
                        ApartmentStr: curr.ApartmentStr,
                        Major: curr.Major
                    };
                    var isContains = result.some(function (i) { return serviceUtil.equalsAddresses(address, i) });
                    if (!isContains) result.push(address);
                    return result;
                }, []);
                addresses.forEach(function (adr) {
                    if (!adr.Apartment) adr.Apartment = 0;
                    adr.houseOrig = adr.House;
                    adr.houseExceptBuilding = serviceUtil.getHouseExceptBuilding(adr.House);
                    adr.HouseBuilding = adr.House.replace(adr.houseExceptBuilding, '').replace(/\s[к|К]\./, '').replace(/\,/, '').replace(/\s/g, '').trim();
                    serviceUtil.parseHouseNumber(adr);
                    serviceUtil.expandAddress(adr);
                });
                serviceUtil.sortAddresses(addresses);
                return addresses;
            };

            return {
                asyncLoad: function(routeParams) {
                    var promises = {
                        precinctAddresses: [],
                        majors: [],
                        supporters: []
                    };

                    if (routeParams.id) {
                        promises.workArea = workAreaResource.getById({ id: routeParams.id }).$promise;
                        var tab = routeParams.tab || 'addresses';
                        if (tab === 'addresses') {
                            promises.precinctAddresses = getPrecinctAddresses(routeParams.precinctId);
                        }
                        if (tab === 'majors') {
                            promises.majors = workAreaResource.getMajors({ "id": routeParams.id }).$promise
                                .then(function (resp) {
                                    return resp.value;
                                });
                        }
                        if (tab === 'editMajors') {
                            promises.supporters = workAreaResource.getSupporters({ id: routeParams.id, expand: "$expand=Major" }).$promise
                                .then(function(resp) {
                                    return resp.value;
                                });
                        }
                        if (routeParams.majorId) {
                            promises.appointedMajor = peopleResource.getById({ id: routeParams.majorId }).$promise;
                        }
                        if (routeParams.topId) {
                            promises.appointedTop = peopleResource.getById({ id: routeParams.topId }).$promise;
                        }
                    }

                    return $q.all(promises);
                },

                asyncGetPrecinctAddresses: getPrecinctAddresses,

                reduceToAddresses: reduceToAddresses,

                resource: workAreaResource
            };
        }
    ])