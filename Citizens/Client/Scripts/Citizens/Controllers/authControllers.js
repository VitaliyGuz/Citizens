'use strict';
//todo: add login/logout, register controllers
var authControllers = angular.module('authControllers', ['authServices','ngRoute']);

authControllers.controller('loginController', ['$scope', '$location', 'serviceUtil', 'Login', 'ExternalLogin', function ($scope, $location, serviceUtil, Login, ExternalLogin) {
    //var vm = this;
    //$scope.error = '';
    $scope.loadingData = {};

    function responseHandler(resp) {
        if (resp.success) {
            $scope.loadingData = {};
            if (resp.externalProviderUrl) {
                window.$windowScope = $scope;
                window.open(resp.externalProviderUrl, "Authenticate Account", "location=0,status=0,width=600,height=750");
            } else {
                var backUrl = $location.search().backUrl;
                if (!backUrl) backUrl = '/';
                $location.url(backUrl);
            }
        } else {
            $scope.loadingData = {};
            $scope.error = serviceUtil.getErrorMessage(resp.error);
            if (!$scope.error) $scope.error = 'Authorization failed';
        }
    };

    $scope.login = function (){
        $scope.loadingData.login = true;
        Login($scope.user.name, $scope.user.password, responseHandler);
    };

    $scope.externalLogin = function (providerName) {
        $scope.loadingData.extLogin = true;
        var redirectUri = location.protocol + '//' + location.host + '/Views/AuthComplete.html';
        ExternalLogin.getProviderUrl(redirectUri, providerName, responseHandler);
        $scope.authCompleted = function (fragment) {
            $scope.$apply(function () {
                ExternalLogin.complete(fragment.external_access_token, providerName, responseHandler);
            });
        };
    };
}]);

authControllers.controller('registerController',[function() {}]);