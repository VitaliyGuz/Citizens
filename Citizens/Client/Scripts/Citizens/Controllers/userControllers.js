'use strict';

var userControllers = angular.module('userControllers', ['userServices']);

userControllers.controller('listUsersController', ['$rootScope', '$location', '$scope', 'config', 'serviceUtil', 'filterSettings', 'userData', 'usersHolder', function ($rootScope, $location, $scope, config, serviceUtil, filterSettings, userData, usersHolder) {
    $rootScope.pageTitle = 'Користувачі';
    $scope.currentPage = serviceUtil.getRouteParam("currPage") || 1;
    $scope.pageSize = config.pageSize;

    $scope.tableHead = ['№', 'П.І.Б.', 'Email','Ролі', 'Дії'];

    $scope.getUsers = usersHolder.get;

    var usersQuery = filterSettings.get('users');
    if (usersQuery) {
        $scope.query = usersQuery;
        $scope.queryBy = Object.keys(usersQuery)[0];
    } else {
        $scope.query = {};
        $scope.queryBy = 'FirstName';
    }

    $scope.onFilterQueryChange = function (isChangeValue) {
        if (isChangeValue) {
            filterSettings.set('users', $scope.query);
        } else {
            $scope.query = {};
            filterSettings.remove('users');
        }
    };

    $scope.getIndex = function (user) {
        return usersHolder.indexOf(user);
    };

    $scope.edit = function (user, ind) {
        usersHolder.setEditIndex(ind);
        $location.path('/user/' + user.Id + '/' + $scope.currentPage);
    };

    $scope.delete = function (user) {
        if (config.checkDeleteItem) {
            var ok = confirm("Увага! Користувача буде видалено, продовжити?");
            if (!ok) return;
        }
        $rootScope.errorMsg = '';
        userData.remove({ id: user.Id },
            function () {
                usersHolder.removeElem(user);
            }, function (e) {
                e.description = 'Користувача не видалено';
                $rootScope.errorMsg = serviceUtil.getErrorMessage(e);
            });
    };

    $scope.onPageChange = function (newPageNumber) {
        $location.path("/users/" + newPageNumber);
    };

    $scope.userRolesToString = function (user) {
        if (!user) return '';
        return user.Roles.map(function(userRole) {
            return userRole.Role.Name;
        }).join(', ');
    };

}]);

