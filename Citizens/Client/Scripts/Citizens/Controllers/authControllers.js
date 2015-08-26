'use strict';

var authControllers = angular.module('authControllers', ['authServices','ngRoute']);

authControllers.controller('loginController', ['$rootScope', '$scope', '$location', 'Login', 'ExternalLogin', 'config', function ($rootScope, $scope, $location, Login, ExternalLogin, config) {
    
    $rootScope.pageTitle = '';
    $scope.loadingData = {};

    function responseHandler(resp) {
        $scope.loadingData = {};
        if (resp.success) {
            //if (resp.externalProviderUrl) {
            //    window.$windowScope = $scope;
            //    var popup = window.open(resp.externalProviderUrl, "Authenticate Account", "location=0,status=0,width=500,height=650");
            //} else {
            var backUrl = $location.search().backUrl || '/';
            $location.url(backUrl);
            //}
        } else {
            if (resp.error && resp.error.data) {
                if (resp.error.status === 403) {
                    $scope.alert.info = resp.error.data + ' (зверніться до адміністратора)';
                } else {
                    $scope.alert.error = 'Авторизація не виконана';
                    if (resp.error.data.error_description) {
                        $scope.alert.error = $scope.alert.error + ' (' + resp.error.data.error_description + ')';
                    }
                    if (resp.error.data.Message) {
                        $scope.alert.error = $scope.alert.error + ' (' + resp.error.data.Message + ')';
                    }
                }
            } else {
                $scope.alert.error = 'Авторизація не виконана';
            }
        }
    };

    $scope.login = function (){
        $scope.loadingData.login = true;
        $scope.alert = {};
        Login($scope.user.name, $scope.user.password, responseHandler);
    };

    $scope.externalLogin = function (providerName) {
        $scope.loadingData.extLogin = true;
        $scope.alert = {};
        var externalProviderUrl = config.getExternalProviderUrl(providerName);
        window.$windowScope = $scope;
        var popup = window.open(externalProviderUrl, "Authenticate Account", "location=0,status=0,width=500,height=650");
        //ExternalLogin.getProviderUrl(redirectUri, providerName, responseHandler);
        $scope.authCompleted = function (fragment) {
            $scope.$apply(function () {
                ExternalLogin.complete(fragment.external_access_token, providerName, responseHandler);
            });
        };
    };
}]);

authControllers.controller('registerController', ['$rootScope', '$scope', '$location', 'Registration', 'config', 'ExternalLogin', function ($rootScope, $scope, $location, Registration, config, ExternalLogin) {
    $scope.loadingData = {};
    $rootScope.pageTitle = '';

    function responseHandler(resp) {
        $scope.loadingData = {};

        if (resp.success) {
            var backUrl = $location.search().backUrl || '/';
            $location.url(backUrl);
        } else {
            if (resp.error && resp.error.data) {
                if (resp.error.status === 403) {
                    $scope.alert.info = 'Реєстрація пройшла успішно! Для надання прав доступу зверніться до адміністратора';
                } else {
                    $scope.alert.error = 'Реєстрація не виконана. ';
                    if (resp.error.data.Message) $scope.alert.error = $scope.alert.error + resp.error.data.Message;
                    if (resp.error.data.ModelState) {
                        Object.keys(resp.error.data.ModelState).forEach(function (prop) {
                            var arrMsg = resp.error.data.ModelState[prop];
                            if (arrMsg && angular.isArray(arrMsg)) {
                                arrMsg.forEach(function (item) {
                                    $scope.alert.error = $scope.alert.error + ' ' + item;
                                });
                            }
                        });
                    }
                }
            } else {
                $scope.alert.error = 'Реєстрація не виконана';
            }
        }
    };

    $scope.register = function() {
        $scope.loadingData.reg = true;
        $scope.alert = {};
        Registration.internal($scope.user.firstName + ' ' + $scope.user.lastName, $scope.user.email, $scope.user.password, $scope.user.confirmPassword, responseHandler);
    };

    $scope.registerExternal = function (providerName) {
        $scope.loadingData.regExt = true;
        $scope.alert = {};
        var externalProviderUrl = config.getExternalProviderUrl(providerName);
        window.$windowScope = $scope;
        var popup = window.open(externalProviderUrl, "Authenticate Account", "location=0,status=0,width=500,height=650");
        //ExternalLogin.getProviderUrl(redirectUri, providerName, function(resp) {
        //    if (resp.success) {
        //        window.$windowScope = $scope;
        //        window.open(resp.externalProviderUrl, "Authenticate Account", "location=0,status=0,width=500,height=650");
        //    } else {
        //        errorHandler(resp.error);
        //    }
        //});
        $scope.authCompleted = function (fragment) {
            Registration.external(providerName, responseHandler);
        };
    };
}]);