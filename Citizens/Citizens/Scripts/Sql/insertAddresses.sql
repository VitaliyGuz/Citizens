INSERT INTO dbo.PrecinctAddresses (CityId, StreetId, House, PrecinctId)  
SELECT Distinct cityNames.Id, streetNames.Id, ExcelTable.House, 
PrecinctId = case when precinctAddressesWholeStreet.PrecinctId is null then 531188 else precinctAddressesWholeStreet.PrecinctId end  
FROM @ExcelTable AS ExcelTable  
Inner join dbo.Streets as streetNames  
on ExcelTable.Street = streetNames.Name  
Inner join dbo.StreetTypes as streetTypeNames  
on ExcelTable.StreetType = streetTypeNames.Name  
and streetNames.StreetTypeId = streetTypeNames.Id  
Inner join dbo.Cities as cityNames  
on ExcelTable.City = cityNames.Name  
Inner join dbo.CityTypes as cityTypeNames  
on ExcelTable.CityType = cityTypeNames.Name  
and cityNames.CityTypeId = cityTypeNames.Id  
left join dbo.PrecinctAddresses as precinctAddresses  
on cityNames.Id = precinctAddresses.CityId  
and streetNames.Id = precinctAddresses.StreetId  
and ExcelTable.House = precinctAddresses.House  
left join dbo.PrecinctAddresses as precinctAddressesWholeStreet  
on cityNames.Id = precinctAddressesWholeStreet.CityId  
and streetNames.Id = precinctAddressesWholeStreet.StreetId  
and precinctAddressesWholeStreet.House = ''  
where precinctAddresses.CityId is null  

INSERT INTO dbo.People (FirstName, LastName, MidleName, Gender, CityId, StreetId, House, Apartment)  
SELECT ExcelTable.FirstName, ExcelTable.LastName, ExcelTable.MidleName, ExcelTable.Gender, cityNames.Id, streetNames.Id, ExcelTable.House, ExcelTable.Apartment  
FROM @ExcelTable AS ExcelTable  
Inner join dbo.Streets as streetNames  on ExcelTable.Street = streetNames.Name  
Inner join dbo.StreetTypes as streetTypeNames  on ExcelTable.StreetType = streetTypeNames.Name  
and streetNames.StreetTypeId = streetTypeNames.Id  Inner join dbo.Cities as cityNames  on ExcelTable.City = cityNames.Name  
Inner join dbo.CityTypes as cityTypeNames  on ExcelTable.CityType = cityTypeNames.Name  and cityNames.CityTypeId = cityTypeNames.Id