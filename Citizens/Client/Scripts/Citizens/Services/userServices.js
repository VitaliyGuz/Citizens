'use strict';

angular.module("userServices", ['ngResource'])
    .factory("userData", ['$resource', 'config', function ($resource, config) {
        var urlOdata = config.baseUrl + '/odata/Users',
            urlOdataUserPrecincts = config.baseUrl + '/odata/UserPrecincts',
            urlOdataRoles = config.baseUrl + '/odata/Roles',
            urlApiAccount = config.baseUrl + '/api/Account',
            expand = "?$expand=UserPrecincts($expand=Precinct)",
            order = "?$orderby=FirstName asc",
            paginate = "&$count=true&$skip=:skip&$top=" + config.pageSize,
            params = { id: "@id" },
            paramKey = { userId: "@userId", precinctId: "@precinctId" },
            key = "(UserId=':userId',PrecinctId=:precinctId)";
        return $resource('', {},
		{
		    'getAll': { method: 'GET', url: urlOdata + order, cache: false },// DON'T CACHE! caching already implemented in usersHolder
		    'getById': { method: 'GET', params: params, url: urlOdata + "(':id')" + expand },
		    'getUserRoles': { method: 'GET', params: params, url: urlOdata + "(':id')/Roles" },
		    'getRoles': { method: 'GET', url: urlOdataRoles, cache: true },
		    'update': { method: 'PUT', params: params, url: urlOdata + "(':id')" },
		    'remove': { method: 'DELETE', params: params, url: urlOdata + "(':id')" },
		    'saveUserPrecinct': { method: 'POST', url: urlOdataUserPrecincts },
		    'updateUserPrecinct': { method: 'PUT', params: paramKey, url: urlOdataUserPrecincts + key },
		    'removeUserPrecinct': { method: 'DELETE', params: paramKey, url: urlOdataUserPrecincts + key },
		    'getUserPrecinctsByUserId': { method: 'GET', params: { userId: "@userId" }, url: urlOdataUserPrecincts + "?$expand=Precinct&$filter=UserId eq ':userId'" },
		    'getUserPrecinctsByPrecinctId': { method: 'GET', params: { precinctId: "@precinctId" }, url: urlOdataUserPrecincts + '?$expand=User&$filter=PrecinctId eq :precinctId' },
		    'getUserPrecinct': { method: 'GET', params: paramKey, url: urlOdataUserPrecincts + key + '?$expand=User' },
		    'saveUserRole': { method: 'POST', url: urlApiAccount + "/AddToRole" },
		    'removeUserRole': { method: 'POST', url: urlApiAccount + "/RemoveFromRole" }
		});
    }]).
    factory('usersHolder', ['$q', 'userData', 'serviceUtil', function ($q, userData, serviceUtil) {
        var users, index;

        function mappedUserRoles (userRoles, roles) {
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
                userRolesPromise = userData.getUserRoles({ id: id }).$promise,
                rolesPromise = userData.getRoles().$promise;
                userData.getById({ id: id }, function (user) {
                    userRolesPromise.then(function (userRoles) {
                        rolesPromise.then(function(roles) {
                            user.Roles = mappedUserRoles(userRoles.value, roles.value);
                            deferred.resolve(user);
                        }, function(err) {
                            err.description = 'Ролі не завантажено',
                            deferred.reject(serviceUtil.getErrorMessage(err));
                        });
                    }, function(err) {
                        err.description = 'Ролі користувача не завантажено',
                        deferred.reject(serviceUtil.getErrorMessage(err));
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