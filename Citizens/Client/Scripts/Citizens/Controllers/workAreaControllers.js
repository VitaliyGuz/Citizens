'use strict';

var workAreaControllers = angular.module('workAreaControllers', ['workAreaServices']);

workAreaControllers.controller("listWorkAreasController", ['$location', '$rootScope', '$scope', 'config', 'serviceUtil', 'workAreaResource', 'filterSettings',
    function ($location, $rootScope, $scope, config, serviceUtil, workAreaResource, filterSettings) {
        
        $rootScope.pageTitle = 'Робочі дільниці';
        $scope.tableHead = [
            '№',
            'Номер',
            'Топ',
            'Район',
            'Адреси',
            'К-сть виборців',
            'Планова к-сть старших',
            'Факт. к-сть старших',
            '% старших',
            'Явка',
            'К-сть необхідних голосів',
            'К-сть домогосподарств',
            'Дії'
        ];
        $scope.loader = {};

        var workAreasQuery = filterSettings.get('workAreas');
        if (workAreasQuery) {
            $scope.query = workAreasQuery;
            $scope.queryBy = Object.keys(workAreasQuery)[0];
        } else {
            $scope.query = {};
            $scope.queryBy = 'Precinct/Number';
        }

        $scope.pagination = {
            currentPage: serviceUtil.getRouteParam("currPage") || 1,
            pageSize: config.pageSize,
            totalItems: 0
        };

        function getSkip() {
            return ($scope.pagination.currentPage - 1) * $scope.pagination.pageSize || 0;
        };

        getWorkAreasPage();

        $scope.calcPeopleAtPrecincts = function () {
            if (!$scope.workAreas || $scope.workAreas.length === 0) return;
            $scope.loader.calcPeople = true;
            var total = $scope.workAreas.length, count = 0;

            //----------------------------------- one request with many items ----------------------------------
            //var workAreasIds = $scope.workAreas.map(function (wa) {
            //    return wa.Id;
            //});
            //workAreaResource.caclComputedProperties({ "WorkAreaIds": workAreasIds }, function (resp) {
            //    if (resp) {
            //        $scope.workAreas.forEach(function (wa) {
            //            var computedProps = resp.value.filter(function (c) {
            //                return c.Id === wa.Id;
            //            })[0];
            //            if (computedProps) {
            //                Object.keys(computedProps).forEach(function(prop){
            //                    wa[prop] = computedProps[prop];
            //                });
            //                wa.countMajorsPlan = Math.round(wa.CountElectors * 0.033);
            //                wa.percentageMajors = Math.round(wa.CountMajors * 100 / wa.countMajorsPlan);
            //                wa.voterTurnout = Math.round(wa.CountElectors * 0.55);
            //                wa.requiredVotes = Math.round(wa.CountElectors * 0.33);
            //            };
            //        });
            //        $scope.loader.calcPeople = false;
            //    }
            //}, errorHandler);

            //----------------------------------- many requests with one item ----------------------------------
            $scope.workAreas.forEach(function (wa) {
                workAreaResource.caclComputedProperties({ "WorkAreaIds": [wa.Id] }, function (resp) {
                    if (resp) {
                        if (resp.value.length > 0) {
                            var computedProps = resp.value[0];
                            Object.keys(computedProps).forEach(function (prop) {
                                wa[prop] = computedProps[prop];
                            });
                            wa.countMajorsPlan = Math.round(wa.CountElectors * 0.55 * 0.27 / 10);
                            wa.percentageMajors = Math.round(wa.CountMajors * 100 / wa.countMajorsPlan);
                            wa.voterTurnout = Math.round(wa.CountElectors * 0.55);
                            wa.requiredVotes = Math.round(wa.CountElectors * 0.55 * 0.27);
                        }
                        count++;
                        if(count === total)  $scope.loader.calcPeople = false;
                    }
                }, errorHandler);
            });
        };

        function getWorkAreasPage() {
            $scope.loader.loadingWorkAreas = true;
            var filterQuery = getODataFilterQuery();
            if (filterQuery) filterQuery = "&$filter=" + filterQuery; 
            workAreaResource.getPageItems({ skip: getSkip(), filter: filterQuery }, successHandler, errorHandler);
        };

        function getODataFilterQuery() {
            var filterStr, filterPattern = "indexof(cast(:fieldName,Edm.String), ':val') ge 0";
            if ($scope.query && $scope.query[$scope.queryBy]) {
                filterStr = filterPattern.replace(':fieldName', $scope.queryBy).replace(':val', $scope.query[$scope.queryBy]);
            }
            //console.log(filterStr);
            return filterStr;
        };

        function successHandler(data) {
            $rootScope.errorMsg = '';
            $scope.loader.loadingWorkAreas = false;
            $scope.workAreas = data.value;
            $scope.pagination.totalItems = data['@odata.count'];
        };

        $scope.getIndex = function (ind) {
            return getSkip() + ind + 1;
        };

        $scope.edit = function (workArea) {
            $rootScope.errorMsg = '';
            $location.url('/work-area/' + workArea.Id + '/' + $scope.pagination.currentPage).search("precinctId", workArea.PrecinctId);
        };

        $scope.delete = function (workArea) {
            if (config.checkDeleteItem) {
                var ok = confirm("Увага! Робочу дільницю " + workArea.Precinct.Number + "." + workArea.Number + " буде видалено, продовжити?");
                if (!ok) return;
            }
            $rootScope.errorMsg = '';
            workAreaResource.remove({ id: workArea.Id }, function () {
                getWorkAreasPage();
            }, function(err) {
                err.description = "За робочою дільницею закріплені адреси";
                errorHandler(err);
            });
        };        

        $scope.addWorkArea = function () {
            $rootScope.errorMsg = '';
            $location.url('/work-area/new/' + $scope.pagination.currentPage);
        };

        function errorHandler(e) {
            $scope.loader = {};
            $rootScope.errorMsg = serviceUtil.getErrorMessage(e);
        };

        $scope.onPageChange = function (newPageNumber) {
            $location.url("/work-areas/" + newPageNumber);
        };

        $scope.applyFilter = function () {
            if ($scope.query[$scope.queryBy]) {
                filterSettings.set('workAreas', $scope.query);
            } else {
                filterSettings.remove('workAreas');
            }
            getWorkAreasPage();
        };
    }]);

