'use strict';

var precinctControllers = angular.module('precinctControllers', ['precinctServices', 'scrollable-table']);

precinctControllers.controller("listPrecinctsController", ['$location', '$rootScope', '$scope', 'config', 'serviceUtil', 'precinctResource', 'filterSettings',
    function ($location, $rootScope, $scope, config, serviceUtil, precinctResource, filterSettings) {
        
        $rootScope.pageTitle = 'Дільниці';
        $scope.tableHead = ['№', 'Дільниця', 'Адреса', 'Дії'];
        
        var precinctsQuery = filterSettings.get('precincts');
        if (precinctsQuery) {
            $scope.query = precinctsQuery;
            $scope.queryBy = Object.keys(precinctsQuery)[0];
        } else {
            $scope.query = {};
            $scope.queryBy = 'Number';
        }

        $scope.pagination = {
            currentPage: serviceUtil.getRouteParam("currPage") || 1,
            pageSize: config.pageSize,
            totalItems: 0
        };

        function getSkip() {
            return ($scope.pagination.currentPage - 1) * $scope.pagination.pageSize || 0;
        };

        setPrecinctsOnPage();

        function setPrecinctsOnPage() {
            $scope.loadingPrecincts = true;
            var filterQuery = getODataFilterQuery();
            if (filterQuery) filterQuery = '&$filter=' + filterQuery;
            precinctResource.getPageItems({ skip: getSkip(), filter: filterQuery }, successHandler, errorHandler);
        };

        function getODataFilterQuery() {
            if ($scope.query && $scope.query[$scope.queryBy]) {
                return "indexof(cast(:fieldName,Edm.String), ':val') ge 0"
                    .replace(':fieldName', $scope.queryBy)
                    .replace(':val', $scope.query[$scope.queryBy]);
            } else {
                return undefined;
            }
        };

        function successHandler(data) {
            $rootScope.errorMsg = '';
            $scope.loadingPrecincts = false;
            $scope.precincts = data.value;
            $scope.pagination.totalItems = data['@odata.count'];
        };

        $scope.getIndex = function (ind) {
            return getSkip() + ind + 1;
        };

        $scope.edit = function (precinct) {
            $rootScope.errorMsg = '';
            $location.path('/precinct/' + precinct.Id + '/' + $scope.pagination.currentPage);
        };

        $scope.delete = function (precinct) {
            if (config.checkDeleteItem) {
                var ok = confirm("Увага! Дільницю буде видалено, продовжити?");
                if (!ok) return;
            }
            $rootScope.errorMsg = '';
            precinctResource.remove({ id: precinct.Id },function () {
                setPrecinctsOnPage();
            }, function(err) {
                err.description = "За дільницею закріплені адреси, округи та користувачі";
                errorHandler(err);
            });
        };        

        $scope.addNewPrecinct = function () {
            $rootScope.errorMsg = '';
            $location.path('/precinct/new/' + $scope.pagination.currentPage);
        };

        function errorHandler(e) {
            $scope.loadingPrecincts = false;
            $rootScope.errorMsg = serviceUtil.getErrorMessage(e);
        };

        $scope.onPageChange = function (newPageNumber) {
            $location.path("/precincts/" + newPageNumber);
        };

        $scope.applyFilter = function () {
            if ($scope.query[$scope.queryBy]) {
                filterSettings.set('precincts', $scope.query);
            } else {
                filterSettings.remove('precincts');
            }
            setPrecinctsOnPage();
        };
    }]);

