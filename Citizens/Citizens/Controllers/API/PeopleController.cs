using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.ModelBinding;
using System.Web.OData;
using System.Web.OData.Query;
using System.Web.OData.Routing;
using System.Web.Security;
using Citizens.Extensions;
using Citizens.Models;
using Microsoft.AspNet.Identity;

namespace Citizens.Controllers.API
{
    /*
    The WebApiConfig class may require additional changes to add a route for this controller. Merge these statements into the Register method of the WebApiConfig class as applicable. Note that OData URLs are case sensitive.

    using System.Web.Http.OData.Builder;
    using Citizens.Models;
    ODataConventionModelBuilder builder = new ODataConventionModelBuilder();
    builder.EntitySet<Person>("People");
    builder.EntitySet<City>("Cities"); 
    builder.EntitySet<Street>("Streets"); 
    config.Routes.MapODataRoute("odata", "odata", builder.GetEdmModel());
    */
         
    public class PeopleController : ODataController
    {
        private CitizenDbContext db = new CitizenDbContext();

        // GET: odata/People
        [EnableQuery(PageSize=20, MaxNodeCount = 200)]
        [PersonFilter]
        [Logger(Roles = "Operators, SuperAdministrators")] 

        public IQueryable<Person> GetPeople(ODataQueryOptions opts)
        //public IQueryable<Person> GetPeople()
        {
            //var UserId = User.Identity.GetUserId();
            //IQueryable<Person> dbQuery;
            ////dbQuery =
            ////    db.People.Join(db.PrecinctAddresses,
            ////        People => new {People.CityId, StreetId = Convert.ToInt32(People.StreetId), People.House},
            ////        PrecinctAddresses =>
            ////            new {PrecinctAddresses.CityId, StreetId = PrecinctAddresses.StreetId, PrecinctAddresses.House},
            ////        (People, PrecinctAddresses) => new {People, PrecinctAddresses})
            ////        .Join(db.UserPrecincts, @t => PrecinctAddresses.PrecinctId,
            ////            UserPrecincts => UserPrecincts.PrecinctId, (@t, UserPrecincts) => new {@t, UserPrecincts})
            ////        .Where(
            ////            @t => UserPrecincts.UserId == Convert.ToString(new Guid("438ff3a5-ef30-4931-8bfa-bf388f76c0fd")))
            ////        .Select(@t => new
            ////        {
            ////            People.Id,
            ////            CityId = (System.Int32?) People.CityId,
            ////            StreetId = (System.Int32?) People.StreetId,
            ////            People.House,
            ////            People.FirstName,
            ////            People.MidleName,
            ////            People.LastName,
            ////            People.DateOfBirth,
            ////            People.Gender,
            ////            People.Apartment
            ////        })

            ////dbQuery =
            ////    db.People.GroupJoin(db.PrecinctAddresses,
            ////        People => new { People.CityId, StreetId = People.StreetId, People.House },
            ////        PrecinctAddresses =>
            ////            new { PrecinctAddresses.CityId, StreetId = PrecinctAddresses.StreetId, PrecinctAddresses.House },
            ////        (People, PrecinctAddresses_join) => new { People, PrecinctAddresses_join })
            ////        .SelectMany(@t => @t.PrecinctAddresses_join, (@t, PrecinctAddresses) => new { @t, PrecinctAddresses })
            ////        .GroupJoin(db.UserPrecincts.Where(UserPrecincts => UserPrecincts.UserId == UserId), @t => new { PrecinctId = @t.PrecinctAddresses.PrecinctId },
            ////            UserPrecincts => new { PrecinctId = UserPrecincts.PrecinctId },
            ////            (@t, UserPrecincts_join) => new { @t, UserPrecincts_join })
            ////        .SelectMany(@t => @t.UserPrecincts_join, (@t, UserPrecincts) => @t.@t.@t.People);

            //dbQuery =
            //    db.People.GroupJoin(db.PrecinctAddresses,
            //        People => new { People.CityId, StreetId = People.StreetId, People.House },
            //        PrecinctAddresses =>
            //            new { PrecinctAddresses.CityId, StreetId = PrecinctAddresses.StreetId, PrecinctAddresses.House },
            //        (People, PrecinctAddresses_join) => new { People, PrecinctAddresses_join })
            //        .SelectMany(@t => @t.PrecinctAddresses_join, (@t, PrecinctAddresses) => new { @t, PrecinctAddresses })
            //        .GroupJoin(db.UserPrecincts.Where(UserPrecincts => UserPrecincts.UserId == UserId), @t => new { PrecinctId = @t.PrecinctAddresses.PrecinctId },
            //            UserPrecincts => new { PrecinctId = UserPrecincts.PrecinctId },
            //            (@t, UserPrecincts_join) => new { @t, UserPrecincts_join })
            //        .SelectMany(@t => @t.UserPrecincts_join, (@t, UserPrecincts) => @t.@t.@t.People);

            ////new Person()
            ////    {
            ////        Id = @t.@t.@t.People.Id,
            ////        FirstName = @t.@t.@t.People.FirstName,
            ////        MidleName = @t.@t.@t.People.MidleName,
            ////        LastName = @t.@t.@t.People.LastName,
            ////        DateOfBirth = @t.@t.@t.People.DateOfBirth,
            ////        Gender = @t.@t.@t.People.Gender,
            ////        CityId = @t.@t.@t.People.CityId,
            ////        StreetId = @t.@t.@t.People.StreetId,
            ////        House = @t.@t.@t.People.House,
            ////        Apartment = @t.@t.@t.People.Apartment
            ////    }

            ////new Person()
            ////{
            ////    Id = People.Id,
            ////    FirstName = People.FirstName,
            ////    MidleName = People.MidleName,
            ////    LastName = People.LastName,
            ////    DateOfBirth = People.DateOfBirth,
            ////    Gender = People.Gender,
            ////    CityId = People.CityId,
            ////    StreetId = People.StreetId,
            ////    House = People.House,
            ////    Apartment = People.Apartment
            ////};


            ////,
            ////    Precinct = new Precinct
            ////    {
            ////        Id = Precincts.Id,
            ////        Number = Precincts.Number,
            ////        Street = Precincts.Street
            ////    }

            ////return db.Database.SqlQuery<Person>("SELECT * FROM People as People left join PrecinctAddresses as PrecinctAddresses on People.CityId = PrecinctAddresses.CityId "
            ////    + " and People.StreetId = PrecinctAddresses.StreetId and People.House = PrecinctAddresses.House ").AsQueryable();

            ////var settings = new ODataValidationSettings()
            ////{
            ////    // Initialize settings as needed.
            ////    AllowedFunctions = AllowedFunctions.All
            ////};

            ////opts.Validate(settings);

            //IQueryable results = opts.ApplyTo(dbQuery.AsQueryable());
            ////IQueryable results = opts.ApplyTo(db.People.Where(person => person.House == "4-1").AsQueryable());
            //return results.AsQueryable() as IQueryable<Person>;
            return db.People.Except(db.People.Where(p => p.LastName.Equals(string.Empty) && p.MidleName.Equals(string.Empty) && p.FirstName.Equals(string.Empty)));

        }