workAreaControllers.controller("editWorkAreaController", ['$location', '$rootScope', '$scope', '$modal', '$q', 'serviceUtil', 'config', 'precinctData', 'precinctAddressesData', 'resolvedData', 'workAreaResource', 'modelFactory', 'houseTypes', 'peopleDataService',
    function ($location, $rootScope, $scope, $modal,$q, serviceUtil, config, precinctData, precinctAddressesData, resolvedData, workAreaResource, modelFactory, houseTypes, peopleDataService) {
        
        $rootScope.pageTitle = 'Робоча дільниця';
        $scope.loader = {};
        var tabs = ["tabMajors", "tabAddresses", "tabEditMajors"],
            checkedPages = {tabEditMajors: []};
        $scope.pagination = {
            currentPage: { },
            pageSize: config.pageSizeTabularSection
        };
        $scope.tabActive = {};
        tabs.forEach(function(tab) {
            $scope.pagination.currentPage[tab] = 1;
            $scope.tabActive[tab] = false;
        });

        $scope.query = {};
        $scope.totalCount = {workArea: 0, precinct: 0, supporters: 0};
        
        $scope.data = resolvedData;
        $scope.data.houseTypes = houseTypes;
        if (!$scope.data.precinctAddresses) $scope.data.precinctAddresses = [];
        if (!$scope.data.majors) $scope.data.majors = [];
        if (!$scope.data.workAreaAddresses) $scope.data.workAreaAddresses = [];

        if ($scope.data.workArea) {
            if (resolvedData.appointedTop) {
                $scope.tabActive.tabAddresses = true;
                $scope.data.workArea.Top = resolvedData.appointedTop;
            } else if (resolvedData.appointedMajor) {
                $scope.tabActive.tabEditMajors = true;
                $scope.data.selected = { person: resolvedData.appointedMajor };
                $scope.data.selected.person.label = peopleDataService.getPersonLabel(resolvedData.appointedMajor);
            } else {
                $scope.tabActive.tabAddresses = true;
            }
            $scope.data.workArea.Top.label = peopleDataService.getPersonLabel($scope.data.workArea.Top);
        } else {
            $scope.tabActive.tabAddresses = true;
        }

        $scope.saveChanges = function () {

            if (!$scope.data.workArea.Number) {
                $rootScope.errorMsg = "Не вказано номер робочої дільницю";
                return;
            }

            if ($scope.data.workArea.Precinct && !$scope.data.workArea.Precinct.Id) {
                $rootScope.errorMsg = "Дільницю '" + $scope.data.workArea.Precinct + "' не знайдено";
                return;
            }

            if ($scope.data.workArea.Top && !$scope.data.workArea.Top.Id) {
                $rootScope.errorMsg = "Фізособу '" + $scope.data.workArea.Top + "' не знайдено";
                return;
            }

            $rootScope.errorMsg = '';
            $scope.loader.saving = true;

            var addMode = !$scope.data.workArea.Id;
            var modelWorkArea = modelFactory.createObject('workArea', $scope.data.workArea);
            modelWorkArea.PrecinctId = $scope.data.workArea.Precinct.Id;
            if ($scope.data.workArea.Top && $scope.data.workArea.Top.Id) {
                modelWorkArea.TopId = $scope.data.workArea.Top.Id;
            } else {
                modelWorkArea.TopId = 0;
            }
            
            if (addMode) {
                workAreaResource.save(modelWorkArea, updatePrecinctAddresses, errorHandler);
            } else {
                workAreaResource.update({ id: $scope.data.workArea.Id }, modelWorkArea, updatePrecinctAddresses, errorHandler);
            }

            function updatePrecinctAddresses(newWorkArea) {
                if (addMode) {
                    $scope.data.workArea.Id = newWorkArea.Id;
                    $scope.data.workAreaId = newWorkArea.Id;//don't remove
                }
                var addressesForUpdate = $scope.data.precinctAddresses.filter(function(a) {
                    return a.isDeselected || a.isSelected;
                });
                var count = 0, total = addressesForUpdate.length;
                if (total === 0) {
                    successHandler();
                    return;
                }
                addressesForUpdate.forEach(function (address) {
                    var modelAddress = modelFactory.createObject("precinctAddress", address);
                    if (address.isDeselected) modelAddress.WorkAreaId = null;
                    if (address.isSelected) modelAddress.WorkAreaId = $scope.data.workArea.Id;

                    precinctAddressesData.update(serviceUtil.getAddressKey(modelAddress), modelAddress, function(resp) {
                        address.WorkAreaId = resp.WorkAreaId;
                        address.isDeselected = false;
                        address.isSelected = false;
                        count++;
                        if (count === total) successHandler();
                    }, errorHandler);
                });
            };

            function successHandler() {
                $scope.loader.saving = false;
                $rootScope.successMsg = addMode ? 'Робочу дільницю успішно створено!' : 'Зміни успішно збережено!';
                addMode = false;
            };
        };

        function errorHandler(e) {
            $scope.loader = {};
            $rootScope.errorMsg = serviceUtil.getErrorMessage(e);
        };

        $scope.backToList = function () {
            $rootScope.errorMsg = '';
            var currPage = serviceUtil.getRouteParam("currPage") || 1;
            $location.url('/work-areas/' + currPage);
        };

        $scope.getIndex = function (ind,tab) {
            return ($scope.pagination.currentPage[tab] - 1) * $scope.pagination.pageSize + ind;
        };

        $scope.onPageChange = function(newPageNumber,tab) {
            $scope.pagination.currentPage[tab] = newPageNumber;
        };

        $scope.onDblClickThead = function (propName) {
            if (!$scope.theadEditing) {
                $scope.theadEditing = {};
            }
            $scope.theadEditing[propName] = true;
        };

        $scope.doneEditingThead = function (propName) {
            $scope.theadEditing[propName] = false;
            $scope.query[propName] = $;
        };

        $scope.checked = function (address, isPrecinctAddress) {
            if (isPrecinctAddress) {
                return (address.WorkAreaId && address.WorkAreaId === $scope.data.workArea.Id) | address.isSelected;
            } else {
                return address.isSelected;
            }
        };

        $scope.toggleSelection = function (address, isPrecinctAddress) {
            if (isPrecinctAddress) {
                if (address.WorkAreaId && address.WorkAreaId === $scope.data.workArea.Id) {
                    address.isDeselected = address.isDeselected ? false : true;
                    if (address.countPeople) {
                        if (address.isDeselected) {
                            $scope.totalCount.workArea -= address.countPeople;
                        } else {
                            $scope.totalCount.workArea += address.countPeople;
                        }
                    }

                } else {
                    address.isSelected = address.isSelected ? false : true;
                    if (address.countPeople) {
                        if (address.isSelected) {
                            $scope.totalCount.workArea += address.countPeople;
                        } else {
                            $scope.totalCount.workArea -= address.countPeople;
                        }
                    }
                }
            } else {
                address.isSelected = !address.isSelected;
            }
        };

        $scope.markAddress = function (address) {
            if (address.WorkAreaId && address.WorkAreaId === $scope.data.workArea.Id) {
                return address.isDeselected ? "alert-danger" : "alert-success";
            } else {
                return address.isSelected ? "alert-warning" : "";
            }
        };

        $scope.getPeopleByName = peopleDataService.typeaheadPersonByNameFn();

        $scope.onSelectPrecinct = function(item) {
            $scope.loader.loadingPrecinctAddresses = true;
            precinctAddressesData.getAllByPrecinctId({ precinctId: item.Id }, function(res) {
                $scope.loader.loadingPrecinctAddresses = false;
                serviceUtil.sortAddresses(res.value);
                $scope.data.precinctAddresses = res.value;
                $scope.totalCount.workArea = 0;
                $scope.totalCount.precinct = 0;
            }, function(err) {
                $scope.data.precinctAddresses = [];
                errorHandler(err);
            });
        };

        $scope.calcPeopleAtAddresses = function () {
            if (!$scope.data.workArea || !$scope.data.workArea.PrecinctId) return;
            $scope.loader.calcPeople = true;
            $scope.totalCount.workArea = 0;
            $scope.totalCount.precinct = 0;

            workAreaResource.getCountPeopleByPrecinct({ "precinctId": $scope.data.workArea.PrecinctId }, function (resp) {
                if (resp) {
                    $scope.data.precinctAddresses.forEach(function (a) {
                         var finded = resp.value.filter(function (c) {
                            return c.CityId === a.CityId && c.StreetId === a.StreetId && c.House.toLocaleLowerCase() === a.House.toLocaleLowerCase();
                         })[0];
                         if (finded) {
                             a.countPeople = finded.CountPeople;
                             if (a.WorkAreaId === $scope.data.workArea.Id) $scope.totalCount.workArea += finded.CountPeople;
                             $scope.totalCount.precinct += finded.CountPeople;
                         }
                    });
                    $scope.loader.calcPeople = false;
                }
            }, errorHandler);
        };
        
        $scope.getMajors = function () {
            if (!$scope.data.workArea || !$scope.data.workArea.Id) return;
            $scope.loader.loadingMajors = true;
            $scope.totalCount.supporters = 0;
            
            workAreaResource.getMajors({ "id": $scope.data.workArea.Id }, function (resp) {
                if (resp) {
                    $scope.loader.loadingMajors = false;
                    $scope.data.majors = resp.value;
                    $scope.totalCount.supporters = $scope.data.majors.reduce(function (sum, curr) {
                        return sum + curr.CountSupporters;
                    },0);
                }
            }, errorHandler);
        };

        function equalsAddresses(a, b) {
            var equalsApartmentStr = a.ApartmentStr && b.ApartmentStr ? a.ApartmentStr.toLocaleLowerCase() === b.ApartmentStr.toLocaleLowerCase() : a.ApartmentStr === b.ApartmentStr;
            return a.CityId === b.CityId &&
                    a.StreetId === b.StreetId &&
                    a.House.toLocaleLowerCase() === b.House.toLocaleLowerCase() &&
                    a.Apartment === b.Apartment && equalsApartmentStr;
        };

        function reduceToAddresses(supporters) {
            var addresses = supporters.reduce(function (result, curr) {
                var address = {
                    CityId: curr.CityId,
                    StreetId: curr.StreetId,
                    House: curr.House,
                    Apartment: curr.Apartment,
                    ApartmentStr: curr.ApartmentStr,
                    Major: curr.Major
                };
                var isContains = result.some(function (i) { return equalsAddresses(address, i) });
                if (!isContains) result.push(address);
                return result;
            }, []);
            addresses.forEach(serviceUtil.expandAddress);
            serviceUtil.sortAddresses(addresses);
            return addresses;
        };

        $scope.getSupporters = function () {
            if (!$scope.data.workArea || !$scope.data.workArea.Id) return;
            $scope.loader.loadingSupporters = true;
            workAreaResource.getSupporters({ "id": $scope.data.workArea.Id }, function (resp) {
                if (resp) {
                    $scope.data.supporters = resp.value;
                    $scope.data.workAreaAddresses = reduceToAddresses(resp.value);
                    $scope.loader.loadingSupporters = false;
                }
            }, errorHandler);
        };

        $scope.linkMajors = function () {
            $rootScope.errorMsg = '';

            if ($scope.data.workAreaAddresses.length === 0) return;
            
            if ($scope.data.selected.person && !$scope.data.selected.person.Id && !$scope.data.selected.setEmptyPerson) {
                $rootScope.errorMsg = "Фізособу '" + $scope.data.selected.person + "' не знайдено";
                return;
            }

            var selectedAddresses = $scope.data.workAreaAddresses.filter(function (a) { return a.isSelected });
            var savingPeople = $scope.data.supporters.filter(function (p) {
                return selectedAddresses.some(function (a) { return equalsAddresses(p, a) });
            });
            var total = savingPeople.length, count = 0;
            if (total === 0) return;
            $scope.loader.savingPeople = true;
            savingPeople.forEach(function (person) {
                var personModel = modelFactory.createObject("person", person);
                if ($scope.data.selected.setEmptyPerson) {
                    personModel.MajorId = 0;
                } else {
                    personModel.MajorId = $scope.data.selected.person.Id;
                }
                peopleDataService.resource.update({ id: person.Id }, personModel, function () {
                    count++;
                    var adr = $scope.data.workAreaAddresses.filter(function (a) {
                        return equalsAddresses(person,a);
                    })[0];
                    if (adr) {
                        adr.isSelected = false;
                        if ($scope.data.selected.setEmptyPerson) {
                            adr.Major = undefined;
                        } else {
                            adr.Major = $scope.data.selected.person;
                        }
                    }
                    if (count === total) $scope.loader.savingPeople = false;
                }, errorHandler);
            });
        };

        $scope.clearTop = function() {
            $scope.data.workArea.Top = undefined;
            $scope.data.workArea.TopId = 0;
        };

        $scope.selectAll = function(tabName) {
            if (tabName === 'tabEditMajors') {
                if ($scope.data.workAreaAddresses) {
                    var startInd = $scope.getIndex(0, tabName),
                        endInd = startInd + $scope.pagination.pageSize,
                        currPage = $scope.pagination.currentPage[tabName],
                        isChecked = false, foundInd = checkedPages[tabName].indexOf(currPage);
                    if (foundInd >= 0) {
                        isChecked = true;
                        checkedPages[tabName].splice(foundInd,1);
                    } else {
                        checkedPages[tabName].push(currPage);
                    }
                    for (var i = startInd; i < endInd; i++) {
                        $scope.data.workAreaAddresses[i].isSelected = !isChecked;
                    }
                }
            }
        };

        $scope.checkedCurrentPage = function (tabName) {
            if (tabName === 'tabEditMajors') {
                return checkedPages[tabName].indexOf($scope.pagination.currentPage[tabName]) >= 0;
            }
            return false;
        };

        $scope.showApartments = function(address) {
            openModalFullAddresses('getSupportersByAddress', {
                id: $scope.data.workArea.Id,
                cityId: address.CityId,
                streetId: address.StreetId,
                house: address.House
            }, true);
        };

        $scope.showFullAddresses = function (major) {
            openModalFullAddresses('getSupportersByMajor', {
                id: $scope.data.workArea.Id,
                majorId: major.Id
            });
        };

        function openModalFullAddresses(method,params,onlyApartmens)  {
            $modal.open({
                animation: false,
                templateUrl: 'Views/Modals/addresses.html',
                controller: 'modalFullAddressesCtrl',
                backdrop: 'static',
                //scope: $scope, // parent scope
                resolve: {
                    addresses: function () {
                        var def = $q.defer();
                        workAreaResource[method](params, function (resp) {
                            var addresses = reduceToAddresses(resp.value);
                            if (onlyApartmens) addresses = addresses.filter(function(a) {
                                return a.ApartmentStr;
                            });
                            def.resolve(addresses);
                        }, function(err) {
                            $rootScope.errorMsg = serviceUtil.getErrorMessage(err);
                            def.reject();
                        });
                        return def.promise;
                    }
                }
            });
        };
}]);

workAreaControllers.controller('modalFullAddressesCtrl', ['$scope', '$modalInstance', 'addresses', function ($scope, $modalInstance, addresses) {

    $scope.addresses = addresses;
    
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
}]);
