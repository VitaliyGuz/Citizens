using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Threading.Tasks;

namespace Citizens.Models
{
    public class CitizenRepository : IRepository
    {
        private CitizenDbContext context = new CitizenDbContext();

        public IEnumerable<City> Cities
        {
            get
            {
                return context.Cities.Include("CityType").Include("CityRegionParts");
            }
        }

        public async Task<int> SaveCityAsync(City city)
        {
            if (city.Id == 0)
            {
                context.Cities.Add(city);
            }
            else
            {
                City dbEntry = context.Cities.Find(city.Id);
                if (dbEntry != null)
                {
                    dbEntry.Name = city.Name;
                    dbEntry.CityTypeId = city.CityTypeId;
                    //dbEntry.RegionId = city.RegionId;                    
                }
            }
            return await context.SaveChangesAsync();
        }

        public async Task<City> DeleteCityAsync(int cityID)
        {
            City dbEntry = context.Cities.Find(cityID);
            if (dbEntry != null)
            {
                context.Cities.Remove(dbEntry);
            }
            await context.SaveChangesAsync();
            return dbEntry;
        }


        public IEnumerable<CityType> CityTypes
        {
            get
            {
                return context.CityTypes;
            }
        }

        public async Task<int> SaveCityTypeAsync(CityType сityType)
        {
            if (сityType.Id == 0)
            {
                context.CityTypes.Add(сityType);
            }
            else
            {
                CityType dbEntry = context.CityTypes.Find(сityType.Id);
                if (dbEntry != null)
                {
                    dbEntry.Name = сityType.Name;                    
                }
            }
            return await context.SaveChangesAsync();
        }

        public async Task<CityType> DeleteCityTypeAsync(int сityTypeID)
        {
            CityType dbEntry = context.CityTypes.Find(сityTypeID);
            if (dbEntry != null)
            {
                context.CityTypes.Remove(dbEntry);
            }
            await context.SaveChangesAsync();
            return dbEntry;
        }


        //public IEnumerable<FirstName> FirstNames
        //{
        //    get
        //    {
        //        return context.FirstNames;
        //    }
        //}

        //public async Task<int> SaveFirstNameAsync(FirstName firstName)
        //{
        //    if (firstName.Id == 0)
        //    {
        //        context.FirstNames.Add(firstName);
        //    }
        //    else
        //    {
        //        FirstName dbEntry = context.FirstNames.Find(firstName.Id);
        //        if (dbEntry != null)
        //        {
        //            dbEntry.Name = firstName.Name;                    
        //        }
        //    }
        //    return await context.SaveChangesAsync();
        //}

        //public async Task<FirstName> DeleteFirstNameAsync(int firstNameID)
        //{
        //    FirstName dbEntry = context.FirstNames.Find(firstNameID);
        //    if (dbEntry != null)
        //    {
        //        context.FirstNames.Remove(dbEntry);
        //    }
        //    await context.SaveChangesAsync();
        //    return dbEntry;
        //}


        //public IEnumerable<LastName> LastNames
        //{
        //    get
        //    {
        //        return context.LastNames;
        //    }
        //}

        //public async Task<int> SaveLastNameAsync(LastName lastName)
        //{
        //    if (lastName.Id == 0)
        //    {
        //        context.LastNames.Add(lastName);
        //    }
        //    else
        //    {
        //        LastName dbEntry = context.LastNames.Find(lastName.Id);
        //        if (dbEntry != null)
        //        {
        //            dbEntry.Name = lastName.Name;
        //        }
        //    }
        //    return await context.SaveChangesAsync();
        //}

        //public async Task<LastName> DeleteLastNameAsync(int lastNameID)
        //{
        //    LastName dbEntry = context.LastNames.Find(lastNameID);
        //    if (dbEntry != null)
        //    {
        //        context.LastNames.Remove(dbEntry);
        //    }
        //    await context.SaveChangesAsync();
        //    return dbEntry;
        //}


        //// MidleName
        //public IEnumerable<MidleName> MidleNames
        //{
        //    get
        //    {
        //        return context.MidleNames;
        //    }
        //}

