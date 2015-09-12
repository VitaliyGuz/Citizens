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
                'getSupporters': { method: 'GET', params: params.id,url: urlOdata + "(:id)/GetSupporters()?$expand=Major" },
                'getSupportersByAddress': { method: 'GET', params: angular.extend({}, params.id, { cityId: "@cityId", streetId: "@streetId", house: "@house" }), url: urlOdata + "(:id)/GetSupporters()?$filter=CityId eq :cityId and StreetId eq :streetId and House eq ':house'" },
                'getSupportersByMajor': { method: 'GET', params: angular.extend({}, params.id, { majorId: "@majorId" }), url: urlOdata + "(:id)/GetSupporters()?$filter=MajorId eq :majorId" },
                'remove': { method: 'DELETE', params: params.id, url: urlOdata + "(:id)" }
            });
        }
    ])
    .factory('workAreaDataService', ['$q', 'serviceUtil', 'precinctAddressesData', 'precinctData', 'workAreaResource', 'peopleResource',
        function ($q, serviceUtil, precinctAddressesData, precinctData, workAreaResource, peopleResource) {
            return {
                asyncLoad: function(routeParams) {
                    var resolved = {}, deferred = $q.defer();

                    function errorHandler(err) {
                        deferred.reject(err);
                    };

                    if (routeParams.id) {
                        resolved.workArea = workAreaResource.getById({ id: routeParams.id }).$promise;
                        if (routeParams.precinctId) {
                            resolved.precinctAddresses = deferred.promise;
                            precinctAddressesData.getAllByPrecinctId({ precinctId: routeParams.precinctId }, function(resp) {
                                serviceUtil.sortAddresses(resp.value);
                                deferred.resolve(resp.value);
                            }, errorHandler);
                        }
                        if (routeParams.majorId) {
                            resolved.appointedMajor = peopleResource.getById({ id: routeParams.majorId }).$promise;
                        }
                        if (routeParams.topId) {
                            resolved.appointedTop = peopleResource.getById({ id: routeParams.topId }).$promise;
                        }
                    } else {
                        resolved.precincts = deferred.promise;
                        precinctData.getAllNotExpand(function (resp) { deferred.resolve(resp.value) }, errorHandler);
                    }

                    return $q.all(resolved);
                }
            };
        }
    ])