'use strict';

var workAreaControllers = angular.module('workAreaControllers', ['workAreaServices', 'printService']);

workAreaControllers.controller("listWorkAreasController", ['$location', '$rootScope', '$scope', 'config', 'serviceUtil', 'workAreaResource', 'filterSettings', 'peopleDataService',
    function ($location, $rootScope, $scope, config, serviceUtil, workAreaResource, filterSettings, peopleDataService) {
        
        $rootScope.pageTitle = 'Робочі дільниці';
        $scope.tableHead = [
            '№',
            'Номер',
            'Топ',
            'Район',
            'Адреси',
            'К-сть\n прихильників',
            'К-сть\n виборців',
            'Планова\n к-сть\n старших',
            'Факт.\n к-сть\n старших',
            '% старших',
            'Явка',
            'К-сть\n необхідних\n голосів',
            'К-сть\n домо-\nгосподарств',
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

        $scope.stringLimit = 100;

        function getSkip() {
            return ($scope.pagination.currentPage - 1) * $scope.pagination.pageSize || 0;
        };

        getWorkAreasPage();

        $scope.calcPeopleAtPrecincts = function () {
            $rootScope.errorMsg = '';
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
            //                wa.countMajorsPlan = serviceUtil.computational.countMajorsPlan(wa.CountElectors);
            //                wa.percentageMajors = Math.round(wa.CountMajors * 100 / wa.countMajorsPlan);
            //                wa.voterTurnout = serviceUtil.computational.voterTurnout(wa.CountElectors);
            //                wa.requiredVotes = serviceUtil.computational.requiredVotes(wa.CountElectors);
            //            };
            //        });
            //        $scope.loader.calcPeople = false;
            //    }
            //}, errorHandler);

            //----------------------------------- many requests with one item ----------------------------------
            peopleDataService.additionalPropsResource.getValues({ filter: "&$filter=Value eq 'прихильник' and PropertyKey/Name eq 'статус'" }, function (propValue) {
                var proponentPropertyId = propValue.value[0] ? propValue.value[0].Id : 0;
                $scope.workAreas.forEach(function (wa) {
                    workAreaResource.caclComputedProperties({ "WorkAreaIds": [wa.Id], "ProponentPropertyId": proponentPropertyId }, function (resp) {
                        if (resp) {
                            var computedProps = resp.value[0];
                            if (computedProps) {
                                Object.keys(computedProps).forEach(function (prop) {
                                    wa[prop] = computedProps[prop];
                                });
                                wa.addressesLen = wa.AddressesStr.length;
                                wa.countMajorsPlan = serviceUtil.computational.countMajorsPlan(wa.CountElectors);
                                wa.percentageMajors = Math.round(wa.CountMajors * 100 / wa.countMajorsPlan);
                                wa.voterTurnout = serviceUtil.computational.voterTurnout(wa.CountElectors);
                                wa.requiredVotes = serviceUtil.computational.requiredVotes(wa.CountElectors);
                            }
                            count++;
                            if (count === total) $scope.loader.calcPeople = false;
                        }
                    }, errorHandler);
                });
            },errorHandler);
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

        //$scope.edit = function (workArea) {
        //    $rootScope.errorMsg = '';
        //    $location.url('/work-area/' + workArea.Id + '/' + $scope.pagination.currentPage).search("precinctId", workArea.PrecinctId);
        //};

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

workAreaControllers.controller("editWorkAreaController", ['$location', '$rootScope', '$scope', '$modal', '$q', '$routeParams', 'serviceUtil', 'config', 'precinctDataService', 'resolvedData', 'workAreaDataService', 'modelFactory', 'peopleDataService', 'printer',
    function ($location, $rootScope, $scope, $modal, $q, $routeParams, serviceUtil, config, precinctDataService, resolvedData, workAreaDataService, modelFactory, peopleDataService, printer) {

        activate();

        function activate() {
            $rootScope.pageTitle = 'Робоча дільниця';

            $scope.loader = {};

            $scope.tabs = {
                addresses: {
                    isActive: false,
                    tplUrl: config.pathPartialTemplates + '/workarea.addresses.html',
                    link: getTabLink('addresses')
                    /*checkedPages: [],
                    currPage: 1,
                    pageSize: config.pageSizeTabularSection*/
                },
                majors: {
                    isActive: false,
                    tplUrl: config.pathPartialTemplates + '/workarea.majors.html',
                    link: getTabLink('majors')
                    /*checkedPages: [],
                    currPage: 1,
                    pageSize: config.pageSizeTabularSection*/
                },
                editMajors: {
                    isActive: false,
                    tplUrl: config.pathPartialTemplates + '/workarea.edit.majors.html',
                    link: getTabLink('editMajors')
                    /*checkedPages: [],
                    currPage: 1,
                    pageSize: config.pageSizeTabularSection*/
                }
            };

            function getTabLink(tabName) {
                var queryParams = $location.search();
                if (!queryParams) return '';
                queryParams.tab = tabName;
                var q = '?';
                Object.keys(queryParams).forEach(function (key) {
                    if (q.length > 1) q += '&';
                    q += key + '=' + queryParams[key];
                });
                return $location.path() + q;
            };

            var activeTab = $routeParams.tab || 'addresses';
            $scope.tabs[activeTab].isActive = true;

            $scope.query = {};
            $scope.totalCount = { workArea: 0, precinct: 0, supporters: 0 };

            $scope.data = resolvedData;
            $scope.data.houseTypes = precinctDataService.houseTypes;
            $scope.data.workAreaAddresses = [];

            if ($scope.data.workArea) {
                if (resolvedData.appointedTop) {
                    $scope.data.workArea.Top = resolvedData.appointedTop;
                }
                if (resolvedData.appointedMajor) {
                    $scope.data.selected = { person: resolvedData.appointedMajor };
                    $scope.data.selected.person.label = peopleDataService.getPersonLabel(resolvedData.appointedMajor);
                }
                $scope.data.workArea.Top.label = peopleDataService.getPersonLabel($scope.data.workArea.Top);
                if ($scope.tabs.addresses.isActive) calcTolatPeople();

                if ($scope.tabs.majors.isActive) calcTotalSupporters();

                if ($scope.tabs.editMajors.isActive)
                    $scope.data.workAreaAddresses = workAreaDataService.reduceToAddresses($scope.data.supporters);
            }
            
        };

        $scope.getPrecinctsByNumber = precinctDataService.typeaheadPrecinctByNumber;

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
                workAreaDataService.resource.save(modelWorkArea, updatePrecinctAddresses, $scope.errorHandler);
            } else {
                workAreaDataService.resource.update({ id: $scope.data.workArea.Id }, modelWorkArea, updatePrecinctAddresses, $scope.errorHandler);
            }

            function updatePrecinctAddresses(workArea) {
                if (addMode) {
                    $scope.data.workArea.Id = workArea.Id;
                    $scope.data.workAreaId = workArea.Id;//don't remove
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

                    precinctDataService.resources.address.update(serviceUtil.getAddressKey(modelAddress), modelAddress, function (resp) {
                        address.WorkAreaId = resp.WorkAreaId;
                        address.isDeselected = false;
                        address.isSelected = false;
                        count++;
                        if (count === total) successHandler();
                    }, $scope.errorHandler);
                });
            };

            function successHandler() {
                $scope.loader.saving = false;
                $rootScope.successMsg = addMode ? 'Робочу дільницю успішно створено!' : 'Зміни успішно збережено!';
                addMode = false;
            };
        };

        $scope.errorHandler = function (e) {
            $scope.loader = {};
            $rootScope.errorMsg = serviceUtil.getErrorMessage(e);
        };

        $scope.backToList = function () {
            $rootScope.errorMsg = '';
            var currPage = serviceUtil.getRouteParam("currPage") || 1;
            $location.url('/work-areas/' + currPage);
        };

        /*$scope.getIndex = function (ind, tab) {
            return ($scope.tabs[tab].currPage - 1) * $scope.tabs[tab].pageSize + ind;
        };

        $scope.onPageChange = function(newPageNumber, tab) {
            $scope.tabs[tab].currPage = newPageNumber;
        };*/          

        $scope.getPeopleByName = peopleDataService.typeaheadPersonByName;

        $scope.refreshTabAddresses = function () {
            if (!$scope.data.workArea || !$scope.data.workArea.Precinct || !$scope.data.workArea.Precinct.Id) return;
            $scope.loader.loadingPrecinctAddresses = true;
            workAreaDataService.asyncGetPrecinctAddresses($scope.data.workArea.Precinct.Id).then(function (addresses) {
                $scope.data.precinctAddresses = addresses;
                calcTolatPeople();
                $scope.loader.loadingPrecinctAddresses = false;
            }, $scope.errorHandler);
        };

        $scope.refreshTabMajors = function () {
            if (!$scope.data.workArea || !$scope.data.workArea.Id) return;
            $scope.loader.loadingMajors = true;
            workAreaDataService.resource.getMajors({ "id": $scope.data.workArea.Id }, function (resp) {
                $scope.loader.loadingMajors = false;
                $scope.data.majors = resp.value;
                calcTotalSupporters();
            }, $scope.errorHandler);
        };

        $scope.refreshTabEditMajors = function () {
            if (!$scope.data.workArea || !$scope.data.workArea.Id) return;
            $scope.loader.loadingSupporters = true;
            workAreaDataService.resource.getSupporters({ id: $scope.data.workArea.Id, expand: "$expand=Major" }, function (resp) {
                $scope.data.supporters = resp.value;
                $scope.data.workAreaAddresses = workAreaDataService.reduceToAddresses(resp.value);
                $scope.loader.loadingSupporters = false;
            }, $scope.errorHandler);
        };        

        $scope.clearTop = function() {
            $scope.data.workArea.Top = undefined;
            $scope.data.workArea.TopId = 0;
        };

        $scope.selectTab = function (tabName) {
            $location.search('tab', tabName);

            if (tabName === 'addresses' && $scope.data.precinctAddresses.length === 0)
                $scope.refreshTabAddresses();

            if (tabName === 'majors' && $scope.data.majors.length === 0)
                $scope.refreshTabMajors();

            if (tabName === 'editMajors' && $scope.data.supporters.length === 0)
                $scope.refreshTabEditMajors();
        };

        $scope.onSelectPrecinct = function () {
            $scope.data.precinctAddresses = [];
            $scope.refreshTabAddresses();
        };

        function calcTotalSupporters() {
            $scope.totalCount.supporters = $scope.data.majors.reduce(function (sum, curr) {
                return sum + curr.CountSupporters;
            }, 0);
        };

        $scope.calcTotalSupporters = calcTotalSupporters; // for using in child scope

        function calcTolatPeople() {
            $scope.totalCount.workArea = 0;
            $scope.totalCount.precinct = 0;
            $scope.data.precinctAddresses.forEach(function (address) {
                if (address.WorkAreaId === $scope.data.workArea.Id) $scope.totalCount.workArea += address.countPeople;
                $scope.totalCount.precinct += address.countPeople;
            });
        };

        $scope.openModalFullAddresses = function (params, onlyApartmens) {
            $modal.open({
                animation: false,
                templateUrl: config.pathModalTemplates + '/addresses.html',
                controller: 'modalFullAddressesCntl',
                backdrop: 'static',
                //scope: $scope, // parent scope
                resolve: {
                    addresses: function () {
                        var def = $q.defer();
                        workAreaDataService.resource.getSupporters(params, function (resp) {
                            var addresses = workAreaDataService.reduceToAddresses(resp.value);
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

        $scope.print = function () {
            if (!$scope.data.workArea.Id) return;
            $scope.loader.preparingPrint = true;
            var printData = {};
            printData.workArea = $scope.data.workArea;

            $q.all({
                computedProps: getComputedPropertiesPromise(),
                majors: workAreaDataService.resource.getMajors({ "id": $scope.data.workArea.Id }).$promise,
                phonePropertyKey: peopleDataService.additionalPropsResource.getKeys({ "filter": "&$filter=Name eq 'тел. моб.'" }).$promise,
                proponentPropertyValue: peopleDataService.additionalPropsResource.getValues({ filter: "&$filter=Value eq 'прихильник' and PropertyKey/Name eq 'статус'" }).$promise
            }).then(function (resp) {
                Object.keys(resp.computedProps).forEach(function(prop) {
                    printData[prop] = resp.computedProps[prop];
                });
                printData.majors = resp.majors.value;
                var promises = {};                
                if (resp.phonePropertyKey.value.length > 0) {
                    var phonePropertyKeyId = resp.phonePropertyKey.value[0].Id;
                    promises.majorsPhoneNumbers = peopleDataService.additionalPropsResource.getRange({ "Keys": getKeys(phonePropertyKeyId) }).$promise;
                }
                if (resp.proponentPropertyValue.value.length > 0) {
                    var proponentPropertyValueId = resp.proponentPropertyValue.value[0].Id;
                    var filterQuery = "PersonAdditionalProperties/any(p:p/PropertyValueId eq propValueId)".replace(/propValueId/, proponentPropertyValueId);
                    promises.workAreaProponents = workAreaDataService.resource.getSupporters({ id: $scope.data.workArea.Id, filter: "$filter=" + filterQuery }).$promise;
                }
                $q.all(promises).then(function (resp) {
                    printData.majors.forEach(function (major) {
                        var phoneNumber = resp.majorsPhoneNumbers.value.filter(function (p) { return p.PersonId === major.Id })[0];
                        if (phoneNumber) major.phoneNumber = phoneNumber.StringValue;
                        major.proponents = resp.workAreaProponents.value.filter(function (p) { return p.MajorId === major.Id });
                    });
                    $scope.loader.preparingPrint = false;
                    printer.print(config.pathPrintTemplates + "/workarea.print.html", printData);
                }, $scope.errorHandler);
            }, $scope.errorHandler);

            function getKeys(propertyKeyId) {
                return printData.majors.map(function (m) {
                    return {PersonId: m.Id, PropertyKeyId: propertyKeyId};
                });
            };

            function getComputedPropertiesPromise() {
                return workAreaDataService.resource.caclComputedProperties({ "WorkAreaIds": [$scope.data.workArea.Id] }).$promise
                    .then(function (resp) {
                        var data = {};
                        if (resp && resp.value.length > 0) {
                            var computedProps = resp.value[0];
                            data.countElectors = computedProps.CountElectors;
                            data.addresses = computedProps.AddressesStr;
                            data.countMajorsPlan = serviceUtil.computational.countMajorsPlan(computedProps.CountElectors);
                            data.voterTurnout = serviceUtil.computational.voterTurnout(computedProps.CountElectors);
                            data.requiredVotes = serviceUtil.computational.requiredVotes(computedProps.CountElectors);
                        }
                        return data;
                    });
            };
        };

        $scope.onSelectPerson = function (item, model, label) {
            if (item.input) model.label = item.input + ' ' + label;
        }
    }]);

workAreaControllers.controller('modalFullAddressesCntl', ['$scope', '$modalInstance', 'addresses', function ($scope, $modalInstance, addresses) {

    $scope.addresses = addresses;
    
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
}]);

workAreaControllers.controller('tabAddressesCntl', ['$scope', 'config', function ($scope, config) {

    $scope.pagination = {
        currentPage: 1,
        pageSize: config.pageSizeTabularSection
    };

    $scope.getIndex = function (ind) {
        return ($scope.pagination.currentPage - 1) * $scope.pagination.pageSize + ind;
    };

    $scope.onPageChange = function (newPageNumber) {
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

    $scope.checked = function (address) {
        return (address.WorkAreaId && address.WorkAreaId === $scope.data.workArea.Id) | address.isSelected;
    };

    $scope.toggleSelection = function (address) {        
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
    };

    $scope.markAddress = function (address) {
        if (address.WorkAreaId && address.WorkAreaId === $scope.data.workArea.Id) {
            return address.isDeselected ? "alert-danger" : "alert-success";
        } else {
            return address.isSelected ? "alert-warning" : "";
        }
    };
    
    $scope.showApartments = function (address) {
        if (!$scope.data.workArea || !$scope.data.workArea.Id) return;
        var filterQuery = "CityId eq cityId and StreetId eq streetId and House eq 'house'"
            .replace(/cityId/, address.CityId)
            .replace(/streetId/, address.StreetId)
            .replace(/house/, address.House);

        $scope.openModalFullAddresses({
            id: $scope.data.workArea.Id,
            filter: '$filter=' + filterQuery
        }, true);
    };
}]);

workAreaControllers.controller('tabMajorsCntl', ['$scope', '$location', 'config', 'peopleDataService', 'filterSettings', function ($scope, $location, config, peopleDataService, filterSettings) {

    $scope.pagination = {
        currentPage: 1,
        pageSize: config.pageSizeTabularSection
    };

    $scope.getIndex = function (ind) {
        return ($scope.pagination.currentPage - 1) * $scope.pagination.pageSize + ind;
    };

    $scope.onPageChange = function (newPageNumber) {
        $scope.pagination.currentPage = newPageNumber;
    };

    $scope.clearMajor = function (major) {
        if (config.checkDeleteItem) {
            var ok = confirm("Увага! Старшого буде видалено зі списку, продовжити?");
            if (!ok) return;
        }
        $scope.loader.loadingMajors = true;
        peopleDataService.resource.clearMajor({ id: major.Id }, function () {
            $scope.loader.loadingMajors = false;
            $scope.data.majors.splice($scope.data.majors.indexOf(major), 1);
            $scope.calcTotalSupporters();
        }, $scope.errorHandler);
    };

    $scope.redirectToSupporters = function (major) {
        var q = { eq: { Major: major } };
        q.eq.Major.label = peopleDataService.getPersonLabel(major);
        filterSettings.remove('people');
        filterSettings.set('people', { props: q });
        $location.url("/people").search("query", angular.toJson({ eq: { Major: { Id: major.Id } } }));
    };

    $scope.showFullAddresses = function (major) {
        if (!$scope.data.workArea || !$scope.data.workArea.Id) return;
        $scope.openModalFullAddresses({
            id: $scope.data.workArea.Id,
            filter: "$filter=MajorId eq majorId".replace(/majorId/, major.Id)
        });
    };
}]);

workAreaControllers.controller('tabEditMajorsCntl', ['$scope', '$rootScope', 'serviceUtil', 'config', 'peopleResource', 'modelFactory', function ($scope, $rootScope, serviceUtil, config, peopleResource, modelFactory) {
    var checkedPages = [];

    $scope.pagination = {
        currentPage: 1,
        pageSize: config.pageSizeTabularSection
    };

    $scope.getIndex = function (ind) {
        return ($scope.pagination.currentPage - 1) * $scope.pagination.pageSize + ind;
    };

    $scope.onPageChange = function (newPageNumber) {
        $scope.pagination.currentPage = newPageNumber;
    };

    $scope.selectAll = function () {       
        if ($scope.data.workAreaAddresses) {
            var startInd = $scope.getIndex(0),
                endInd = startInd + $scope.pagination.pageSize,
                isChecked = false, foundInd = checkedPages.indexOf($scope.pagination.currentPage);
            if (foundInd >= 0) {
                isChecked = true;
                checkedPages.splice(foundInd, 1);
            } else {
                checkedPages.push($scope.pagination.currentPage);
            }
            for (var i = startInd; i < endInd; i++) {
                $scope.data.workAreaAddresses[i].isSelected = !isChecked;
            }
        }
    };

    $scope.checkedCurrentPage = function () {
        return checkedPages.indexOf($scope.pagination.currentPage) >= 0;
    };

    $scope.toggleSelection = function (address) {
        address.isSelected = !address.isSelected;
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
            return selectedAddresses.some(function (a) { return serviceUtil.equalsAddresses(p, a) });
        });
        var total = savingPeople.length, count = 0;
        if (total === 0) return;
        $scope.loader.savingPeople = true;
        savingPeople.forEach(function (person) {
            var personModel = modelFactory.createObject("person", person);
            personModel.MajorId = $scope.data.selected.setEmptyPerson ? 0 : $scope.data.selected.person.Id;
            peopleResource.update({ id: person.Id }, personModel, function () {
                count++;
                var adr = $scope.data.workAreaAddresses.filter(function (a) {
                    return serviceUtil.equalsAddresses(person, a);
                })[0];
                if (adr) {
                    adr.isSelected = false;
                    adr.Major = $scope.data.selected.setEmptyPerson ? undefined : $scope.data.selected.person;
                }
                if (count === total) {
                    $scope.loader.savingPeople = false;
                    checkedPages = [];
                }
            }, $scope.errorHandler);
        });
    };
}]);