userControllers.controller('editUserController', ['$rootScope', '$scope', '$location', '$filter','$q', 'serviceUtil', 'userData', 'config', 'precinctData', 'usersHolder', 'resolvedUser',
    function ($rootScope, $scope, $location, $filter, $q, serviceUtil, userData, config, precinctData, usersHolder, resolvedUser) {
        var selectedItems = {}, deleteItems = {};
        $rootScope.pageTitle = 'Користувач';
        $scope.saving = {};
        $scope.tableHead = ['№', 'Дільниця'];
        $scope.selected = { precinct: undefined };
        $scope.userPrecincts = [];
        $scope.userRoles = [];
        $scope.userLogins = [];
        $scope.load = {};
        //$scope.load.loadingData = true;

        if (resolvedUser) {
            $scope.user = resolvedUser;
            $scope.userPrecincts = resolvedUser.UserPrecincts;
            $scope.userRoles = resolvedUser.Roles;
            $scope.userLogins = resolvedUser.Logins;
        }

        $scope.onEditUserPrecincts = function() {
            selectedItems.precincts = [], deleteItems.precincts = [];
            $scope.load.editingUserPrecincts = true;
            precinctData.getAllNotExpand(function (data) {
                $scope.precincts = data.value.map(function (precinct) {
                    precinct.isUser = $scope.userPrecincts.some(function (userPrecinct) {
                        return precinct.Id === userPrecinct.PrecinctId;
                    });
                    if (precinct.isUser) selectedItems.precincts.push(precinct);
                    return precinct;
                });
                $scope.isEditingUserPrecincts = true;
                $scope.load.editingUserPrecincts = false;
            }, function (err) {
                $scope.load.editingUserPrecincts = false;
                err.description = "Дільниці не завантажено";
                $rootScope.errorMsg = serviceUtil.getErrorMessage(err);
            });
        };

        $scope.onEditUserRoles = function() {
            selectedItems.roles = [], deleteItems.roles = [];
            $scope.load.editingUserRoles = true;
            userData.getRoles(function (roles) {
                $scope.isEditingUserRoles = true;
                $scope.load.editingUserRoles = false;
                $scope.roles = roles.value.map(function(role) {
                    role.isUser = $scope.userRoles.some(function (userRole) {
                        return userRole.RoleId === role.Id;
                    });
                    if (role.isUser) selectedItems.roles.push(role);
                    return role;
                });
            });
        };

        $scope.completeEditingUserPrecincts = function () {
            $scope.load.loadingUserPrecincts = true;
            userData.getUserPrecinctsByUserId({userId:$scope.user.Id},function (data) {
                $scope.isEditingUserPrecincts = false;
                $scope.load.loadingUserPrecincts = false;
                $scope.userPrecincts = data.value;
            },errorHandler);
        };

        $scope.completeEditingUserRoles = function() {
            $scope.load.loadingUserRoles = true;
            usersHolder.asyncLoadById($scope.user.Id).then(function(user) {
                $scope.isEditingUserRoles = false;
                $scope.load.loadingUserRoles = false;
                $scope.userRoles = user.Roles;
            }, errorHandler);
        };

        $scope.saveUser = function () {
            $scope.saving.user = true;
            $rootScope.errorMsg = '';
            var userRaw = {
                "FirstName": null,
                "Email": null,
                "EmailConfirmed": null,
                "PasswordHash": null,
                "SecurityStamp": null,
                "PhoneNumber": null,
                "PhoneNumberConfirmed": null,
                "TwoFactorEnabled": null,
                "LockoutEndDateUtc": null,
                "LockoutEnabled": null,
                "AccessFailedCount": null,
                "Id": null,
                "UserName": null
            }
            serviceUtil.copyProperties($scope.user, userRaw);
            userData.update({ id: $scope.user.Id }, userRaw, function() {
                $scope.saving.user = false;
                usersHolder.updateElem($scope.user);
                usersHolder.sort();
                $rootScope.successMsg = 'Зміни успішно збережено!';
            }, errorHandler);

        };

        $scope.backToList = function () {
            $rootScope.errorMsg = '';
            var currPage = serviceUtil.getRouteParam("currPage") || 1;
            $location.path('/users/' + currPage);
        };

        function errorHandler(e) {
            $scope.saving = {};
            $scope.load = {};
            $rootScope.errorMsg = serviceUtil.getErrorMessage(e);
        };

        $scope.toggleSelection = function (propName, checkedValue) {
            var ind = selectedItems[propName].indexOf(checkedValue),
                indDel = deleteItems[propName].indexOf(checkedValue);
            if (ind < 0) {
                selectedItems[propName].push(checkedValue);
                if (indDel >= 0) deleteItems[propName].splice(indDel, 1);
            } else {
                selectedItems[propName].splice(ind, 1);
                if (checkedValue.isUser) deleteItems[propName].push(checkedValue);
            }
        };

        $scope.saveUserPrecinctChanges = function () {
            $rootScope.errorMsg = '';
            //function syncRemoveUserPrecincts(item) {
            //    if (!item) return;
            //    $scope.saving.userPrecincts = true;
            //    userData.removeUserPrecinct({ userId: $scope.user.Id, precinctId: item.Id }, function () {
            //        $scope.saving.userPrecincts = false;
            //        item.isUser = false;
            //        //deleteItems.precincts.splice(deleteItems.precincts.indexOf(item), 1);
            //        selectedItems.precincts.splice(selectedItems.precincts.indexOf(item), 1);
            //        var nextItem = deleteItems.precincts.pop();
            //        if (nextItem) syncRemoveUserPrecincts(nextItem);
            //    }, errorHandler);
            //};
            //syncRemoveUserPrecincts(deleteItems.precincts.pop());

            function asyncRemoveUserPrecinct(item) {
                var def = $q.defer();
                userData.removeUserPrecinct({ userId: $scope.user.Id, precinctId: item.Id }, function () {
                    item.isUser = false;
                    var ind = selectedItems.precincts.indexOf(item);
                    if (ind >= 0) selectedItems.precincts.splice(ind, 1);
                    def.resolve();
                }, function(err) {
                    errorHandler(err);
                    def.reject();
                });
                return def.promise;
            };

            function waitForDeleting() {
                var promises = [];
                while (deleteItems.precincts.length > 0) {
                    promises.push(asyncRemoveUserPrecinct(deleteItems.precincts.pop()));
                }
                return $q.all(promises);
            };
            
            $scope.saving.userPrecincts = true;
            waitForDeleting().then(function() {
                $scope.saving.userPrecincts = false;
                selectedItems.precincts.forEach(function (item) {
                    if (!item.isUser) {
                        $scope.saving.userPrecincts = true;
                        userData.saveUserPrecinct({ UserId: $scope.user.Id, PrecinctId: item.Id }, function () {
                            $scope.saving.userPrecincts = false;
                            item.isUser = true;
                        }, errorHandler);
                    }
                });
            }, errorHandler);
        };

        $scope.saveUserRolesChanges = function() {
            $rootScope.errorMsg = '';
            function asyncRemoveUserRole(item) {
                var def = $q.defer();
                userData.removeUserRole({ UserId: $scope.user.Id, RoleName: item.Name }, function () {
                    item.isUser = false;
                    var ind = selectedItems.roles.indexOf(item);
                    if (ind >= 0) selectedItems.roles.splice(ind, 1);
                    def.resolve();
                }, function (err) {
                    errorHandler(err);
                    def.reject();
                });
                return def.promise;
            };

            function waitForDeleting() {
                var promises = [];
                while (deleteItems.roles.length > 0) {
                    promises.push(asyncRemoveUserRole(deleteItems.roles.pop()));
                }
                return $q.all(promises);
            };

            $scope.saving.userRoles = true;
            waitForDeleting().then(function() {
                $scope.saving.userRoles = false;
                selectedItems.roles.forEach(function (role) {
                    if (!role.isUser) {
                        $scope.saving.userRoles = true;
                        userData.saveUserRole({ UserId: $scope.user.Id, RoleName: role.Name }, function () {
                            $scope.saving.userRoles = false;
                            role.isUser = true;
                        }, errorHandler);
                    }
                });
            }, errorHandler);
            
        };

        function checkAll(checkedArray, propName) {
            checkedArray.forEach(function (item) {
                var ind = deleteItems[propName].indexOf(item);
                if (ind >= 0) deleteItems[propName].splice(ind, 1);
            });
            selectedItems[propName] = selectedItems[propName].concat(checkedArray.filter(function (item) {
                return selectedItems[propName].indexOf(item) < 0;
            }));
        };

        function uncheckAll(checkedArray, propName) {
            checkedArray.forEach(function (item) {
                if (item.isUser && deleteItems[propName].indexOf(item) < 0) deleteItems[propName].push(item);
                var ind = selectedItems[propName].indexOf(item);
                if (ind >= 0) selectedItems[propName].splice(ind, 1);
            });
        };

        $scope.checkAllUserPrecincts = function () {
            checkAll(getFilteredPrecincts(), 'precincts');
        };

        $scope.checkAllRoles = function () {
            checkAll($scope.roles, 'roles');
        };

        $scope.uncheckAllUserPrecincts = function () {
            uncheckAll(getFilteredPrecincts(), 'precincts');
        };

        $scope.uncheckAllRoles = function() {
            uncheckAll($scope.roles, 'roles');
        };

        function getFilteredPrecincts () {
            return $filter('filter')($scope.precincts, $scope.getFilterExpression(), true);
        };

        $scope.getFilterExpression = function() {
            return { RegionPartId: $scope.selected.regionPartId, isUser: $scope.checkOnlyUserPrecincts() };
        };

        $scope.onSelectPrecinct = function ($item, $model, $label) {
            $scope.selected.precinct = $item;
            $scope.selected.precinctId = $model;
        };

        $scope.onSelectRegionPart = function ($item, $model, $label) {
            $scope.selected.regionPart = $item;
            $scope.selected.regionPartId = $model;
        };

        $scope.markUserPrecinct = function (precinct) {
            if (precinct.isUser) {
                if (deleteItems.precincts.indexOf(precinct) >= 0) return "btn-danger";
                return "btn-success";
            } else {
                if (selectedItems.precincts.indexOf(precinct) >= 0) return "btn-warning";
                return "btn-info";
            }
        };

        $scope.markUserRole = function (role) {
            if (role.isUser) {
                if (deleteItems.roles.indexOf(role) >= 0) return "list-group-item-danger";
                return "list-group-item-success";
            } else {
                if (selectedItems.roles.indexOf(role) >= 0) return "list-group-item-warning";
                return "";
            }
        };

        $scope.checkedItem = function(propName,value) {
            return selectedItems[propName].indexOf(value) >= 0;
        };

        $scope.clearInputRegionPart = function() {
            $scope.selected.regionPart = '';
            $scope.selected.regionPartId = undefined;
        };

        $scope.checkOnlyUserPrecincts = function() {
            if (!$scope.selected.onlyUserPrecincts) {
                return undefined;
            } else {
                return true;
            }
        };
    }]);