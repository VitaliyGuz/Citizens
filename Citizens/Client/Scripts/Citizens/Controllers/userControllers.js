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
                usersHolder.remove(user);
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

userControllers.controller('editUserController', ['$rootScope', '$scope', '$location', '$filter', '$q', 'serviceUtil', 'userData', 'config', 'precinctData', 'usersHolder', 'resolvedUser', 'regionPartTypes',
    function ($rootScope, $scope, $location, $filter, $q, serviceUtil, userData, config, precinctData, usersHolder, resolvedUser) {
        var selectedItems = {}, deleteItems = {};
        $rootScope.pageTitle = 'Користувач';
        $scope.tableHead = ['№', 'Дільниця'];
        $scope.selected = {};

        $scope.saving = {};
        $scope.load = {};

        $scope.user = {};
        $scope.user.precincts = [];
        $scope.user.regionParts = [];
        $scope.user.regions = [];
        $scope.user.roles = [];
        $scope.user.logins = [];

        if (resolvedUser) {
            $scope.user = resolvedUser;
            $scope.user.precincts = resolvedUser.UserPrecincts;
            $scope.user.regionParts = resolvedUser.UserRegionParts;
            $scope.user.regions = resolvedUser.UserRegions;
            $scope.user.roles = resolvedUser.Roles;
            $scope.user.logins = resolvedUser.Logins;
        }

        $scope.onEditUserPrecincts = function() {
            selectedItems.precincts = [], deleteItems.precincts = [];
            $scope.load.editingUserPrecincts = true;
            precinctData.getAllNotExpand(function (data) {
                $scope.precincts = data.value.map(function (precinct) {
                    precinct.isUser = $scope.user.precincts.some(function (userPrecinct) {
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
            var ROLE_NAME_SUPERADMINISTRATORS = 'SuperAdministrators'.toLowerCase();
            userData.getRoles(function (roles) {
                $scope.isEditingUserRoles = true;
                $scope.load.editingUserRoles = false;
                var isSuperAdmin = $rootScope.UserInfo.roles.some(function (role) {
                    return role.Name.toLowerCase() === ROLE_NAME_SUPERADMINISTRATORS;
                });

                if (isSuperAdmin) {
                    $scope.roles = roles.value;
                } else {
                    $scope.roles = roles.value.filter(function(role) {
                        return role.Name.toLowerCase() !== ROLE_NAME_SUPERADMINISTRATORS;
                    });
                }
                
                $scope.roles = $scope.roles.map(function (role) {
                    role.isUser = $scope.user.roles.some(function (userRole) {
                        return userRole.RoleId === role.Id;
                    });
                    if (role.isUser) selectedItems.roles.push(role);
                    return role;
                });
            });
        };

        $scope.onEditUserRegionParts = function () {
            selectedItems.regionParts = [], deleteItems.regionParts = [];
            $scope.isEditingUserRegionParts = true;
            //$scope.load.editingUserRegionParts = true;
            $scope.regionPartsCopy = angular.copy($rootScope.regionParts).map(function (regionPart) {
                regionPart.isUser = $scope.user.regionParts.some(function (userRegionPart) {
                    return userRegionPart.RegionPartId === regionPart.Id;
                });
                if (regionPart.isUser) selectedItems.regionParts.push(regionPart);
                return regionPart;
            });          
        };

        $scope.completeEditingUserPrecincts = function () {
            $scope.load.loadingUserPrecincts = true;
            getUserPrecincts(function(data) {
                $scope.isEditingUserPrecincts = false;
                $scope.load.loadingUserPrecincts = false;
                $scope.user.precincts = data;
                $scope.precincts = null; 
            });
        };

        $scope.completeEditingUserRoles = function() {
            $scope.load.loadingUserRoles = true;
            getUserRoles(function(data) {
                $scope.isEditingUserRoles = false;
                $scope.load.loadingUserRoles = false;
                $scope.user.roles = data;
                $scope.roles = null;
            });
        };

        $scope.completeEditingUserRegionParts = function () {
            $scope.load.loadingUserRegionParts = true;
            getUserRegionParts(function(data) {
                $scope.isEditingUserRegionParts = false;
                $scope.load.loadingUserRegionParts = false;
                $scope.user.regionParts = data;
                $scope.regionPartsCopy = null;
            });
        };

        function getUserRegionParts(successCallback) {
            userData.getUserRegionPartsByUserId({ userId: $scope.user.Id }, function (data) {
                successCallback(data.value);
            }, errorHandler);
        };

        function getUserPrecincts(successCallback) {
            userData.getUserPrecinctsByUserId({ userId: $scope.user.Id }, function (data) {
                successCallback(data.value);
            }, errorHandler);
        };

        function getUserRoles(successCallback) {
            usersHolder.asyncGetUserRoles($scope.user.Id).then(function (userRoles) {
                successCallback(userRoles);
            }, errorHandler);
        };

        $scope.saveUser = function () {
            $scope.saving.user = true;
            $rootScope.errorMsg = '';
            // todo: model factory
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
                usersHolder.update($scope.user);
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

        function removeRangeAsync(arrName, method, rawScheme) {

            var promises = [];

            function asyncRemove(item) {
                var def = $q.defer(), raw = {};
                raw[rawScheme.firstProp] = $scope.user.Id;
                raw[rawScheme.secondProp] = item[rawScheme.itemProp];
                userData[method](raw, function () {
                    item.isUser = false;
                    //var ind = selectedItems[arrName].indexOf(item);
                    //if (ind >= 0) selectedItems[arrName].splice(ind, 1);
                    def.resolve();
                }, function (err) { def.reject(err) });
                return def.promise;
            };
            
            while (deleteItems[arrName].length > 0) {
                promises.push(asyncRemove(deleteItems[arrName].pop()));
            }

            return $q.all(promises);
        };
        
        function saveRangeAsync(arr, method, rawScheme) {
            var def = $q.defer(), total, countSaved = 0,
                itemsWithoutUser = arr.filter(function (item) { return !item.isUser });
            total = itemsWithoutUser.length;
            if (total === 0) def.resolve();
            itemsWithoutUser.forEach(function (item) {
                var raw = {};
                raw.UserId = $scope.user.Id;
                raw[rawScheme.secondProp] = item[rawScheme.itemProp];
                userData[method](raw, function () {
                    item.isUser = true;
                    countSaved++;
                    if (countSaved === total) def.resolve();
                }, function (err) { def.reject(err) });
            });
            return def.promise;
        }

         
        $scope.saveUserPrecinctChanges = function () {

            function precinctsToUserPrecincts(precinct) {
                return { UserId: $scope.user.Id, PrecinctId: precinct.Id };
            };    
            
            $rootScope.errorMsg = '';

            if ($scope.isEditingUserRegionParts) {
                var ok = confirm("Увага! Дані в таблиці 'Райони' будуть оновлені.\n Всі не збережені зміни будуть скасовані, продовжити?");
                if (!ok) return;
            }

            $scope.saving.userPrecincts = true;

            userData.removeRangeUserPrecincts({ "Array": deleteItems.precincts.map(precinctsToUserPrecincts) }, function () {
                var userPrecinctsWithoutUser = selectedItems.precincts.filter(function (p) { return !p.isUser });
                userData.saveRangeUserPrecincts({ "Array": userPrecinctsWithoutUser.map(precinctsToUserPrecincts) }, function () {
                    deleteItems.precincts.forEach(function (item) {
                        item.isUser = false;
                    });
                    deleteItems.precincts = [];
                    userPrecinctsWithoutUser.forEach(function (item) { item.isUser = true });

                    $scope.saving.userPrecincts = false;
                    if ($scope.isEditingUserRegionParts) {
                        getUserRegionParts(function (data) {
                            $scope.user.regionParts = data;
                            $scope.onEditUserRegionParts();
                        });                    
                    } else {
                        $scope.completeEditingUserRegionParts();
                    }
                }, errorHandler);
            }, errorHandler);
        };

        $scope.saveUserRolesChanges = function() {
            $rootScope.errorMsg = '';
            $scope.saving.userRoles = true;
            var rawScheme = { firstProp: 'UserId', secondProp: 'RoleName', itemProp: 'Name' };
            removeRangeAsync('roles', 'removeUserRole', rawScheme).then(function () {
                saveRangeAsync(selectedItems.roles, 'saveUserRole', rawScheme).then(function () {
                    getUserRoles(function(roles) {
                        $scope.saving.userRoles = false;
                        usersHolder.updateRoles(roles);
                    });
                }, errorHandler);
            }, errorHandler);            
        };

        $scope.saveUserRegionPartsChanges = function () {
            $rootScope.errorMsg = '';

            if ($scope.isEditingUserPrecincts) {
                var ok = confirm("Увага! Дані в таблиці 'Дільниці' будуть оновлені.\n Всі не збережені зміни будуть скасовані, продовжити?");
                if (!ok) return;
            }

            $scope.saving.userRegionParts = true;
            var rawScheme = { firstProp: 'userId', secondProp: 'regionPartId', itemProp: 'Id' };
            removeRangeAsync('regionParts', 'removeUserRegionPart', rawScheme).then(function () {
                rawScheme.secondProp = 'RegionPartId';
                saveRangeAsync(selectedItems.regionParts, 'saveUserRegionPart', rawScheme).then(function () {
                    $scope.saving.userRegionParts = false;
                    if ($scope.isEditingUserPrecincts) {
                        getUserPrecincts(function(data) {
                            $scope.user.precincts = data;
                            $scope.onEditUserPrecincts();
                        });
                    } else {
                        $scope.completeEditingUserPrecincts();
                    }
                }, errorHandler);
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

        $scope.checkAllUserRegionParts = function () {
            checkAll($scope.regionPartsCopy, 'regionParts');
        };

        $scope.uncheckAllUserPrecincts = function () {
            uncheckAll(getFilteredPrecincts(), 'precincts');
        };

        $scope.uncheckAllRoles = function() {
            uncheckAll($scope.roles, 'roles');
        };
        
        $scope.uncheckAllUserRegionParts = function () {
            uncheckAll($scope.regionPartsCopy, 'regionParts');
        };

        function getFilteredPrecincts () {
            return $filter('filter')($scope.precincts, $scope.getFilterExpression(), true);
        };

        $scope.getFilterExpression = function() {
            return { RegionPartId: $scope.selected.regionPartId, isUser: $scope.checkOnlyUserPrecincts() };
        };

        $scope.onSelectRegionPart = function ($item, $model, $label) {
            $scope.selected.regionPart = $item;
            $scope.selected.regionPartId = $model;
        };

        $scope.markButton = function (arrName, value) {
            if (value.isUser) {
                if (deleteItems[arrName].indexOf(value) >= 0) return "btn-danger";
                return "btn-success";
            } else {
                if (selectedItems[arrName].indexOf(value) >= 0) return "btn-warning";
                return "btn-info";
            }
        };

        $scope.markList = function (arrName, value) {
            if (value.isUser) {
                if (deleteItems[arrName].indexOf(value) >= 0) return "list-group-item-danger";
                return "list-group-item-success";
            } else {
                if (selectedItems[arrName].indexOf(value) >= 0) return "list-group-item-warning";
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