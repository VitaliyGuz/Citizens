'use strict';
//todo: add login/logout, register controllers
var authControllers = angular.module('authControllers', ['authService','ngRoute']);

authControllers.controller('loginController', ['$location', 'serviceUtil', 'Login', function ($location, serviceUtil, Login) {
    var vm = this;
    vm.login = function (){
        vm.dataLoading = true;
        Login(vm.userName, vm.password, function(resp) {
            if (resp.success) {
                vm.dataLoading = false;
                var backUrl = $location.search().backUrl;
                if (!backUrl) backUrl = '/';
                $location.url(backUrl);
            } else {
                vm.dataLoading = false;
                vm.error = serviceUtil.getErrorMessage(resp.error);
                if (!vm.error) vm.error = 'Authorization failed';
            }
        });
    };
}]);