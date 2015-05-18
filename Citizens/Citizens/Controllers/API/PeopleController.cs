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
using System.Web.OData.Routing;
using Citizens.Models;

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
        [EnableQuery]
        public IQueryable<Person> GetPeople()
        {
            //var dbQuery =
            //from People in db.People
            //join PrecinctAddresses in db.PrecinctAddresses
            //      on new { People.CityId, StreetId = People.StreetId, People.House }
            //  equals new { PrecinctAddresses.CityId, StreetId = PrecinctAddresses.StreetId, PrecinctAddresses.House } into PrecinctAddresses_join
            //from PrecinctAddresses in PrecinctAddresses_join.DefaultIfEmpty()
            //join Precincts in db.Precincts on new { PrecinctId = PrecinctAddresses.PrecinctId } equals new { PrecinctId = Precincts.Id } into Precincts_join
            //from Precincts in Precincts_join.DefaultIfEmpty()
            //select new Person
            //{
            //    Id = People.Id,
            //    FirstName = People.FirstName,
            //    MidleName = People.MidleName,
            //    LastName = People.LastName,
            //    DateOfBirth = People.DateOfBirth,
            //    Gender = People.Gender,
            //    CityId = People.CityId,
            //    StreetId = People.StreetId,
            //    House = People.House,
            //    Apartment = People.Apartment
            //};


            //,
            //    Precinct = new Precinct
            //    {
            //        Id = Precincts.Id,
            //        Number = Precincts.Number,
            //        Street = Precincts.Street
            //    }

            //return db.Database.SqlQuery<Person>("SELECT * FROM People as People left join PrecinctAddresses as PrecinctAddresses on People.CityId = PrecinctAddresses.CityId "
            //    + " and People.StreetId = PrecinctAddresses.StreetId and People.House = PrecinctAddresses.House ").AsQueryable();
            //return dbQuery.AsQueryable<Person>();
            return db.People;

        }

        // GET: odata/People(5)
        [EnableQuery]
        public SingleResult<Person> GetPerson([FromODataUri] int key)
        {
            return SingleResult.Create(db.People.Where(person => person.Id == key));
        }

        // PUT: odata/People(5)
        public async Task<IHttpActionResult> Put([FromODataUri] int key, Delta<Person> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Person person = await db.People.FindAsync(key);
            if (person == null)
            {
                return NotFound();
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
        public async Task<IHttpActionResult> Post(Person person)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.People.Add(person);
            await db.SaveChangesAsync();

            return Created(person);
        }

        // PATCH: odata/People(5)
        [AcceptVerbs("PATCH", "MERGE")]
        public async Task<IHttpActionResult> Patch([FromODataUri] int key, Delta<Person> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Person person = await db.People.FindAsync(key);
            if (person == null)
            {
                return NotFound();
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
    }
}