precinctControllers.controller("editPrecinctController", ['$location', '$rootScope', '$scope', 'serviceUtil', 'config', 'precinctDataService', 'resolvedData', 'userData', 'usersHolder', 'modelFactory',
    function ($location, $rootScope, $scope, serviceUtil, config, precinctDataService, resolvedData, userData, usersHolder, modelFactory) {
        var copyAddressMode, editableAddress, editablePrecinctDistrict, editableUserPrecinct;
        $rootScope.pageTitle = 'Дільниця';
        $scope.saving = {};
        $scope.changingPresinct = false;
        $scope.addMode = true;
        $scope.validation = { house: {} };
        //todo: rewrite all controllers where used pagination like this:
        $scope.pagination = {
            currentPage: 1,
            pageSize: config.pageSizeTabularSection
        };
        
        $scope.query = {};
       
        $scope.precinctAddresses = [];
        $scope.selected = { precinct: {}, address: {}, precinctDistrict: {}, userPrecinct: {} };
        $scope.autocomplete = {};
        
        if (resolvedData.precinct) {
            $scope.addMode = false;
            //todo: refactor to $scope.data = resolvedData
            $scope.precinct = resolvedData.precinct;
            $scope.precinctAddresses = resolvedData.precinctAddresses;
            if (resolvedData.precinct.City) {
                $scope.autocomplete.CityId = resolvedData.precinct.City.Id;
                $scope.autocomplete.City = resolvedData.precinct.City;
            }
            serviceUtil.sortAddresses($scope.precinctAddresses);
            $scope.precinctDistricts = resolvedData.precinct.DistrictPrecincts;
            if ($scope.precinctDistricts){
                $scope.precinctDistricts.sort(function(a, b) {
                    return a.DistrictId - b.DistrictId;
                });
            }
        }
        $scope.districts = resolvedData.districts;
        $scope.userPrecincts = resolvedData.userPrecincts;
        $scope.users = usersHolder.get();

        $scope.houseTypes = precinctDataService.houseTypes;
        $scope.getPrecinctsByNumber = precinctDataService.typeaheadPrecinctByNumber;
       
        $scope.patterns = {
            houseExceptBuilding: config.patterns.houseExceptBuilding,
            houseBuilding: config.patterns.houseBuilding
        };

        userData.getRoles(function (roles) {
            $scope.roles = roles.value;
        });

        $scope.editAddress = function (address) {
            $rootScope.errorMsg = '';
            editableAddress = address;
            $scope.addAddressMode = false;
            precinctDataService.resources.address.query(serviceUtil.getAddressKey(address), function (res) {
                $scope.selected.address = res;
                if (!$scope.selected.address.Street.Name) $scope.selected.address.Street.Name = ' ';
                $scope.selected.address.houseExceptBuilding = serviceUtil.getHouseExceptBuilding(res.House);
            }, errorHandler);
        };

        $scope.editPrecinctDistrict = function (precinctDistrict) {
            $rootScope.errorMsg = '';
            editablePrecinctDistrict = precinctDistrict;
            $scope.addDistrictMode = false;
            precinctDataService.resources.district.getPrecinctDistrict({ districtId: precinctDistrict.DistrictId, precinctId: precinctDistrict.PrecinctId }, function (res) {
                $scope.selected.precinctDistrict = res;
            }, errorHandler);
        };

        $scope.editUserPrecinct = function (userPrecinct) {
            $rootScope.errorMsg = '';
            editableUserPrecinct = userPrecinct;
            $scope.addUserMode = false;
            userData.getUserPrecinct({ userId: userPrecinct.UserId, precinctId: userPrecinct.PrecinctId }, function (res) {
                $scope.selected.userPrecinct = res;
            }, errorHandler);
        };

        $scope.deleteAddress = function (address) {
            if (config.checkDeleteItem) {
                var ok = confirm("Увага! Адресу дільниці буде видалено, продовжити?");
                if (!ok) return;
            }
            $rootScope.errorMsg = '';
            precinctDataService.resources.address.remove(serviceUtil.getAddressKey(address),function () {
                $scope.precinctAddresses.splice($scope.precinctAddresses.indexOf(address), 1);
            }, function (err) {
                if (err.status !== 403) err.description = "Заборонено видаляти адресу, за якою закріплена фізособа";
                errorHandler(err);
            });
        };

        $scope.deletePrecinctDistrict = function (precinctDistrict, ind) {
            if (config.checkDeleteItem) {
                var ok = confirm("Увага! Округ буде видалено, продовжити?");
                if (!ok) return;
            }
            $rootScope.errorMsg = '';
            precinctDataService.resources.district.removePrecinctDistrict({
                    districtId: precinctDistrict.DistrictId,
                    precinctId: precinctDistrict.PrecinctId
                },function () {
                    $scope.precinctDistricts.splice(ind, 1);
                }, errorHandler);
        };

        $scope.deleteUserPrecinct = function (userPrecinct, ind) {
            if (config.checkDeleteItem) {
                var ok = confirm("Увага! Користувача буде видалено, продовжити?");
                if (!ok) return;
            }
            $rootScope.errorMsg = '';
            userData.removeUserPrecinct({ userId: userPrecinct.UserId, precinctId: userPrecinct.PrecinctId },
                function () {
                    $scope.userPrecincts.splice(ind, 1);
                }, errorHandler);
        };

        $scope.save = function () {

            if (!$scope.precinct.CityId) {
                $rootScope.errorMsg = "Населений пункт '" + $scope.precinct.City + "' не знайдено";
                return;
            }

            if (!$scope.precinct.StreetId) {
                $rootScope.errorMsg = "Вулицю '" + $scope.precinct.Street + "' не знайдено";
                return;
            }

            if (!$scope.precinct.RegionPartId) {
                $rootScope.errorMsg = "Район '" + $scope.precinct.RegionPart + "' не знайдено";
                return;
            }

            if ($scope.precinct.Neighborhood && !$scope.precinct.NeighborhoodId) {
                $rootScope.errorMsg = "Мікрорайон '" + $scope.precinct.Neighborhood + "' не знайдено";
                return;
            }

            $rootScope.errorMsg = '';
            $scope.saving.precinct = true;
            
            var precinctModel = modelFactory.createObject('precinct', $scope.precinct);
            if ($scope.addMode) {
                precinctDataService.resources.precinct.save(precinctModel, successHandler, errorHandler);
            } else {
                precinctDataService.resources.precinct.update({ id: $scope.precinct.Id }, precinctModel, successHandler, errorHandler);
            }
            function successHandler(resp) {
                $scope.saving.precinct = false;
                if ($scope.addMode) {
                    $scope.addMode = false;
                    $scope.precinct.Id = resp.Id;
                    $rootScope.successMsg = 'Дільницю успішно створено!';
                } else {
                    //$scope.precincts[$rootScope.editInd] = res;
                    //$scope.precincts = $scope.precincts.map(function (precinct) {
                    //    if (precinct.Id === $scope.precinct.Id) {
                    //        return $scope.precinct;
                    //    } else {
                    //        return precinct;
                    //    }
                    //});
                    $rootScope.successMsg = 'Зміни успішно збережено!';
                }
                //$scope.precincts.sort(comparePrecinct);
            };
        };

        function comparePrecinct(p1, p2) {
            return p1.Number - p2.Number;
        };

        $scope.saveAddress = function (oldValue) {

            if (!checkPrecinct()) return;

            if (!$scope.selected.address.CityId) {
                $rootScope.errorMsg = "Населений пункт '" + $scope.selected.address.City + "' не знайдено";
                return;
            }

            if (!$scope.selected.address.StreetId && $scope.selected.address.Street) {
                $rootScope.errorMsg = "Вулицю '" + $scope.selected.address.Street + "' не знайдено";
                return;
            }
            $rootScope.errorMsg = '';
            $scope.saving.address = true;
            serviceUtil.parseHouseNumber($scope.selected.address);
            var address = modelFactory.createObject('precinctAddress',$scope.selected.address);
            address.PrecinctId = $scope.precinct.Id;
            if ($scope.addAddressMode || copyAddressMode) {
                savePrecinctAddresses();
            } else {
                if ($scope.selected.address.CityId === oldValue.CityId
                    && $scope.selected.address.StreetId === oldValue.StreetId
                    && $scope.selected.address.House === oldValue.House) {
                    precinctDataService.resources.address.update(serviceUtil.getAddressKey(oldValue), address, successHandler, errorHandler);
                } else {
                    precinctDataService.resources.address.query(serviceUtil.getAddressKey(address), function() {
                        savePrecinctAddresses(); // is expected conflict response
                    }, function() {
                        precinctDataService.resources.address.remove(serviceUtil.getAddressKey(oldValue), function () {
                            savePrecinctAddresses();
                        }, function (err) {
                            if (err.status !== 403) err.description = "Заборонено редагувати адресу, за якою закріплені фізособи";
                            errorHandler(err);
                        });
                    });
                    
                }
            }

            function savePrecinctAddresses() {
                precinctDataService.resources.address.save(address, successHandler, errorHandler);
            };

            function successHandler(res) {
                $scope.saving.address = false;
                $scope.saving.autocompleteAddresses = false;
                res.City = $scope.selected.address.City;
                if ($scope.selected.address.Street) {
                    res.Street = $scope.selected.address.Street;
                } else {
                    res.Street = { Name: '', StreetType: {Name:''}}; // empty street
                }
                if ($scope.addAddressMode || copyAddressMode) {
                    $scope.precinctAddresses.push(res);
                } else {
                    $scope.precinctAddresses[$scope.precinctAddresses.indexOf(oldValue)] = res;
                }
                serviceUtil.sortAddresses($scope.precinctAddresses);
                $scope.resetAddress();
            };
        };

        $scope.savePrecinctDistrict = function (oldValue, ind) {

            if (!checkPrecinct()) return;

            if (!$scope.selected.precinctDistrict.DistrictId) {
                $rootScope.errorMsg = "Виберіть округ";
                return;
            }

            $rootScope.errorMsg = '';
            $scope.saving.precinctDistrict = true;
            // todo: factory method
            var precinctDistrict = {
                "DistrictId": $scope.selected.precinctDistrict.DistrictId,
                "PrecinctId": $scope.precinct.Id
            };

            if ($scope.addDistrictMode) {
                precinctDataService.resources.district.savePrecinctDistrict(precinctDistrict, successHandler, errorHandler);
            } else {
                precinctDataService.resources.district.updatePrecinctDistrict({
                    districtId: oldValue.DistrictId,
                    precinctId: oldValue.PrecinctId
                }, precinctDistrict, successHandler, errorHandler);
            }

            function successHandler(data) {
                precinctDataService.resources.district.getPrecinctDistrict({ districtId: data.DistrictId, precinctId: data.PrecinctId }, function(res) {
                    $scope.saving.precinctDistrict = false;
                    if ($scope.addDistrictMode) {
                        $scope.precinctDistricts.push(res);
                    } else {
                        $scope.precinctDistricts[ind] = res;
                    }
                    $scope.precinctDistricts.sort(function (a, b) {
                        return a.District.Number - b.District.Number;
                    });
                    $scope.resetPrecinctDistrict();
                }, errorHandler);       
            };

        };

        function checkPrecinct() {
            if(!$scope.precinct || !$scope.precinct.Id) {
                $rootScope.errorMsg = "Спочатку необхідно зберегти дільницю";
                return false;
            }
            return true;
        };

        $scope.saveUserPrecinct = function (oldValue, ind) {

            if (!checkPrecinct()) return;

            if (!$scope.selected.userPrecinct.UserId) {
                $rootScope.errorMsg = "Виберіть користувача";
                return;
            }

            $rootScope.errorMsg = '';
            $scope.saving.userPrecinct = true;
            // todo: factory method
            var raw = {
                "UserId": $scope.selected.userPrecinct.UserId,
                "PrecinctId": $scope.precinct.Id
            };

            if ($scope.addUserMode) {
                userData.saveUserPrecinct(raw, successHandler, errorHandler);
            } else {
                userData.updateUserPrecinct({ userId: oldValue.UserId, precinctId: oldValue.PrecinctId }, raw, successHandler, errorHandler);
            }

            function successHandler(res) {
                res.User = $scope.users.filter(function (user) { return res.UserId === user.Id })[0];
                $scope.saving.userPrecinct = false;
                if ($scope.addUserMode) {
                    $scope.userPrecincts.push(res);
                } else {
                    $scope.userPrecincts[ind] = res;
                }
                $scope.userPrecincts.sort(function (a, b) {
                    return a.User.FirstName.localeCompare(b.User.FirstName);
                });
                $scope.resetUserPrecinct();      
            };

        };

        $scope.addNewAddress = function () {
            $rootScope.errorMsg = '';
            $scope.resetAddress();
            $scope.addAddressMode = true;
            if ($scope.precinct && $scope.precinct.City) {
                $scope.selected.address.City = $scope.precinct.City;
                $scope.selected.address.CityId = $scope.precinct.City.Id;
            }
            $scope.selected.address.houseExceptBuilding = '';
            $scope.selected.address.HouseBuilding = '';
        };

        //todo: merge into one 'addNew' function like this:
        /* function addNew(propName){
              $rootScope.errorMsg = '';
              $scope.reset();
              $scope.addMode[propName] = true;
        }*/
        $scope.addNewPrecinctDistrict = function () {
            $rootScope.errorMsg = '';
            $scope.resetPrecinctDistrict();
            $scope.addDistrictMode = true;
        };

        $scope.addNewUserPrecinct = function () {
            $rootScope.errorMsg = '';
            $scope.resetUserPrecinct();
            $scope.addUserMode = true;
        };

        $scope.getTemplate = function (address, colName) {
            if (address === editableAddress) {
                return $scope.changingPresinct ? 'changePresinct' + colName : 'edit' + colName;
            } else return 'display' + colName;
        };
        //todo: merge into one 'getTemplate' function:
        $scope.getTemplateDistricts = function(precinctDistrict) {
            if (precinctDistrict === editablePrecinctDistrict) return 'editDistrict';
            else return 'displayDistrict';
        };

        $scope.getTemplateUsers = function(userPrecinct) {
            if(userPrecinct === editableUserPrecinct) return 'editUser';
            else return 'displayUser';
        };

        $scope.resetAddress = function () {
            $scope.addAddressMode = false;
            $scope.changingPresinct = false;
            $scope.selected.address = {};
            $scope.selected.newPrecinct = undefined;
            $scope.selected.newPrecinctId = 0;
            if (copyAddressMode) {
                var findInd = $scope.precinctAddresses.indexOf(editableAddress);
                if (findInd >= 0) {
                    $scope.precinctAddresses.splice(findInd, 1);
                }
            }
            copyAddressMode = false;
            editableAddress = undefined;
            $scope.validation.house.invalid = false;
        };

        //todo: merge into one 'reset' function like this:
        /* function reset(propName){
              $scope.addMode[propName] = false;
              $scope.selected[propName] = {};
              editable[propName] = undefined;
        }*/
        $scope.resetPrecinctDistrict = function() {
            $scope.addDistrictMode = false;
            $scope.selected.precinctDistrict = {};
            editablePrecinctDistrict = undefined;
        };

        $scope.resetUserPrecinct = function () {
            $scope.addUserMode = false;
            $scope.selected.userPrecinct = { };
            editableUserPrecinct = undefined;
        };

        function errorHandler(e) {
            $rootScope.errorMsg = '';
            $scope.saving = {};
            $scope.resetAddress();
            $scope.resetPrecinctDistrict();
            $scope.resetUserPrecinct();
            $rootScope.errorMsg = serviceUtil.getErrorMessage(e);
        };

        $scope.backToList = function () {
            $rootScope.errorMsg = '';
            var currPage = serviceUtil.getRouteParam("currPage") || 1;
            $location.path('/precincts/' + currPage);
        };

        $scope.autoCompleteAddresses = function () {

            if (!checkPrecinct()) return;

            if (!$scope.autocomplete.CityId) {
                $rootScope.errorMsg = "Населений пункт '" + $scope.autocomplete.City + "' не знайдено";
                return;
            }

            if (!$scope.autocomplete.StreetId) {
                $rootScope.errorMsg = "Вулицю '" + $scope.autocomplete.Street + "' не знайдено";
                return;
            }
            $rootScope.errorMsg = '';
            var startNumb, endNumb;
            startNumb = parseInt($scope.autocomplete.HouseFrom);
            endNumb = parseInt($scope.autocomplete.HouseTo);
            if (startNumb > endNumb || startNumb <= 0 || endNumb <= 0) {
                alert("Не вірно заданий інтервал номерів будинків!");
                return;
            }

            var ok = confirm("Буде створено " + (endNumb - startNumb + 1) + " адрес. Продовжити?");
            if (!ok) return;
            
            function getAddresses() {
                var arr = [], houseNumb;
                houseNumb = startNumb;
                while (houseNumb <= endNumb) {
                    var address = modelFactory.createObject('precinctAddress', $scope.autocomplete);
                    address.House = houseNumb.toString();
                    address.HouseNumber = houseNumb;
                    address.PrecinctId = $scope.precinct.Id;
                    arr.push(address);
                    houseNumb++;
                }
                return arr;
            };

            $scope.saving.autocompleteAddresses = true;
            var addresses = getAddresses();
            precinctDataService.resources.precinct.saveAll({ PrecinctAddresses: addresses }, function () {
                $scope.saving.autocompleteAddresses = false;
                addresses.forEach(function(item) {
                    item.City = $scope.autocomplete.City;
                    item.Street = $scope.autocomplete.Street;
                });
                $scope.precinctAddresses = $scope.precinctAddresses.concat(addresses);
                serviceUtil.sortAddresses($scope.precinctAddresses);
            }, errorHandler);
        };

        $scope.autoCompleteUserPrecincts = function () {
            if (!checkPrecinct()) return;
            $rootScope.errorMsg = '';
            var ok = confirm("Додати користувачів з роллю '" + $scope.autocomplete.role.Name + "'?");
            if (!ok) return;
            var conflictUserNames = [];
            usersHolder.getByRole($scope.autocomplete.role).forEach(function (user) {
                $scope.saving.autocompleteUserPrecincts = true;
                userData.saveUserPrecinct({ "UserId": user.Id, "PrecinctId": $scope.precinct.Id }, function (savedUserPrecinct) {
                    $scope.saving.autocompleteUserPrecincts = false;
                    savedUserPrecinct.User = user;
                    $scope.userPrecincts.push(savedUserPrecinct);
                    $scope.userPrecincts.sort(function (a, b) {
                        return a.User.FirstName.localeCompare(b.User.FirstName);
                    });
                }, function(err) {
                    $scope.saving.autocompleteUserPrecincts = false;
                    if (err && err.status === 409) {
                        conflictUserNames.push(user.FirstName);
                        if (conflictUserNames.length > 1 ) {
                            err.description = "Користувачі " + conflictUserNames.join(", ") + " вже закріплені за даною дільницею";
                        } else {
                            err.description = "Користувач " + conflictUserNames[0]+ " вже закріплений за даною дільницею";
                        }
                    }
                    $rootScope.errorMsg = serviceUtil.getErrorMessage(err);
                });
            });
        };

        $scope.onSelectStreet = function ($item, $model, $label, model) {
            model.Street = $item;
            model.StreetId = $model;
        };

        $scope.onSelectCity = function ($item, $model, $label, model) {
            model.City = $item;
            model.CityId = $model;
            model.RegionPart = $item.RegionPart;
            model.RegionPartId = model.RegionPart.Id;
        };

        $scope.onSelectPrecinctNumber = function (item) {
            $scope.selected.newPrecinctId = item.Id;
        };

        $scope.onSelectRegionPart = function ($item, $model, $label) {
            $scope.precinct.RegionPart = $item;
            $scope.precinct.RegionPartId = $model;
        };

        $scope.onSelectNeighborhood = function ($item, $model, $label) {
            $scope.precinct.Neighborhood = $item;
            $scope.precinct.NeighborhoodId = $model;
        };

        $scope.changePrecinct = function (address) {
            $scope.changingPresinct = true;
            editableAddress = address;
        };

        $scope.saveChangesPrecinct = function (selectedAddress) {
            if (!$scope.selected.newPrecinctId) {
                $rootScope.errorMsg = "Не вірний номер дільниці";
                return;
            };

            if ($scope.selected.newPrecinctId === $scope.precinct.Id) {
                $rootScope.errorMsg = "Номер нової дільниці співпадає з номером поточної дільниці";
                return;
            }

            $rootScope.errorMsg = '';
            $scope.saving.address = true;

            var address = modelFactory.createObject('precinctAddress', selectedAddress);
            address.PrecinctId = $scope.selected.newPrecinctId;
            precinctDataService.resources.address.update(serviceUtil.getAddressKey(address), address, function () {
                $scope.changingPresinct = false;
                $scope.saving.address = false;
                $scope.resetAddress();
                $scope.precinctAddresses.splice($scope.precinctAddresses.indexOf(selectedAddress), 1);
            }, errorHandler);
        };

        $scope.copyAddress = function (address, currInd) {
            $rootScope.errorMsg = '';
            copyAddressMode = true;
            var countDeleted = 0,
                prevInd = $scope.precinctAddresses.indexOf(editableAddress),
                ind = $scope.precinctAddresses.indexOf(address);
            if (prevInd >= 0) {
                var deleted = $scope.precinctAddresses.splice(prevInd, 1);
                if (prevInd < ind) countDeleted = deleted.length;
            }

            var copiedAddress = modelFactory.createObject('precinctAddress', address);
            copiedAddress.City = address.City;
            copiedAddress.Street = address.Street;

            $scope.precinctAddresses.splice(ind - countDeleted + 1, 0, copiedAddress);
            $scope.editAddress(copiedAddress);
            if (currInd + 1 === $scope.pagination.pageSize) $scope.pagination.currentPage++;
        };

        $scope.userRolesToString = function (user) {
            if (!user) return '';
            return user.Roles.map(function (userRole) {
                return userRole.Role.Name;
            }).join(', ');
        };

        $scope.getIndex = function (ind) {
            return ($scope.pagination.currentPage - 1) * $scope.pagination.pageSize + ind;
        };

        $scope.onPageChange = function(newPageNumber) {
            $scope.pagination.currentPage = newPageNumber;
        };

        $scope.onDblClickThead = function (propName) {
            if (!$scope.theadEditing) {
                $scope.theadEditing = {};
            }
            $scope.theadEditing[propName] = true;
        };

        $scope.doneEditingThead = function (propName) {
            $scope.theadEditing[propName] = false;
            $scope.query[propName] = undefined;
        };

        $scope.houseValidate = function () {
            $scope.validation.house.invalid = this.house.$invalid;
        };
    }]);

