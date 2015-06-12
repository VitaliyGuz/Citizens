'use strict';
//todo: add login/logout, set/clearCredentials functions
var authService = angular.module('authService', []);

authService.service('Login', ['$http', '$rootScope', '$cookieStore', function ($http, $rootScope, $cookieStore) {
    
    function setCredentials(response) {
        $rootScope.loggedIn = true;
        $http.defaults.headers.common['Authorization'] = response.token_type + ' ' + response.access_token;
        $cookieStore.put('access_token', response.token_type + ' ' + response.access_token);
    };

    function clearCredentials() {
        $rootScope.loggedIn = false;
        $cookieStore.remove('access_token');
        $http.defaults.headers.common.Authorization = '';
    };

    return function (userName, password, callback) {
        var req = {
            method: 'POST',
            url: 'http://poltava2015.azurewebsites.net/Token',
            data: $.param({ username: userName, password: password, grant_type: 'password' }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        };
        clearCredentials();
        $http(req).success(function (response) {
            setCredentials(response);
            callback({ success: true });
        }).error(function (e) {
            callback({ success: false, error: e });
        });
    }
}]);