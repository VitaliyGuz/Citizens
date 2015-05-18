using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Citizens.Models
{
    public interface IRepository
    {
        IEnumerable<City> Cities { get; }
        Task<int> SaveCityAsync(City city);
        Task<City> DeleteCityAsync(int cityID);

        IEnumerable<CityType> CityTypes { get; }
        Task<int> SaveCityTypeAsync(CityType cityType);
        Task<CityType> DeleteCityTypeAsync(int cityTypeID);

        //IEnumerable<FirstName> FirstNames { get; }
        //Task<int> SaveFirstNameAsync(FirstName firstName);
        //Task<FirstName> DeleteFirstNameAsync(int firstNameID);

        //IEnumerable<LastName> LastNames { get; }
        //Task<int> SaveLastNameAsync(LastName lastName);
        //Task<LastName> DeleteLastNameAsync(int lastNameID);

        //IEnumerable<MidleName> MidleNames { get; }
        //Task<int> SaveMidleNameAsync(MidleName midleName);
        //Task<MidleName> DeleteMidleNameAsync(int midleNameID);

        IEnumerable<Person> Persons { get; }
        Task<int> SavePersonAsync(Person person);
        Task<Person> DeletePersonAsync(int personID);

        IEnumerable<Region> Regions { get; }
        Task<int> SaveRegionAsync(Region region);
        Task<Region> DeleteRegionAsync(int regionID);

        IEnumerable<Street> Streets { get; }
        Task<int> SaveStreetAsync(Street street);
        Task<Street> DeleteStreetAsync(int streetID);

        IEnumerable<StreetType> StreetTypes { get; }
        Task<int> SaveStreetTypeAsync(StreetType streetType);
        Task<StreetType> DeleteStreetTypeAsync(int streetTypeID);
        






        IEnumerable<Product> Products { get; }
        Task<int> SaveProductAsync(Product product);
        Task<Product> DeleteProductAsync(int productID);

        IEnumerable<Order> Orders { get; }
        Task<int> SaveOrderAsync(Order order);
        Task<Order> DeleteOrderAsync(int orderID);
    }
}
