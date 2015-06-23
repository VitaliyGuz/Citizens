﻿angular.module("uploadXlsModule", ['file-model'])
    .controller("uploadXlsController", function ($scope, $http, config) {
        $scope.uploadFile = function () {
            var file = $scope.myFile;
            var uploadUrl = config.baseUrl + "/api/Exchange/Upload";
            var fd = new FormData();
            fd.append("file", file);
            $http.post(uploadUrl, fd, {
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }
            });            
        };
    });