
CREATE TYPE dbo.PersonsTable AS TABLE
(
	FirstName nvarchar(20),
	MidleName nvarchar(20),
	LastName nvarchar(20),                                
	Street nvarchar(50),
	StreetType nvarchar(50),
	City nvarchar(50),
	CityType nvarchar(50),
	House nvarchar(50),
	Apartment int,
	Gender int
)