        //public async Task<int> SaveMidleNameAsync(MidleName midleName)
        //{
        //    if (midleName.Id == 0)
        //    {
        //        context.MidleNames.Add(midleName);
        //    }
        //    else
        //    {
        //        MidleName dbEntry = context.MidleNames.Find(midleName.Id);
        //        if (dbEntry != null)
        //        {
        //            dbEntry.Name = midleName.Name;
        //        }
        //    }
        //    return await context.SaveChangesAsync();
        //}

        //public async Task<MidleName> DeleteMidleNameAsync(int midleNameID)
        //{
        //    MidleName dbEntry = context.MidleNames.Find(midleNameID);
        //    if (dbEntry != null)
        //    {
        //        context.MidleNames.Remove(dbEntry);
        //    }
        //    await context.SaveChangesAsync();
        //    return dbEntry;
        //}


        // Person
        public IEnumerable<Person> Persons
        {
            get
            {
                return context.People.Include("City").Include("Street");
            }
        }

        public async Task<int> SavePersonAsync(Person person)
        {
            if (person.Id == 0)
            {
                context.People.Add(person);
            }
            else
            {
                Person dbEntry = context.People.Find(person.Id);
                if (dbEntry != null)
                {
                    dbEntry.FirstName = person.FirstName;
                    dbEntry.MidleName = person.MidleName;
                    dbEntry.LastName = person.LastName;
                    dbEntry.DateOfBirth = person.DateOfBirth;
                    dbEntry.Gender = person.Gender;
                    dbEntry.CityId = person.CityId;
                    dbEntry.House = person.House;
                    dbEntry.Apartment = person.Apartment;
                }
            }
            return await context.SaveChangesAsync();
        }

        public async Task<Person> DeletePersonAsync(int personID)
        {
            Person dbEntry = context.People.Find(personID);
            if (dbEntry != null)
            {
                context.People.Remove(dbEntry);
            }
            await context.SaveChangesAsync();
            return dbEntry;
        }


        // Region
        public IEnumerable<Region> Regions
        {
            get
            {
                return context.Regions;
            }
        }

        public async Task<int> SaveRegionAsync(Region region)
        {
            if (region.Id == 0)
            {
                context.Regions.Add(region);
            }
            else
            {
                Region dbEntry = context.Regions.Find(region.Id);
                if (dbEntry != null)
                {
                    dbEntry.Name = region.Name;                    
                }
            }
            return await context.SaveChangesAsync();
        }

        public async Task<Region> DeleteRegionAsync(int regionID)
        {
            Region dbEntry = context.Regions.Find(regionID);
            if (dbEntry != null)
            {
                context.Regions.Remove(dbEntry);
            }
            await context.SaveChangesAsync();
            return dbEntry;
        }


        // Street
        public IEnumerable<Street> Streets
        {
            get
            {
                return context.Streets.Include("StreetType");
            }
        }

        public async Task<int> SaveStreetAsync(Street street)
        {
            if (street.Id == 0)
            {
                context.Streets.Add(street);
            }
            else
            {
                Street dbEntry = context.Streets.Find(street.Id);
                if (dbEntry != null)
                {
                    dbEntry.Name = street.Name;
                    dbEntry.StreetTypeId = street.StreetTypeId;
                }
            }
            return await context.SaveChangesAsync();
        }

        public async Task<Street> DeleteStreetAsync(int streetID)
        {
            Street dbEntry = context.Streets.Find(streetID);
            if (dbEntry != null)
            {
                context.Streets.Remove(dbEntry);
            }
            await context.SaveChangesAsync();
            return dbEntry;
        }


        // StreetType
        public IEnumerable<StreetType> StreetTypes
        {
            get
            {
                return context.StreetTypes;
            }
        }

        public async Task<int> SaveStreetTypeAsync(StreetType streetType)
        {
            if (streetType.Id == 0)
            {
                context.StreetTypes.Add(streetType);
            }
            else
            {
                StreetType dbEntry = context.StreetTypes.Find(streetType.Id);
                if (dbEntry != null)
                {
                    dbEntry.Name = streetType.Name;                    
                }
            }
            return await context.SaveChangesAsync();
        }

        public async Task<StreetType> DeleteStreetTypeAsync(int streetTypeID)
        {
            StreetType dbEntry = context.StreetTypes.Find(streetTypeID);
            if (dbEntry != null)
            {
                context.StreetTypes.Remove(dbEntry);
            }
            await context.SaveChangesAsync();
            return dbEntry;
        }














        
    }
}