        // GET: odata/People(5)
        [EnableQuery]
        [PersonFilter]
        [Logger(Roles = "Operators, SuperAdministrators")] 
        public SingleResult<Person> GetPerson([FromODataUri] int key)
        {
            return SingleResult.Create(db.People.Where(p => p.Id == key && !p.LastName.Equals(string.Empty) && !p.MidleName.Equals(string.Empty) && !p.FirstName.Equals(string.Empty)));
        }

        // PUT: odata/People(5)
        [Logger(Roles = "Operators, SuperAdministrators")]
        public async Task<IHttpActionResult> Put([FromODataUri] int key, Delta<Person> patch)
        {
            var entity = patch.GetEntity();
            Validate(entity);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }



            Person person = await db.People.FindAsync(key);
            if (person == null)
            {
                return NotFound();
            }
            if (entity.MajorId == 0)
            {
                var emptyPerson = GetEmptyPerson();
                if (emptyPerson == null) return BadRequest();
                entity.MajorId = emptyPerson.Id;
            }

    
            if (
                !User.IsInRole("Administrators") && 
                !User.IsInRole("SuperAdministrators") &&
                (
                    entity.FirstName != person.FirstName ||
                    entity.MidleName != person.MidleName ||
                    entity.LastName != person.LastName ||
                    entity.CityId != person.CityId ||
                    entity.StreetId != person.StreetId ||
                    entity.House != person.House ||
                    entity.ApartmentStr != person.ApartmentStr
                )
               )
            {

                return StatusCode(HttpStatusCode.Forbidden);
            }

            patch.Put(person);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PersonExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(person);
        }

        // POST: odata/People
        [Logger(Roles = "SuperAdministrators")]
        public async Task<IHttpActionResult> Post(Person person)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            if (person.MajorId == 0)
            {
                var emptyPerson = GetEmptyPerson();
                if (emptyPerson == null) return BadRequest();
                person.MajorId = emptyPerson.Id;
            }
            db.People.Add(person);
            await db.SaveChangesAsync();

            return Created(person);
        }

        // PATCH: odata/People(5)
        [AcceptVerbs("PATCH", "MERGE")]
        public async Task<IHttpActionResult> Patch([FromODataUri] int key, Delta<Person> patch)
        {
            var entity = patch.GetEntity();
            Validate(entity);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Person person = await db.People.FindAsync(key);
            if (person == null)
            {
                return NotFound();
            }
            if (entity.MajorId == 0)
            {
                var emptyPerson = GetEmptyPerson();
                if (emptyPerson == null) return BadRequest();
                entity.MajorId = emptyPerson.Id;
            }
            patch.Patch(person);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PersonExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(person);
        }

        // DELETE: odata/People(5)
        [Logger(Roles = "SuperAdministrators")]
        public async Task<IHttpActionResult> Delete([FromODataUri] int key)
        {
            Person person = await db.People.FindAsync(key);
            if (person == null)
            {
                return NotFound();
            }

            db.People.Remove(person);
            await db.SaveChangesAsync();

            return StatusCode(HttpStatusCode.NoContent);
        }

        // GET: odata/People(5)/City
        [EnableQuery]
        public SingleResult<City> GetCity([FromODataUri] int key)
        {
            return SingleResult.Create(db.People.Where(m => m.Id == key).Select(m => m.City));
        }

        // GET: odata/People(5)/Street
        [EnableQuery]
        public SingleResult<Street> GetStreet([FromODataUri] int key)
        {
            return SingleResult.Create(db.People.Where(m => m.Id == key).Select(m => m.Street));
        }

        // GET: odata/People(5)/Street
        [EnableQuery]
        public SingleResult<Street> GetPrecinct([FromODataUri] int key)
        {
            return SingleResult.Create(db.People.Where(m => m.Id == key).Select(m => m.Street));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool PersonExists(int key)
        {
            return db.People.Count(e => e.Id == key) > 0;
        }

        private Person GetEmptyPerson()
        {
            return db.People.FirstOrDefault(p => p.LastName.Equals(string.Empty) && p.MidleName.Equals(string.Empty) && p.FirstName.Equals(string.Empty));
        }
    }
}
