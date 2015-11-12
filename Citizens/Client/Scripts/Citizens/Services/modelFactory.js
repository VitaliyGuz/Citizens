(function() {
    'use strict';

    angular.module('citizens.core')
        .factory('modelFactory', modelFactory);

    modelFactory.$inject = ['serviceUtil'];

    function modelFactory(serviceUtil) {
        // optional props have value null
        var models = {
            person: {
                "Id": 0,
                "LastName": '',
                "FirstName": '',
                "MidleName": '',
                "DateOfBirth": null,
                "Gender": null,
                "CityId": 0,
                "StreetId": 0,
                "House": '',
                "Apartment": 0,
                "ApartmentStr": '',
                "MajorId":0
            },
            precinct: {
                "Id": 0,
                "Number": 0,
                "CityId": null,
                "StreetId": null,
                "House": '',
                "RegionPartId": null,
                "lat": null,
                "lng": null,
                "location_type": '',
                "NeighborhoodId": null
            },
            precinctAddress: {
                "CityId": 0,
                "StreetId": 0,
                "House": '',
                "HouseNumber": 0,
                "HouseLetter": '',
                "HouseFraction": '',
                "HouseBuilding": '',
                "PrecinctId": null,
                "HouseType": null,
                "Apartments": null,
                "PostIndex": null,
                "WorkAreaId": null
            },
            city: {
                "Id": 0,
                "Name": '',
                "CityTypeId": 0,
                "IncludedToRegionPart": false,
                "RegionPartId": 0
            },
            personAdditionalProperty: {
                "PersonId": 0,
                "PropertyKeyId": 0,
                "IntValue": null,
                "StringValue": '',
                "DateTimeValue": null,
                "PropertyValueId": null
            },
            regionPart: {
                "Id": 0,
                "Name": '',
                "RegionId": 0,
                "RegionPartType": ''
            },
            street: {
                "Id": 0,
                "Name": '',
                "StreetTypeId": 0
            },
            workArea: {
                "Id": 0,
                "Number": 0,
                "PrecinctId": 0,
                "TopId": 0
            },
            user: {
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
        };
    
        function EmptyModel(json) {
            angular.extend(this, json);
        };
    
        return {
            createObject: function(modelName, source) {
                var model = new EmptyModel(models[modelName]);
                if (source) {
                    if (angular.isArray(source)) {
                        angular.forEach(source, function(src) {
                            serviceUtil.copyProperties(src, model);
                        });
                    } else {
                        serviceUtil.copyProperties(source, model);
                    }
                }
                return model;
            }
        }
    }
})()