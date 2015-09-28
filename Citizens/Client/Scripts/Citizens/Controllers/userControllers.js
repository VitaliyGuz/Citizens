'use strict';

var userControllers = angular.module('userControllers', ['userServices']);

userControllers.controller('listUsersController', ['$rootScope', '$location', '$scope', '$filter', '$q', 'config', 'serviceUtil', 'filterSettings', 'userData', 'usersHolder',
    function ($rootScope, $location, $scope, $filter, $q, config, serviceUtil, filterSettings, userData, usersHolder) {

        $rootScope.pageTitle = 'Користувачі';
        $scope.tableHead = ['№', 'П.І.Б.', 'Email', 'Ролі', 'Дії'];

        $scope.pagination = {
            currentPage: serviceUtil.getRouteParam("currPage") || 1,
            pageSize: config.pageSize
        };
        
        var odataFilterPattern = "&$filter=UserRegionParts/any(r:r/RegionPartId eq :regionPartId)";
        
        $scope.query = filterSettings.get('users');
        if ($scope.query) {
            doFilter();
        } else {
            $scope.users = usersHolder.get();
        }

        $scope.getIndex = function (ind) {
            return ($scope.pagination.currentPage - 1) * $scope.pagination.pageSize + ind;
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

        $scope.applyFilter = doFilter;

        function doFilter() {
            var usersPromise;
            if (!$scope.loader) $scope.loader = {};
            $scope.loader.filtering = true;
            if ($scope.query.userRegionPart) {
                usersPromise = userData.getAll({ filter: odataFilterPattern.replace(':regionPartId', $scope.query.userRegionPart.Id) }).$promise;
            } else {
                usersPromise = $q.when(usersHolder.get());
            }
            usersPromise.then(function (resp) {
                $scope.loader.filtering = false;
                var usersForFilter;
                if (resp === usersHolder.get()) {
                    usersForFilter = resp;
                } else {
                    usersForFilter = usersHolder.get().filter(function(cachedUser) {
                        return resp.value.some(function(user) { return user.Id === cachedUser.Id });
                    });
                }
                $scope.users = $filter('filter')(usersForFilter, { FirstName: $scope.query.userName, Email: $scope.query.userEmail });
                filterSettings.set('users', $scope.query);
            }, function(e) {
                $scope.loader.filtering = false;
                e.description = 'Не вдалося застосувати фільтр';
                $rootScope.errorMsg = serviceUtil.getErrorMessage(e);
            });
            
        };

        $scope.resetFilter = function () {
            $scope.query = {};
            filterSettings.remove('users');
            doFilter();
        };
        $scope.clearQueryInput = function (propName) {
            $scope.query[propName] = undefined;
            doFilter();
        };
}]);

userControllers.controller('editUserController', ['$rootScope', '$scope', '$location', '$filter', '$q', 'serviceUtil', 'userData', 'config', 'precinctData', 'usersHolder', 'resolvedUser', 'regionData', 'checkPermissions',
    function ($rootScope, $scope, $location, $filter, $q, serviceUtil, userData, config, precinctData, usersHolder, resolvedUser, regionData, checkPermissions) {

        var selectedItems = {}, deleteItems = {};
        var alertMsg = "Увага! Дані в таблиці 'name' будуть оновлені.\n Всі не збережені зміни будуть скасовані, продовжити?";

        $rootScope.pageTitle = 'Користувач';
        $scope.tableHead = ['№', 'Дільниця'];
        $scope.selected = {};

        $scope.saving = {};
        $scope.load = {loading: {} };
        $scope.data = {};
        $scope.isEditing = {};

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


        $scope.onEdit = function(propName) {

            var onEditUserPrecincts = function () {
                selectedItems.precincts = [], deleteItems.precincts = [];
                $scope.load.editingUserPrecincts = true;
                precinctData.getAllNotExpand(function (data) {
                    $scope.data.precincts = data.value.map(function (precinct) {
                        precinct.isUser = $scope.user.precincts.some(function (userPrecinct) {
                            return precinct.Id === userPrecinct.PrecinctId;
                        });
                        if (precinct.isUser) selectedItems.precincts.push(precinct);
                        return precinct;
                    });
                    $scope.isEditing.precincts = true;
                    $scope.load.editingUserPrecincts = false;
                }, function (err) {
                    $scope.load.editingUserPrecincts = false;
                    err.description = "Дільниці не завантажено";
                    $rootScope.errorMsg = serviceUtil.getErrorMessage(err);
                });
            };

            var onEditUserRoles = function () {
                selectedItems.roles = [], deleteItems.roles = [];
                $scope.load.editingUserRoles = true;
                var ROLE_NAME_SUPERADMINISTRATORS = 'SuperAdministrators'.toLowerCase();
                userData.getRoles(function (roles) {
                    $scope.isEditing.roles = true;
                    $scope.load.editingUserRoles = false;
                    var isSuperAdmin = checkPermissions([ROLE_NAME_SUPERADMINISTRATORS]);
                    if (isSuperAdmin) {
                        $scope.data.roles = roles.value;
                    } else {
                        $scope.data.roles = roles.value.filter(function (role) {
                            return role.Name.toLowerCase() !== ROLE_NAME_SUPERADMINISTRATORS;
                        });
                    }

                    $scope.data.roles = $scope.data.roles.map(function (role) {
                        role.isUser = $scope.user.roles.some(function (userRole) {
                            return userRole.RoleId === role.Id;
                        });
                        if (role.isUser) selectedItems.roles.push(role);
                        return role;
                    });
                });
            };

            var onEditUserRegionParts = function () {
                selectedItems.regionParts = [], deleteItems.regionParts = [];
                $scope.isEditing.regionParts = true;
                //$scope.load.editingUserRegionParts = true;
                $scope.data.regionParts = angular.copy($rootScope.regionParts).map(function (regionPart) {
                    regionPart.isUser = $scope.user.regionParts.some(function (userRegionPart) {
                        return userRegionPart.RegionPartId === regionPart.Id;
                    });
                    if (regionPart.isUser) selectedItems.regionParts.push(regionPart);
                    return regionPart;
                });
            };

            var onEditUserRegions = function () {
                selectedItems.regions = [], deleteItems.regions = [];
                $scope.isEditing.regions = true;
                $scope.load.editingUserRegions = true;
                regionData.query(function (regions) {
                    $scope.data.regions = regions.value.map(function (region) {
                        region.isUser = $scope.user.regions.some(function (userRegion) {
                            return userRegion.RegionId === region.Id;
                        });
                        if (region.isUser) selectedItems.regions.push(region);
                        return region;
                    });
                    $scope.data.regions.sort(serviceUtil.compareByName);
                    $scope.load.editingUserRegions = false;
                }, errorHandler);
            };

            var funcs = {
                precincts: onEditUserPrecincts,
                roles: onEditUserRoles,
                regionParts: onEditUserRegionParts,
                regions: onEditUserRegions
            }

            funcs[propName].call();
        };

        $scope.completeEditing = function (propName) {
            $scope.load.loading[propName] = true;
            dataSource(propName,function (data) {
                $scope.isEditing[propName] = false;
                $scope.load.loading[propName] = false;
                $scope.user[propName] = data;
                $scope.data[propName] = [];
            });
        };

        function dataSource(type, successCallback) {
            var param = { userId: $scope.user.Id };
            var sources = {
                regionParts: function() {
                    userData.getUserRegionPartsByUserId(param, function (data) {
                        successCallback(data.value);
                    }, errorHandler)
                },
                precincts: function() {
                    userData.getUserPrecinctsByUserId(param, function (data) {
                        successCallback(data.value);
                    }, errorHandler)
                },
                roles: function() {
                    usersHolder.asyncGetUserRoles(param.userId).then(function (userRoles) {
                        successCallback(userRoles);
                    }, errorHandler)
                },
                regions: function() {
                    userData.getUserRegionsByUserId(param, function (data) {
                        successCallback(data.value);
                    }, errorHandler)
                }
            }

            sources[type].call();
        }

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

        $scope.saveUserPrecinctChanges = function () {
                    
            $rootScope.errorMsg = '';

            if ($scope.isEditing.regionParts) {
                var ok = confirm(alertMsg.replace(/name/g,'Райони'));
                if (!ok) return;
            }

            if ($scope.isEditing.regions) {
                var ok = confirm(alertMsg.replace(/name/g, 'Області'));
                if (!ok) return;
            }

            var toUserPrecinct = function (precinct) {
                return { UserId: $scope.user.Id, PrecinctId: precinct.Id };
            };

            $scope.saving.userPrecincts = true;

            userData.removeRangeUserPrecincts({ "Array": deleteItems.precincts.map(toUserPrecinct) }, function () {
                userData.saveRangeUserPrecincts({ "Array": selectedItems.precincts.filter(isNewSelected).map(toUserPrecinct) }, function () {
                    $scope.saving.userPrecincts = false;
                    commonSuccessHandler('precincts');
                    refreshData(['regionParts', 'regions']);
                }, errorHandler);
            }, errorHandler);
        };

        $scope.saveUserRolesChanges = function() {
            $rootScope.errorMsg = '';
            $scope.saving.userRoles = true;

            var toRemovePromise = function (role) {
                return userData.removeUserRole({ UserId: $scope.user.Id, RoleName: role.Name }).$promise;
            };

            var toSavePromise = function (role) {
                return userData.saveUserRole({ UserId: $scope.user.Id, RoleName: role.Name }).$promise;
            };

            $q.all(deleteItems.roles.map(toRemovePromise)).then(function () {
                $q.all(selectedItems.roles.filter(isNewSelected).map(toSavePromise))
                    .then(function () {
                        $scope.saving.userRoles = false;
                        commonSuccessHandler('roles');
                        dataSource('roles', function (roles) {
                            usersHolder.updateRoles($scope.user, roles);
                        });
                    }, errorHandler);
            }, errorHandler);           
        };

        $scope.saveUserRegionPartsChanges = function () {
            $rootScope.errorMsg = '';

            if ($scope.isEditing.precincts) {
                var ok = confirm(alertMsg.replace(/name/g, 'Дільниці'));
                if (!ok) return;
            }

            if ($scope.isEditing.regions) {
                var ok = confirm(alertMsg.replace(/name/g, 'Області'));
                if (!ok) return;
            }

            $scope.saving.userRegionParts = true;

            var toRemovePromise = function (regionPart) {
                return userData.removeUserRegionPart({ userId: $scope.user.Id, regionPartId: regionPart.Id }).$promise;
            };

            var toSavePromise = function (regionPart) {
                return userData.saveUserRegionPart({ UserId: $scope.user.Id, RegionPartId: regionPart.Id }).$promise;
            };

            $q.all(deleteItems.regionParts.map(toRemovePromise)).then(function () {
                $q.all(selectedItems.regionParts.filter(isNewSelected).map(toSavePromise))
                    .then(function() {
                        $scope.saving.userRegionParts = false;
                        commonSuccessHandler('regionParts');
                        refreshData(['precincts', 'regions']);
                    },errorHandler);
            },errorHandler);
        };

        $scope.saveUserRegionsChanges = function () {
            $rootScope.errorMsg = '';

            if ($scope.isEditing.precincts) {
                var ok = confirm(alertMsg.replace(/name/g, 'Дільниці'));
                if (!ok) return;
            }

            if ($scope.isEditing.regionParts) {
                var ok = confirm(alertMsg.replace(/name/g, 'Райони'));
                if (!ok) return;
            }

            $scope.saving.userRegions = true;

            var toRemovePromise = function (region) {
                return userData.removeUserRegion({ userId: $scope.user.Id, regionId: region.Id }).$promise;
            };

            var toSavePromise = function (region) {
                return userData.saveUserRegion({ UserId: $scope.user.Id, RegionId: region.Id }).$promise;
            };

            $q.all(deleteItems.regions.map(toRemovePromise)).then(function () {
                $q.all(selectedItems.regions.filter(isNewSelected).map(toSavePromise))
                    .then(function () {
                        $scope.saving.userRegions = false;
                        commonSuccessHandler('regions');
                        refreshData(['precincts','regionParts']);
                    }, errorHandler);
            }, errorHandler);
        };
        
        function isNewSelected(item) {
            return !item.isUser;
        };

        function commonSuccessHandler(arrayName) {
            deleteItems[arrayName].forEach(function (item) {
                item.isUser = false;
            });
            deleteItems[arrayName] = [];
            selectedItems[arrayName].filter(isNewSelected).forEach(function (item) { item.isUser = true });
        };

        function refreshData(propNames) {
            propNames.forEach(function (propName) {
                if ($scope.isEditing[propName]) {
                    dataSource(propName, function (data) {
                        $scope.user[propName] = data;
                        $scope.onEdit(propName);
                    });
                } else {
                    $scope.completeEditing(propName);
                }
            });           
        };

        $scope.checkAll = function (arrayName, array) {
            var data = array ? array : $scope.data[arrayName];
            data.forEach(function (item) {
                var ind = deleteItems[arrayName].indexOf(item);
                if (ind >= 0) deleteItems[arrayName].splice(ind, 1);
            });
            selectedItems[arrayName] = selectedItems[arrayName].concat(data.filter(function (item) {
                return selectedItems[arrayName].indexOf(item) < 0;
            }));
        };

        $scope.uncheckAll = function (arrayName, array) {
            var data = array ? array : $scope.data[arrayName];
            data.forEach(function (item) {
                if (item.isUser && deleteItems[arrayName].indexOf(item) < 0) deleteItems[arrayName].push(item);
                var ind = selectedItems[arrayName].indexOf(item);
                if (ind >= 0) selectedItems[arrayName].splice(ind, 1);
            });
        };

        $scope.checkAllUserPrecincts = function () {
            $scope.checkAll('precincts', getFilteredPrecincts());
        };

        $scope.uncheckAllUserPrecincts = function () {
            $scope.uncheckAll('precincts', getFilteredPrecincts());
        };

        function getFilteredPrecincts () {
            return $filter('filter')($scope.data.precincts, $scope.getFilterExpression(), true);
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