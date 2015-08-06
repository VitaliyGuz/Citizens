﻿'use strict';

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

userControllers.controller('editUserController', ['$rootScope', '$scope', '$location', '$filter', '$q', 'serviceUtil', 'userData', 'config', 'precinctData', 'usersHolder', 'resolvedUser', 'regionPartTypes',
    function ($rootScope, $scope, $location, $filter, $q, serviceUtil, userData, config, precinctData, usersHolder, resolvedUser, regionPartTypes) {
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
        
        $scope.regionPartTypes = regionPartTypes;

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
            userData.getRoles(function (roles) {
                $scope.isEditingUserRoles = true;
                $scope.load.editingUserRoles = false;
                $scope.roles = roles.value.map(function(role) {
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
            $scope.regionPartsREGION = angular.copy($filter('filter')($rootScope.regionParts, { RegionPartType: regionPartTypes.REGION.desc }, true));
            $scope.regionPartsREGION = $scope.regionPartsREGION.map(function (regionPart) {
                regionPart.isUser = $scope.user.regionParts.some(function (userRegionPart) {
                    return userRegionPart.RegionPartId === regionPart.Id;
                });
                if (regionPart.isUser) selectedItems.regionParts.push(regionPart);
                return regionPart;
            });          
        };

        $scope.completeEditingUserPrecincts = function () {
            $scope.load.loadingUserPrecincts = true;
            userData.getUserPrecinctsByUserId({ userId: $scope.user.Id },function (data) {
                $scope.isEditingUserPrecincts = false;
                $scope.load.loadingUserPrecincts = false;
                $scope.user.precincts = data.value;
                $scope.precincts = null;
            },errorHandler);
        };

        $scope.completeEditingUserRoles = function() {
            $scope.load.loadingUserRoles = true;
            usersHolder.asyncGetUserRoles($scope.user.Id).then(function(userRoles) {
                $scope.isEditingUserRoles = false;
                $scope.load.loadingUserRoles = false;
                $scope.user.roles = userRoles;
                $scope.roles = null;
            }, errorHandler);
        };

        $scope.completeEditingUserRegionParts = function () {
            $scope.load.loadingUserRegionParts = true;
            userData.getUserRegionPartsByUserId({ userId: $scope.user.Id }, function (data) {
                $scope.isEditingUserRegionParts = false;
                $scope.load.loadingUserRegionParts = false;
                $scope.user.regionParts = data.value;
                $scope.regionPartsREGION = null;
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

        function removeRangeAsync(arrName, method, rawScheme) {

            var promises = [];

            function asyncRemove(item) {
                var def = $q.defer(), raw = {};
                raw[rawScheme.firstProp] = $scope.user.Id;
                raw[rawScheme.secondProp] = item[rawScheme.itemProp];
                userData[method](raw, function () {
                    item.isUser = false;
                    var ind = selectedItems[arrName].indexOf(item);
                    if (ind >= 0) selectedItems[arrName].splice(ind, 1);
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
            total = precinctsWithoutUser.length;
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
            $rootScope.errorMsg = '';
            if ($scope.isEditingUserRegionParts) {
                var ok = confirm("Увага! Дані в таблиці 'Райони' будуть оновлені.\n Всі не збережені зміни будуть скасовані, продовжити?");
                if (!ok) return;
            }
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
            function saveUserPrecinctsAsync() {
                var def = $q.defer(), countPrecincts, countSavedPrecincts = 0;
                var precinctsWithoutUser = selectedItems.precincts.filter(function (p) { return !p.isUser });
                countPrecincts = precinctsWithoutUser.length;
                if (countPrecincts === 0) def.resolve();
                precinctsWithoutUser.forEach(function (item) {
                    userData.saveUserPrecinct({ UserId: $scope.user.Id, PrecinctId: item.Id }, function () {
                        item.isUser = true;
                        countSavedPrecincts++;
                        if (countSavedPrecincts === countPrecincts) def.resolve();
                    }, function (err) { def.reject(err) });
                });
                return def.promise;
            }
            
            var rawScheme = { firstProp: 'userId', secondProp: 'precinctId', itemProp: 'Id' };
            $scope.saving.userPrecincts = true;
            removeRangeAsync('precincts', 'removeUserPrecinct', rawScheme).then(function () {
                rawScheme.secondProp = 'PrecinctId';
                saveRangeAsync(selectedItems.precincts, 'saveUserPrecinct', rawScheme).then(function () {
                    $scope.saving.userPrecincts = false;
                    if ($scope.isEditingUserRegionParts) {
                        $scope.onEditUserRegionParts();
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

        $scope.saveUserRegionPartsChanges = function () {
            $rootScope.errorMsg = '';
            $scope.saving.userRegionParts = true;
            var rawScheme = { firstProp: 'userId', secondProp: 'regionPartId', itemProp: 'Id' };
            removeRangeAsync('regionParts', 'removeUserRegionPart', rawScheme).then(function () {
                $scope.saving.userRegionParts = false;
                selectedItems.regionParts.forEach(function (regionPart) {
                    if (!regionPart.isUser) {
                        $scope.saving.userRegionParts = true;
                        userData.saveUserRegionPart({ UserId: $scope.user.Id, RegionPartId: regionPart.Id }, function () {
                            $scope.saving.userRegionParts = false;
                            regionPart.isUser = true;
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

        $scope.checkAllUserRegionParts = function () {
            checkAll($scope.regionPartsREGION, 'regionParts');
        };

        $scope.uncheckAllUserPrecincts = function () {
            uncheckAll(getFilteredPrecincts(), 'precincts');
        };

        $scope.uncheckAllRoles = function() {
            uncheckAll($scope.roles, 'roles');
        };
        
        $scope.uncheckAllUserRegionParts = function () {
            uncheckAll($scope.regionPartsREGION, 'regionParts');
        };

        function getFilteredPrecincts () {
            return $filter('filter')($scope.precincts, $scope.getFilterExpression(), true);
        };

        $scope.getFilterExpression = function() {
            return { RegionPartId: $scope.selected.regionPartId, isUser: $scope.checkOnlyUserPrecincts() };
        };

        //$scope.onSelectPrecinct = function ($item, $model, $label) {
        //    $scope.selected.precinct = $item;
        //    $scope.selected.precinctId = $model;
        //};

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