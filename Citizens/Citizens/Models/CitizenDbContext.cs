using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data.Entity;
using Microsoft.AspNet.Identity.EntityFramework;
using System.Data.Entity.ModelConfiguration.Conventions;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http;

namespace Citizens.Models
{
    public class CitizenDbContext : IdentityDbContext<ApplicationUser>
    {
        public CitizenDbContext() : base("CitizensDb")
        {
            Database.SetInitializer(new MigrateDatabaseToLatestVersion<CitizenDbContext, Migrations.Configuration>());
            Configuration.ProxyCreationEnabled = false;

        }

        public static CitizenDbContext Create()
        {
            return new CitizenDbContext();
        }


        public DbSet<City> Cities { get; set; }

        public DbSet<CityType> CityTypes { get; set; }        

        public DbSet<Person> People { get; set; }

        public DbSet<PersonChangeHistory> PeopleChangeHistory { get; set; }

        public DbSet<Region> Regions { get; set; }

        public DbSet<RegionPart> RegionParts { get; set; }

        public DbSet<Street> Streets { get; set; }

        public DbSet<StreetType> StreetTypes { get; set; }

        public DbSet<District> Districts { get; set; }

        public DbSet<Precinct> Precincts { get; set; }

        public DbSet<PrecinctAddress> PrecinctAddresses { get; set; }

        public DbSet<UserPrecinct> UserPrecincts { get; set; }

        public DbSet<CityRegionPart> CityRegionParts { get; set; }

        public DbSet<PropertyKey> PropertyKeys { get; set; }

        public DbSet<PropertyValue> PropertyValues { get; set; }

        public DbSet<PersonAdditionalProperty> PersonAdditionalProperties { get; set; }

        public DbSet<DistrictPrecinct> DistrictPrecincts { get; set; }

        public DbSet<DistrictType> DistrictTypes { get; set; }

        public DbSet<Election> Elections { get; set; }


        //protected override void OnModelCreating(DbModelBuilder modelBuilder)
        //{
        //    //modelBuilder.Entity<Precinct>()
        //    //    .HasRequired(c => c.City)
        //    //    .WithMany()
        //    //    .WillCascadeOnDelete(false);

        //    //modelBuilder.Entity<PrecinctAddress>()
        //    //    .HasRequired(c => c.City)
        //    //    .WithMany()
        //    //    .WillCascadeOnDelete(false);
        //    //modelBuilder.Conventions.Remove<OneToManyCascadeDeleteConvention>();
        //    modelBuilder.Entity<IdentityUserLogin>().HasKey<string>(l => l.UserId);
        //    modelBuilder.Entity<Role>().HasKey<string>(r => r.Id);
        //    modelBuilder.Entity<IdentityUserRole>().HasKey(r => new { r.RoleId, r.UserId });
        //}

        


        public DbSet<UserRole> UserRoles { get; set; }
        public new DbSet<Role> Roles { get; set; }
        public DbSet<IdentityUserClaim> Claims { get; set; }
        public DbSet<IdentityUserLogin> Logins { get; set; }

        
    }
    public class TextResult : IHttpActionResult
    {
        string _value;
        HttpRequestMessage _request;
        HttpStatusCode _statusCode;

        public TextResult(string value, HttpRequestMessage request, HttpStatusCode statusCode)
        {
            _value = value;
            _request = request;
            _statusCode = statusCode;
        }
        public Task<HttpResponseMessage> ExecuteAsync(CancellationToken cancellationToken)
        {
            var response = new HttpResponseMessage()
            {
                Content = new StringContent(_value),
                RequestMessage = _request,
                StatusCode = _statusCode
            };
            return Task.FromResult(response);
        }
    }
}