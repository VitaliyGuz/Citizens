'use strict';
//todo: add login/logout, set/clearCredentials functions
var authServices = angular.module('authServices', []);

authServices.service('Login', ['$http', 'Credentials', 'config', function ($http, Credentials, config) {
    return function (userName, password, callback) {
        var req = {
            method: 'POST',
            url: config.baseUrl + '/Token',
            data: $.param({ username: userName, password: password, grant_type: 'password' }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        };
        Credentials.clear();
        $http(req).success(function (response) {
            Credentials.set(response.token_type + ' ' + response.access_token, callback);
        }).error(function (e) {
            callback({ success: false, error: e });
        });
    }
}]);

authServices.service('GetUserInfo', ['$http', 'config', function ($http, config) {
        return function(accessToken) {
            return $http.get(config.baseUrl + '/api/Account/UserInfo', { headers: { 'Authorization': accessToken } });
        };
    }
]);

authServices.factory('Credentials', ['$rootScope', '$http', '$cookieStore', 'GetUserInfo', function ($rootScope, $http, $cookieStore, GetUserInfo) {
    return {
        set: function (accessToken, callback) {
            GetUserInfo(accessToken).success(function (userInfo) {
                $rootScope.UserInfo = userInfo;
                $http.defaults.headers.common['Authorization'] = accessToken;
                $cookieStore.put('auth_data', { userInfo: userInfo, accessToken: accessToken });
                callback({ success: true });
            }).error(function (e) {
                callback({ success: false, error: e });
            });
        },
        clear: function () {
            $rootScope.UserInfo = undefined;
            $cookieStore.remove('auth_data');
            $http.defaults.headers.common.Authorization = '';
        }
    };
}]);

authServices.factory('ExternalLogin', ['$http', 'Credentials', 'config', function ($http, Credentials, config) {
    return {
        getProviderUrl: function (redirectUri, providerName, callback) {
            $http.get(config.baseUrl + '/api/Account/ExternalLogins?returnUrl=' + redirectUri + '&generateState=true')
                .success(function(providers) {
                    var provider;
                    providers.forEach(function(item) {
                        if (item.Name === providerName) {
                            provider = item;
                            return;
                        }
                    });
                    if (provider && provider.Url) {
                        callback({ success: true, externalProviderUrl: config.baseUrl + provider.Url });
                    }
                }).error(function(e) {
                    callback({ success: false, error: e });
                });
        },
        complete: function (externalAccessToken, providerName, callback) {
            Credentials.clear();
            $http.get(config.baseUrl + '/api/Account/ObtainLocalAccessToken?provider=' + providerName + '&externalAccessToken=' + externalAccessToken)
                .success(function (response) {
                    Credentials.set(response.token_type + ' ' + response.access_token, callback);
                }).error(function(e) {
                    callback({ success: false, error: e });
                });
        }
    }
}]);

authServices.service('Registration', ['$http', 'Login', 'Credentials', 'config', function ($http, Login, Credentials, config) {
    this.internal = function (firstName, email, pass, confirmPass, callback) {
        var req = {
            method: 'POST',
            url: config.baseUrl + '/api/Account/Register',
            data: $.param({ FirstName: firstName, Email: email, Password: pass, ConfirmPassword: confirmPass }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        };
        register(req, callback);
    };

    this.external = function (providerName, callback) {
        //todo: withCredentials=true is temp
        register({ method: 'POST', url: config.baseUrl + '/api/Account/RegisterExternal', withCredentials: true }, callback);
    };

    function register(request, callback) {
        Credentials.clear();
        $http(request).success(function (response) {
            Credentials.set(response.token_type + ' ' + response.access_token, callback);
        }).error(function (e) {
            callback({ success: false, error: e });
        });
    };

}]);