'use strict';

var authServices = angular.module('authServices', []);

authServices.service('Login', ['$http', 'Credentials', 'config', 'SuccessTokenHandler', function ($http, Credentials, config, SuccessTokenHandler) {
    return function (userName, password, callback) {
        var req = {
            method: 'POST',
            url: config.baseUrl + '/Token',
            data: $.param({ username: userName, password: password, grant_type: 'password' }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        };
        Credentials.clear();
        $http(req).success(function (response) {
            SuccessTokenHandler(response, callback);
        }).error(function (e) {
            callback({ success: false, error: e });
        });
    }
}]);

authServices.service('SuccessTokenHandler', ['GetUserInfo', 'Credentials', function (GetUserInfo, Credentials) {
    return function (response, callback) {
        var token = response.token_type + ' ' + response.access_token;
        GetUserInfo(token).success(function (userInfo) {
            Credentials.set(token, response.expires_in, userInfo);
            if (callback) callback({ success: true });
        }).error(function (e) {
            if (callback) callback({ success: false, error: e });
        });
    }
}]);

authServices.service('GetUserInfo', ['$http', 'config', function ($http, config) {
        return function(accessToken) {
            return $http.get(config.baseUrl + '/api/Account/UserInfo', { headers: { 'Authorization': accessToken } });
        };
    }
]);

authServices.factory('Credentials', ['$rootScope', '$cookies', function ($rootScope, $cookies) {
    return {
        set: function (accessToken, expiresin, userInfo) {
            var expireDate = new Date();
            expireDate.setSeconds(expireDate.getSeconds() + parseInt(expiresin));
            $rootScope.UserInfo = userInfo;
            //$http.defaults.headers.common['Authorization'] = accessToken;
            $cookies.putObject('auth_data', { userInfo: userInfo, accessToken: accessToken, expireDate: expireDate }, { expires: expireDate });    
        },
        get: function() {
            return $cookies.getObject('auth_data');
        },
        clear: function () {
            $rootScope.UserInfo = undefined;
            $cookies.remove('auth_data');
            //$http.defaults.headers.common.Authorization = '';
        }
    };
}]);

authServices.factory('ExternalLogin', ['$http', 'Credentials', 'config', 'SuccessTokenHandler', function ($http, Credentials, config, SuccessTokenHandler) {
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
                    SuccessTokenHandler(response, callback);
                }).error(function(e) {
                    callback({ success: false, error: e });
                });
        }
    }
}]);

authServices.service('Registration', ['$http', 'Credentials', 'config', 'SuccessTokenHandler', function ($http, Credentials, config, SuccessTokenHandler) {
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
            SuccessTokenHandler(response, callback);
        }).error(function (e) {
            callback({ success: false, error: e });
        });
    };

}]);

authServices.factory('authInterceptor', ['$q', '$location', '$rootScope', '$injector', 'Credentials', 'config', 'serviceUtil',function ($q, $location, $rootScope, $injector, Credentials, config, serviceUtil) {

    var refreshingToken = false;

    function checkAuthorization(status) {
        if (status === 401) {
            Credentials.clear();
            var currentUrl = $location.path();
            if (currentUrl) {
                $location.path('/login').search('backUrl', currentUrl);
            } else {
                $location.path('/login');
            }
        }
    };

    return {
        request: function (configReq) {
            configReq.headers = configReq.headers || {};
            var authData = Credentials.get(),
                diff = 0; // difference between dates in sec                
            if (authData && authData.accessToken) {
                if (authData.expireDate) {
                    var currDate = new Date(),
                        expireDate = new Date(authData.expireDate);
                    diff = Math.abs((expireDate.getTime() - currDate.getTime()) / 1000);
                }
                configReq.headers.Authorization = authData.accessToken;
            }
            if (diff <= 30 && !refreshingToken && authData) {
                refreshingToken = true;
                var $http = $injector.get('$http'); // cannot inject $http servise in interceptor provider
                $http.get(config.baseUrl + '/api/Account/RefreshToken').success(function(resp) {
                    refreshingToken = false;
                    Credentials.set(resp.token_type + ' ' + resp.access_token, resp.expires_in, $rootScope.UserInfo);
                }).error(function (e) {
                    refreshingToken = false;
                    e.description = 'Оновлення даних авторизації не відбулося';
                    $rootScope.errorMsg = serviceUtil.getErrorMessage(e);
                });
                //console.info('refresh token');
            }
            return configReq;
        },
        response: function (response) {
            checkAuthorization(response.status);
            return response || $q.when(response);
        },
        responseError: function (rejection) {
            if (rejection && rejection.status) checkAuthorization(rejection.status);
            return $q.reject(rejection);
        }
    };
}]);