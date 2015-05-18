'use strict';

angular.module("personServices", ['ngResource'])
   .factory("personData", ['$resource', function ($resource) {
       return $resource('/api/persons/:id',
       { id: '@id' },
       {
           update: { method: 'POST', isArray: false }
       });
   }])
.factory("streetData", ['$resource', function ($resource) {
    return $resource('/api/streets/:id',
   { id: '@id' });
}])