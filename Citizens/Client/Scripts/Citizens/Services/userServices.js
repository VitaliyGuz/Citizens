﻿'use strict';

angular.module("userServices", ['ngResource'])
    .factory("userData", ['$resource', 'config', function ($resource, config) {
        return $resource(config.baseUrl + '/api/streets/:id',
       { id: '@id' },
       {
           update: { method: 'POST', isArray: false }
       });
    }])