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
                'getSupportersByAddress': { method: 'GET', params: angular.extend({}, params.id, { cityId: "@cityId", streetId: "@streetId", house: "@house" }), url: urlOdata + "(:id)/GetSupporters()?$filter=CityId eq :cityId and StreetId eq :streetId and House eq ':house'" },
                'getSupportersByMajor': { method: 'GET', params: angular.extend({}, params.id, { majorId: "@majorId" }), url: urlOdata + "(:id)/GetSupporters()?$filter=MajorId eq :majorId" },
                'remove': { method: 'DELETE', params: params.id, url: urlOdata + "(:id)" }
            });
        }
    ])
    .factory('workAreaDataService', ['$q', 'serviceUtil', 'precinctAddressResource', 'workAreaResource', 'peopleResource',
        function ($q, serviceUtil, precinctAddressResource, workAreaResource, peopleResource) {
            return {
                asyncLoad: function(routeParams) {
                    var promises = {};

                    if (routeParams.id) {
                        promises.workArea = workAreaResource.getById({ id: routeParams.id }).$promise;
                        if (routeParams.precinctId) {
                            promises.precinctAddresses = precinctAddressResource.getAllByPrecinctId({ precinctId: routeParams.precinctId }).$promise
                                .then(function (data) {
                                    serviceUtil.sortAddresses(data.value);
                                    return data.value;
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
                }
            };
        }
    ])