'use strict';

angular.module("workAreaServices", ['ngResource', 'precinctServices'])
    .factory("workAreaResource", [
        '$resource', 'config', function($resource, config) {
            var urlOdata = config.baseUrl + '/odata/WorkAreas',
                expand = "?$expand=Precinct,Top",
                paginate = "&$count=true&$skip=:skip&$top=" + config.pageSize,
                params = {};
                params.id = { id: "@id" },
                params.filter = { filter: '@filter' },
                params.paginate = { skip: "@skip", filter: '@filter' };
            return $resource('', {},
            {
                'getAll': { method: 'GET', params: params.filter, url: urlOdata + expand + ":filter", cache: false },
                'getById': { method: 'GET', params: params.id, url: urlOdata + "(:id)" + expand },
                'getPageItems': { method: 'GET', params: params.paginate, url: urlOdata + expand + ":filter" + paginate },
                'update': { method: 'PUT', params: params.id, url: urlOdata + "(:id)" },
                'save': { method: "POST", url: urlOdata },
                'getCountPeopleAtAddresses': { method: 'POST', url: urlOdata + "/CountPeopleAtAddresses" },
                'getCountPeopleAtPrecincts': { method: 'POST', url: urlOdata + "/CountPeopleAtPrecincts" },
                'remove': { method: 'DELETE', params: params.id, url: urlOdata + "(:id)" }
            });
        }
    ])
    .factory('workAreaDataService', ['$q', 'serviceUtil', 'precinctAddressesData','precinctData','workAreaResource',
        function ($q, serviceUtil, precinctAddressesData, precinctData, workAreaResource) {

            function getWorkAreaPromise(routeParam) {
                var deferred = $q.defer();
                if (routeParam) {
                    workAreaResource.getById({ id: routeParam }, function (res) {
                        deferred.resolve(res);
                    }, function(err) {
                        err.description = 'Робочу дільницю не знайдено';
                        deferred.reject(serviceUtil.getErrorMessage(err));
                    });
                } else {
                    deferred.resolve();
                }
                return deferred.promise;
            };
            
            function getPrecinctAddressesPromise(param) {
                var deferred = $q.defer();
                if (param.route) {
                    precinctAddressesData.getAllByPrecinctId({ precinctId: param.id }, function (res) {
                        serviceUtil.sortAddresses(res.value);
                        deferred.resolve(res.value);
                    }, function (err) {
                        err.description = 'Адреси не завантажено';
                        deferred.reject(serviceUtil.getErrorMessage(err));
                    });
                } else {
                    deferred.resolve();
                }
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
                    var resolved = {}, deferred = $q.defer();
                    function errorHandler(err) {
                        deferred.reject(err);
                    };
                    getWorkAreaPromise(routeParam).then(function (workArea) {
                        resolved.workArea = workArea;
                        return getPrecinctAddressesPromise({
                            route:routeParam,
                            id:  workArea ? workArea.PrecinctId : undefined 
                        });
                    }, errorHandler).then(function (precinctAddresses) {
                        resolved.precinctAddresses = precinctAddresses;
                        return getPrecinctsPromise();
                    }, errorHandler).then(function (precincts) {
                        resolved.precincts = precincts;
                        deferred.resolve(resolved);
                    }, errorHandler);

                    return deferred.promise;
                }
            };
        }
    ])