precinctControllers.controller('geocodingController', ['$scope', '$rootScope', '$timeout', 'precinctData', 'serviceUtil', 'refreshToken', 'modelFactory', function ($scope, $rootScope, $timeout, precinctData, serviceUtil, refreshToken, modelFactory) {
    var precincts,
        length,
        nextPrecinct,
        delay, // delay geocoding
        iter, // for calculate percent progress
        geocoder = new google.maps.Geocoder(),
        infowindow = new google.maps.InfoWindow(),
        mapOptions = {
            zoom: 8,
            center: new google.maps.LatLng(49.5880818, 34.5539573)
            //mapTypeId: google.maps.MapTypeId.ROADMAP
        },
        map = new google.maps.Map(document.getElementById("map"), mapOptions),
        bounds = new google.maps.LatLngBounds(),
        poltavaRegionBounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(48.658972672150036, 31.977831054687613),
            new google.maps.LatLng(50.675018227028374, 35.661003906250016)
        );

    function createMarker(add, lat, lng) {
        var contentString = add;
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, lng),
            map: map
        });

        google.maps.event.addListener(marker, 'click', function () {
            infowindow.setContent(contentString);
            infowindow.open(map, marker);
        });

        bounds.extend(marker.position);
        
    };

    function Delay (delay, stepIncrement, stepDecrement) {
        var initialVal = delay && delay > 0 ? delay : 0,
        value = initialVal, countInc = 0,
        stepInc = stepIncrement && stepIncrement > 0 ? stepIncrement : 0,
        stepDec = stepDecrement && stepDecrement > 0 ? stepDecrement : 0;
        this.increment = function () {
            countInc++;
            value += stepInc * countInc;
        };
        this.decrement = function () {
            if (value > initialVal) value -= stepDec * countInc;
        };
        this.getValue = function () {
            return value;
        };
    };

    function geocode(precinct, next) {
        var address;
        if (precinct && precinct.Street && precinct.City) {
            address = precinct.Street.StreetType.Name + precinct.Street.Name + "," + precinct.House + "," + precinct.City.CityType.Name + precinct.City.Name + "," + precinct.City.RegionPart.Name + " район,Полтавська область,Україна";
        } else {
            next();
            return;
        }
        geocoder.geocode({ 'address': address, 'bounds': poltavaRegionBounds, 'region': 'ua' }, function (results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                var location = results[0].geometry.location;
                precinct.lat = location.lat();
                precinct.lng = location.lng();
                precinct.location_type = results[0].geometry.location_type;
            } else {
                console.debug(precinct.Id + " [" + new Date().toLocaleString() + "] status: " + status);
                if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
                    nextPrecinct--;
                    delay.increment();
                    next();
                } else {
                    precinct.location_type = "NOT FOUND: " + status;
                }
            }
            if (status === google.maps.GeocoderStatus.OK) {
                var raw = modelFactory.createObject('precinct', precinct);
                precinctData.update({ id: precinct.Id }, raw, function () {
                    $rootScope.geocoging.progressNow = Math.round(iter++ / length * 100);
                    console.debug(precinct.Id + " [" + new Date().toLocaleString() + "] delay: " + delay.getValue());
                    delay.decrement();
                    next();
                }, function (err) {
                    err.description = "Геокодування дільниці " + precinct.Number + " не записано";
                    $rootScope.errorMsg = serviceUtil.getErrorMessage(err);
                });
            }
            //next();
        });
    };

    function getNextPrecinct() {
        if (nextPrecinct < length) {
            $timeout(function () {
                geocode(precincts[nextPrecinct], getNextPrecinct);
            }, delay.getValue());
            nextPrecinct++;
        }
        //if (nextPrecinct < precincts.length) {
        //    geocode(precincts[++nextPrecinct]);
        //    if (delay > initialDelay) delay -= decD;
        //}
    };

    function refreshTokenOnTimeout() {
        if (nextPrecinct < length) {
            refreshToken(function(res) {
                if (res.success) {
                    console.info("refresh token on timeout");
                    $timeout(function() {
                        refreshTokenOnTimeout();
                    }, 840000); // 14 minutes
                } else {
                    if (res.error) {
                        res.error.description = "Оновлення даних авторизації не відбулося";
                        $rootScope.errorMsg = serviceUtil.getErrorMessage(res.error);
                    }
                }
            });
        }
    };

    $scope.startGeociding = function () {
        $rootScope.geocoging = {};
        $rootScope.geocoging.isLoading = true;
        $rootScope.geocoging.progressNow = 0;
        precincts = [], length = 0, nextPrecinct = 0, iter = 1;
        precinctData.getAll({ filter: '&$filter=lat eq null and lng eq null' }, function (data) {
            precincts = data.value;
            length = precincts.length;
            refreshTokenOnTimeout();
            $rootScope.geocoging.isLoading = false;
            $rootScope.geocoging.isProgress = true;
            delay = new Delay(2000, 60000, 60000);
            geocode(precincts[0], getNextPrecinct);
        }, function(error) {
            $rootScope.geocoging.isLoading = false;
            error.description = 'Геокодування дільниць не виконано';
            $rootScope.errorMsg = serviceUtil.getErrorMessage(error);
        });
    };

    $scope.showMarkers = function () {
        if (!$scope.selected.RegionPartId) return;
        $scope.isMarkering = true;
        var precincts = [];
        precinctData.getByRegionPartId({ regionPartId: $scope.selected.RegionPartId }, function (data) {
            $scope.isMarkering = false;
            precincts = data.value;
            precincts.forEach(function (item) {
                var address = item.Street.StreetType.Name + item.Street.Name + ", " + item.House + ", " + item.City.CityType.Name + item.City.Name + ", " + item.City.RegionPart.Name + " р-н";
                createMarker(address, item.lat, item.lng);
            });
            map.fitBounds(bounds);
        }, function (error) {
            $scope.isMarkering = false;
            error.description = 'Маркування дільниць не виконано';
            $rootScope.errorMsg = serviceUtil.getErrorMessage(error);
        });
    };

    $scope.onSelectRegionPart = function ($item, $model, $label) {
        $scope.selected.RegionPart = $item;
        $scope.selected.RegionPartId = $model;
    };
}]);