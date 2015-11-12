(function () {
    'use strict';

    angular.module('citizens.core')
        .factory('serviceUtil', serviceUtil);

    serviceUtil.$inject = ['$filter', '$routeParams', '$rootScope'];

    function serviceUtil($filter, $routeParams, $rootScope) {
        return {
            getErrorMessage: function(error) {
                var errMsg, errDetail;
                if (error && error.description) errMsg = error.description;
                if (error && error.data !== "") {
                    if (angular.isObject(error.data)) {
                        if (error.data.error && error.data.error.innererror) {
                            errDetail = error.data.error.innererror.message;
                        } else {
                            errDetail = error.data.error.message;
                        }
                    } else {
                        errDetail = error.data;
                    }
                }
                if (!errDetail) errDetail = error.statusText;
                if (errDetail && errMsg) errMsg = errMsg + " (" + errDetail + ")";
                if (errDetail && !errMsg) errMsg = errDetail;
                return errMsg;
            },

            compareByName: function(a, b) {
                return a.Name.localeCompare(b.Name);
            },

            copyProperties: function(source, destination) {
                Object.keys(destination).forEach(function(prop) {
                    var val = source[prop];
                    if (val != undefined) destination[prop] = source[prop];
                });
            },

            getAddressKey: function(address) {
                return { cityId: address.CityId, streetId: address.StreetId, house: address.House };
            },

            formatDate: function(date, pattern) {
                var d = this.dateParse(date);
                return d ? $filter("date")(d, pattern) : undefined;
            },

            getRouteParam: function(paramName) {
                var param = $routeParams[paramName], intParam;
                if (param) {
                    intParam = parseInt(param);
                    if (intParam > 0) {
                        return intParam;
                    }
                }
                return undefined;
            },

            dateParse: function(date) {
                if (!date) return undefined;
                if (angular.isDate(date)) return date;
                var regex = /^(\d{2}).(\d{2}).(\d{4})/,
                    matches = regex.exec(date);
                if (matches) {
                    return new Date(matches[3], matches[2] - 1, matches[1]);
                } else {
                    return undefined;
                }
            },

            formatDateToISO: function(date, setHours) {
                var d = this.dateParse(date);
                if (d && setHours) {
                    if (setHours.startOfDay) d.setHours(0, 0, 0, 0);
                    if (setHours.endOfDay) d.setHours(23, 59, 59, 999);
                }
                return d ? d.toISOString() : undefined;
            },

            isEmptyDate: function(date) {
                if (!date) return true;
                date.setHours(0, 0, 0, 0);
                var minDate = new Date(1900, 0, 1);
                minDate.setHours(0, 0, 0, 0);
                return date.getTime() === minDate.getTime();
            },

            addressToString: function(address, onlyHouse) {
                if (address.City && address.Street) {
                    var apartment = onlyHouse ? '' : $filter("checkApartment")(address.ApartmentStr);
                    var house = address.House ? address.House : '';
                    return address.City.CityType.Name + address.City.Name + ' ' +
                        address.Street.StreetType.Name + address.Street.Name + ' ' +
                        house + apartment;
                } else {
                    return undefined;
                }
            },

            expandAddress: function(obj) {
                if (obj.CityId) {
                    obj.City = $rootScope.cities.filter(function(c) {
                        return c.Id === obj.CityId;
                    })[0];
                }
                if (obj.StreetId) {
                    obj.Street = $rootScope.streets.filter(function(c) {
                        return c.Id === obj.StreetId;
                    })[0];
                }
            },

            sortAddresses: function(addresses) {

                var compareByName = this.compareByName;

                function compareByHouse(a1, a2) {
                    var houseNumber1 = a1.HouseNumber == undefined ? parseInt(a1.House) : a1.HouseNumber;
                    var houseNumber2 = a2.HouseNumber == undefined ? parseInt(a2.House) : a2.HouseNumber;
                    var compNumber = houseNumber1 - houseNumber2;
                    if (isNaN(compNumber)) return 0;
                    if (compNumber === 0) {
                        var compFractionNumb = parseInt(a1.HouseFraction) - parseInt(a2.HouseFraction),
                            compFractionStr = a1.HouseFraction != undefined ? a1.HouseFraction.localeCompare(a2.HouseFraction) : 0,
                            compFraction = 0;
                        if (isNaN(compFractionNumb)) {
                            compFraction = compFractionStr;
                        } else {
                            compFraction = compFractionNumb === 0 ? compFractionStr : compFractionNumb;
                        }
                        if (compFraction === 0) {
                            var compLetter = a1.HouseLetter != undefined ? a1.HouseLetter.localeCompare(a2.HouseLetter) : 0;
                            if (compLetter === 0) {
                                var compBuildingStr = a1.HouseBuilding != undefined ? a1.HouseBuilding.localeCompare(a2.HouseBuilding) : 0,
                                    compBuildingNumb = parseInt(a1.HouseBuilding) - parseInt(a2.HouseBuilding);
                                if (isNaN(compBuildingNumb)) {
                                    return compBuildingStr;
                                } else {
                                    return compBuildingNumb === 0 ? compBuildingStr : compBuildingNumb;
                                }
                            } else {
                                return compLetter;
                            }
                        } else {
                            return compFraction;
                        }
                    } else {
                        return compNumber;
                    }
                };

                function compareAddresses(a1, a2) {
                    var compCity = compareByName(a1.City, a2.City);
                    var compStreet = 0, compTypeStreet = 0;
                    if (a1.Street && a2.Street) {
                        compStreet = compareByName(a1.Street, a2.Street);
                        compTypeStreet = compareByName(a1.Street.StreetType, a2.Street.StreetType);
                    }
                    var compHouse = compareByHouse(a1, a2);
                    var compApartment = 0;
                    if (a1.Apartment != null && a2.Apartment != null) compApartment = a1.Apartment - a2.Apartment;
                    if (compCity === 0) {
                        if (compStreet === 0) {
                            if (compTypeStreet === 0) {
                                return compHouse === 0 ? compApartment : compHouse;
                            } else {
                                return compTypeStreet;
                            }
                        } else {
                            return compStreet;
                        }
                    } else {
                        return compCity;
                    }
                };

                if (addresses) addresses.sort(compareAddresses);
            },

            computational: {
                countMajorsPlan: function(countElectors) {
                    return Math.round(countElectors * 0.55 * 0.27 / 10);
                },
                voterTurnout: function(countElectors) {
                    return Math.round(countElectors * 0.55);
                },
                requiredVotes: function(countElectors) {
                    return Math.round(countElectors * 0.55 * 0.27);
                }
            },

            objectIndexOf: function(arr, searchObj, property) {
                var prop = property ? property : 'Id';
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i][prop] === searchObj[prop]) {
                        return i;
                    }
                }
                return -1;
            },

            parseHouseNumber: function(address) {
                if (!address.houseExceptBuilding) return;
                var regex = /(\d*)([а-яА-Яі-їІ-Ї]*)([^\/]*)(\/)?(.*)?/;
                address.House = address.houseExceptBuilding.toLocaleUpperCase();
                var matches = regex.exec(address.House);
                if (address.HouseBuilding) {
                    address.HouseBuilding = address.HouseBuilding.toLocaleUpperCase();
                    address.House = address.House + ' к.' + address.HouseBuilding;
                }
                if (matches) {
                    address.HouseNumber = parseInt(matches[1]) || null;
                    if (matches[2]) {
                        address.HouseLetter = matches[2];
                        if (matches[3]) address.HouseLetter = address.HouseLetter + matches[3];
                    } else {
                        address.HouseLetter = '';
                    }
                    address.HouseFraction = matches[5] || '';
                }
            },

            getHouseExceptBuilding: function(house) {
                return house.replace(/\s[к|К].+/, '').replace(/\,/g, '').trim();
            },

            getFilterExpression: function(props, value) {
                if (!props) return {};

                function build(obj) {
                    obj[props.shift()] = props.length === 0 ? value : build({});
                    return obj;
                };

                return build({});
            },

            equalsAddresses: function(a, b) {
                var equalsApartmentStr = a.ApartmentStr && b.ApartmentStr ? a.ApartmentStr.toLocaleLowerCase() === b.ApartmentStr.toLocaleLowerCase() : a.ApartmentStr === b.ApartmentStr;
                return a.CityId === b.CityId &&
                    a.StreetId === b.StreetId &&
                    a.House.toLocaleLowerCase() === b.House.toLocaleLowerCase() &&
                    a.Apartment === b.Apartment && equalsApartmentStr;
            }
        }
    }
})()