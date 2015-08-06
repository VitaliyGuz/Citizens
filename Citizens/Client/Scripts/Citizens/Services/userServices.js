'use strict';

angular.module("userServices", ['ngResource'])
    .factory("userData", ['$resource', 'config', function ($resource, config) {
        var urlOdata = config.baseUrl + '/odata/Users',
            urlOdataUserPrecincts = config.baseUrl + '/odata/UserPrecincts',
            urlOdataUserRegionParts = config.baseUrl + '/odata/UserRegionParts',
            urlOdataRoles = config.baseUrl + '/odata/Roles',
            urlApiAccount = config.baseUrl + '/api/Account',
            expand = "?$expand=UserPrecincts($expand=Precinct),UserRegionParts($expand=RegionPart),UserRegions($expand=Region) ",
            order = "?$orderby=FirstName asc",
            paginate = "&$count=true&$skip=:skip&$top=" + config.pageSize,
            params = {}, keys = {};

        params.id = { id: "@id" };
        params.keyUserPrecinct = { userId: "@userId", precinctId: "@precinctId" };
        params.keyUserRegionPart = { userId: "@userId", regionPartId: "@regionPartId" };
        params.keyUserId = { userId: "@userId" };
        keys.userPrecinct = "(UserId=':userId',PrecinctId=:precinctId)";
        keys.userRegionPart = "(UserId=':userId',RegionPartId=:regionPartId)";

        return $resource('', {},
		{
		    'getAll': { method: 'GET', url: urlOdata + order, cache: false },// DON'T CACHE! caching already implemented in usersHolder
		    'getById': { method: 'GET', params: params.id, url: urlOdata + "(':id')" + expand },
		    'getUserRoles': { method: 'GET', params: params.id, url: urlOdata + "(':id')/Roles" },
		    'getRoles': { method: 'GET', url: urlOdataRoles, cache: true },
		    'update': { method: 'PUT', params: params.id, url: urlOdata + "(':id')" },
		    'remove': { method: 'DELETE', params: params.id, url: urlOdata + "(':id')" },
		    'saveUserPrecinct': { method: 'POST', url: urlOdataUserPrecincts },
		    'updateUserPrecinct': { method: 'PUT', params: params.keyUserPrecinct, url: urlOdataUserPrecincts + keys.userPrecinct },
		    'removeUserPrecinct': { method: 'DELETE', params: params.keyUserPrecinct, url: urlOdataUserPrecincts + keys.userPrecinct },
		    'getUserPrecinctsByUserId': { method: 'GET', params: params.keyUserId, url: urlOdataUserPrecincts + "?$expand=Precinct&$filter=UserId eq ':userId'" },
		    'getUserPrecinctsByPrecinctId': { method: 'GET', params: { precinctId: "@precinctId" }, url: urlOdataUserPrecincts + '?$expand=User&$filter=PrecinctId eq :precinctId' },
		    'getUserPrecinctsByRoleId': { method: 'GET', params: { roleId: "@roleId" }, url: urlOdataUserPrecincts + "?$expand=User,Precinct&$filter=User/Roles/any(ur:ur/RoleId eq ':roleId')" },
		    'getUserPrecinct': { method: 'GET', params: params.keyUserPrecinct, url: urlOdataUserPrecincts + keys.userPrecinct + '?$expand=User' },
		    'saveUserRole': { method: 'POST', url: urlApiAccount + "/AddToRole" },
		    'removeUserRole': { method: 'POST', url: urlApiAccount + "/RemoveFromRole" },
		    'saveUserRegionPart': { method: 'POST', url: urlOdataUserRegionParts },
		    'removeUserRegionPart': { method: 'DELETE', params: params.keyUserRegionPart, url: urlOdataUserRegionParts + keys.userRegionPart },
		    'getUserRegionPartsByUserId': { method: 'GET', params: params.keyUserId, url: urlOdataUserRegionParts + "?$expand=RegionPart&$filter=UserId eq ':userId'" }
		});
    }]).
    factory('usersHolder', ['$q', 'userData', 'serviceUtil', function ($q, userData, serviceUtil) {
        var users, index;

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
            setEditIndex: function (ind) {
                index = undefined;
                if (ind != undefined && ind >= 0) index = ind;
            },
            updateElem: function (elem) {
                if (index >= 0 && elem) users[index] = elem;
            },
            addElem: function (elem) {
                if (users && elem) users.push(elem);
            },
            removeElem: function (elem) {
                users.splice(this.indexOf(elem), 1);
            },
            isEmpty: function () {
                return users ? users.length <= 0 : true;
            },
            indexOf: function (elem) {
                return elem && users ? users.indexOf(elem) : undefined;
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