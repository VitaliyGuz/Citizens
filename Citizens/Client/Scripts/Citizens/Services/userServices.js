'use strict';

angular.module("userServices", ['ngResource'])
    .factory("userData", ['$resource', 'config', function ($resource, config) {
        var /*urlOdata = config.baseUrl + '/odata/Users',
            urlOdataUserPrecincts = config.baseUrl + '/odata/UserPrecincts',
            urlOdataUserRegionParts = config.baseUrl + '/odata/UserRegionParts',
            urlOdataUserRegions = config.baseUrl + '/odata/UserRegions',
            urlOdataRoles = config.baseUrl + '/odata/Roles',
            urlApiAccount = config.baseUrl + '/api/Account',*/
            urls = {
                odata: {
                    user: {
                        users: config.baseUrl + '/odata/Users',
                        precincts: config.baseUrl + '/odata/UserPrecincts',
                        regionParts : config.baseUrl + '/odata/UserRegionParts',
                        regions: config.baseUrl + '/odata/UserRegions'
                    },
                    roles: config.baseUrl + '/odata/Roles'
                },
                api: {
                    account: config.baseUrl + '/api/Account'
                }
            },
            expand = "?$expand=UserPrecincts($expand=Precinct),UserRegionParts($expand=RegionPart),UserRegions($expand=Region) ",
            order = "?$orderby=FirstName asc",
            paginate = "&$count=true&$skip=:skip&$top=" + config.pageSize,
            params = {
                id: { id: "@id" },
                keyUserId: { userId: "@userId" }
            },
            keys = {
                userPrecinct : "(UserId=':userId',PrecinctId=:precinctId)",
                userRegionPart: "(UserId=':userId',RegionPartId=:regionPartId)",
                userRegion: "(UserId=':userId',RegionId=:regionId)"
            };

        params.keyUserPrecinct = angular.extend({}, params.keyUserId, { precinctId: "@precinctId" });
        params.keyUserRegionPart = angular.extend({}, params.keyUserId,{regionPartId: "@regionPartId" });
        params.keyUserRegion = angular.extend({}, params.keyUserId, { regionId: "@regionId" });

        //params.keyUserRegionPart = { userId: "@userId", regionPartId: "@regionPartId" };
        //params.keyUserId = { userId: "@userId" };
        //keys.userPrecinct = "(UserId=':userId',PrecinctId=:precinctId)";
        //keys.userRegionPart = "(UserId=':userId',RegionPartId=:regionPartId)";

        return $resource('', {},
		{
		    'getAll': { method: 'GET', params: { filter: "@filter" }, url: urls.odata.user.users +order + ":filter", cache: false },// DON'T CACHE! caching already implemented in usersHolder
		    'getById': { method: 'GET', params: params.id, url: urls.odata.user.users + "(':id')" + expand },
		    'getUserRoles': { method: 'GET', params: params.id, url: urls.odata.user.users + "(':id')/Roles" },
		    'getRoles': { method: 'GET', url: urls.odata.roles, cache: true },
		    'update': { method: 'PUT', params: params.id, url: urls.odata.user.users + "(':id')" },
		    'remove': { method: 'DELETE', params: params.id, url: urls.odata.user.users + "(':id')" },
		    'saveUserPrecinct': { method: 'POST', url: urls.odata.user.precincts },
		    'updateUserPrecinct': { method: 'PUT', params: params.keyUserPrecinct, url: urls.odata.user.precincts + keys.userPrecinct },
		    'removeUserPrecinct': { method: 'DELETE', params: params.keyUserPrecinct, url: urls.odata.user.precincts +keys.userPrecinct },
		    'saveRangeUserPrecincts': { method: 'POST', url: urls.odata.user.precincts + "/AddRange" },
		    'removeRangeUserPrecincts': { method: 'POST', url : urls.odata.user.precincts + "/RemoveRange" },
		    'getUserPrecinctsByUserId': { method: 'GET', params: params.keyUserId, url: urls.odata.user.precincts + "?$expand=Precinct&$filter=UserId eq ':userId'" },
		    'getUserPrecinctsByPrecinctId': { method: 'GET', params: { precinctId: "@precinctId" }, url: urls.odata.user.precincts + '?$expand=User&$filter=PrecinctId eq :precinctId' },
		    'getUserPrecinctsByRoleId': { method: 'GET', params: { roleId: "@roleId" }, url: urls.odata.user.precincts + "?$expand=User,Precinct&$filter=User/Roles/any(ur:ur/RoleId eq ':roleId')" },
		    'getUserPrecinct': { method: 'GET', params: params.keyUserPrecinct, url: urls.odata.user.precincts + keys.userPrecinct + '?$expand=User' },
		    'saveUserRole': { method: 'POST', url: urls.api.account + "/AddToRole" },
		    'removeUserRole': { method: 'POST', url: urls.api.account + "/RemoveFromRole" },
		    'saveUserRegionPart': { method: 'POST', url: urls.odata.user.regionParts },
		    'removeUserRegionPart': { method: 'DELETE', params: params.keyUserRegionPart, url: urls.odata.user.regionParts + keys.userRegionPart },
		    'getUserRegionPartsByUserId': { method: 'GET', params: params.keyUserId, url: urls.odata.user.regionParts + "?$expand=RegionPart&$filter=UserId eq ':userId'" },
            'saveUserRegion': { method: 'POST', url: urls.odata.user.regions },
            'removeUserRegion': { method: 'DELETE', params: params.keyUserRegion, url: urls.odata.user.regions + keys.userRegion},
		    'getUserRegionsByUserId': { method: 'GET', params: params.keyUserId, url: urls.odata.user.regions + "?$expand=Region&$filter=UserId eq ':userId'" }
		});
    }]).
    factory('usersHolder', ['$q', 'userData', 'serviceUtil', function ($q, userData, serviceUtil) {
        var users;

        function mappedUserRoles(userRoles, roles) {
            return userRoles.map(function (userRole) {
                userRole.Role = roles.filter(function (role) {
                    return userRole.RoleId === role.Id;
                })[0];
                return userRole;
            });
        };

        return {
            asyncLoad: function () {
                var deferred = $q.defer();
                if (!this.isEmpty()) {
                    deferred.resolve();
                    return deferred.promise;
                }
                userData.getAll(function (res) {
                    userData.getRoles(function (roles) {
                        users = res.value.map(function(user) {
                            user.Roles = mappedUserRoles(user.Roles, roles.value);
                            return user;
                        });
                        deferred.resolve();
                    }, function (err) {
                        err.description = 'Ролі не завантажено',
                        deferred.reject(serviceUtil.getErrorMessage(err));
                    });
                }, function (err) {
                    err.description = 'Користувачі не завантажено',
                    deferred.reject(serviceUtil.getErrorMessage(err));
                });
                return deferred.promise;
            },
            asyncLoadById: function (id) {
                var deferred = $q.defer(),
                getUserRoles = this.asyncGetUserRoles;
                userData.getById({ id: id }, function (user) {
                    getUserRoles(id).then(function (userRoles) {
                        user.Roles = userRoles;
                        deferred.resolve(user); 
                    });
                }, function (err) {
                    err.description = 'Користувача не знайдено',
                    deferred.reject(serviceUtil.getErrorMessage(err));
                });
                return deferred.promise;
            },
            get: function () {
                return users;
            },
            getByRole: function (role) {
                return users.filter(function (user) {
                    return user.Roles.some(function (userRole) {
                        return userRole.RoleId === role.Id;
                    });
                });
            },
            asyncGetUserRoles: function (userId) {
                var deferred = $q.defer();
                var userRolesPromise = userData.getUserRoles({ id: userId }).$promise,
                    rolesPromise = userData.getRoles().$promise;
                userRolesPromise.then(function (userRoles) {
                    rolesPromise.then(function (roles) {
                        deferred.resolve(mappedUserRoles(userRoles.value, roles.value));
                    }, function (err) {
                        err.description = 'Ролі не завантажено',
                        deferred.reject(serviceUtil.getErrorMessage(err));
                    });
                }, function (err) {
                    err.description = 'Ролі користувача не завантажено',
                    deferred.reject(serviceUtil.getErrorMessage(err));
                });
                return deferred.promise;
            },
            set: function (data) {
                if (data && angular.isArray(data)) users = data;
            },
            update: function (elem) {
                var ind = this.indexOf(elem);
                if (ind >= 0) users[ind] = elem;
            },
            updateRoles: function (user,newRoles) {
                var ind = this.indexOf(user);
                if (ind >= 0 && newRoles) users[ind].Roles = newRoles;
            },
            add: function (elem) {
                if (users && elem) users.push(elem);
            },
            remove: function (elem) {
                var ind = this.indexOf(elem);
                if (ind >= 0) users.splice(ind, 1);
            },
            removeAll: function () {
                users = [];
            },
            isEmpty: function () {
                return users ? users.length <= 0 : true;
            },
            indexOf: function (elem) {
                return elem && users ? serviceUtil.objectIndexOf(users, elem) : -1;
            },
            sort: function () {
                if (users) {
                    users.sort(function (a, b) {
                        return a.FirstName.localeCompare(b.FirstName);
                    });
                }
            }
        }
    }]);