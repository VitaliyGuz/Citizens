'use strict';

var authControllers = angular.module('authControllers', ['authServices','ngRoute']);

authControllers.controller('loginController', ['$scope', '$location', 'Login', 'ExternalLogin', function ($scope, $location, Login, ExternalLogin) {
    
    $scope.loadingData = {};

    function responseHandler(resp) {
        if (resp.success) {
            $scope.loadingData = {};
            if (resp.externalProviderUrl) {
                window.$windowScope = $scope;
                window.open(resp.externalProviderUrl, "Authenticate Account", "location=0,status=0,width=500,height=650");
            } else {
                var backUrl = $location.search().backUrl;
                if (!backUrl) backUrl = '/';
                $location.url(backUrl);
            }
        } else {
            $scope.loadingData = {};
            $scope.error = 'Авторизація не виконана';
            if (resp.error.error_description) {
                $scope.error = $scope.error + ' ('+resp.error.error_description+')';
            }
            if (resp.error.Message) {
                $scope.error = $scope.error + ' (' + resp.error.Message + ')';
            }
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

authControllers.controller('registerController', ['$scope', '$location', 'Registration', 'ExternalLogin', function ($scope, $location, Registration, ExternalLogin) {
    $scope.loadingData = {};

    function responseHandler(resp) {
        if (resp.success) {
             successHandler();
        } else {
            errorHandler(resp.error);
        }
    };

    function successHandler() {
        $scope.loadingData = {};
        var backUrl = $location.search().backUrl;
        if (!backUrl) backUrl = '/';
        $location.url(backUrl);
    };

    function errorHandler(err) {
        $scope.loadingData = {};
        $scope.error = 'Реєстрація не виконана. ';
        if (err) {
            $scope.error = err.Message;
            if (err.Message && err.ModelState) {
                for (var prop in err.ModelState) {
                    if (err.ModelState.hasOwnProperty(prop)) {
                        var arrMsg = err.ModelState[prop];
                        if (arrMsg && angular.isArray(arrMsg)) {
                            arrMsg.forEach(function(item) {
                                $scope.error = $scope.error + ' ' + item;
                            });
                        }
                    }
                }
            }
        }      
    };

    $scope.register = function() {
        $scope.loadingData.reg = true;
        Registration.internal($scope.user.firstName + ' ' + $scope.user.lastName, $scope.user.email, $scope.user.password, $scope.user.confirmPassword, responseHandler);
    };

    $scope.registerExternal = function (providerName) {
        $scope.loadingData.regExt = true;
        var redirectUri = location.protocol + '//' + location.host + '/Views/AuthComplete.html';
        ExternalLogin.getProviderUrl(redirectUri, providerName, function(resp) {
            if (resp.success) {
                window.$windowScope = $scope;
                window.open(resp.externalProviderUrl, "Authenticate Account", "location=0,status=0,width=500,height=650");
            } else {
                errorHandler(resp.error);
            }
        });
        $scope.authCompleted = function (fragment) {
            Registration.external(providerName, responseHandler);
        };
    };
}]);