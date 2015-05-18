'use strict';

angular.module("streetTypesServices", ['ngResource', 'appCitizen'])
   .factory("typeStreetData", ['$resource', 'config', function ($resource, config) {
       return $resource(config.baseUrl + '/api/streettypes/:id',
       { id: '@id' },
       {
           update: { method: 'POST', isArray: false }
       });
    }])