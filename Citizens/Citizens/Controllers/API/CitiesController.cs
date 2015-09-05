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
    builder.EntitySet<City>("Cities");
    builder.EntitySet<CityType>("CityTypes"); 
    builder.EntitySet<Person>("Persons"); 
    builder.EntitySet<Region>("Regions"); 
    config.Routes.MapODataRoute("odata", "odata", builder.GetEdmModel());
    */      
    public class CitiesController : ODataController
    {
        private CitizenDbContext db = new CitizenDbContext();

        // GET: odata/Cities
        [EnableQuery]
        [Logger(Roles = "Operators, SuperAdministrators")] 
        public IQueryable<City> GetCities()
        {
            return db.Cities;
        }

        // GET: odata/Cities(5)
        [EnableQuery]
        [Logger(Roles = "Operators, SuperAdministrators")] 
        public SingleResult<City> GetCity([FromODataUri] int key)
        {
            return SingleResult.Create(db.Cities.Where(city => city.Id == key));
        }

        // PUT: odata/Cities(5)
        public async Task<IHttpActionResult> Put([FromODataUri] int key, Delta<City> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            City city = await db.Cities.FindAsync(key);
            if (city == null)
            {
                return NotFound();
            }

            patch.Put(city);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CityExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(city);
        }

        // POST: odata/Cities
        public async Task<IHttpActionResult> Post(City city)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.Cities.Add(city);
            await db.SaveChangesAsync();

            return Created(city);
        }

        // PATCH: odata/Cities(5)
        [AcceptVerbs("PATCH", "MERGE")]
        public async Task<IHttpActionResult> Patch([FromODataUri] int key, Delta<City> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            City city = await db.Cities.FindAsync(key);
            if (city == null)
            {
                return NotFound();
            }

            patch.Patch(city);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CityExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(city);
        }

        // DELETE: odata/Cities(5)
        public async Task<IHttpActionResult> Delete([FromODataUri] int key)
        {
            City city = await db.Cities.FindAsync(key);
            if (city == null)
            {
                return NotFound();
            }

            db.Cities.Remove(city);
            await db.SaveChangesAsync();

            return StatusCode(HttpStatusCode.NoContent);
        }

        // GET: odata/Cities(5)/CityType
        [EnableQuery]
        public SingleResult<CityType> GetCityType([FromODataUri] int key)
        {
            return SingleResult.Create(db.Cities.Where(m => m.Id == key).Select(m => m.CityType));
        }

        // GET: odata/Cities(5)/Persons
        [EnableQuery]
        public IQueryable<Person> GetPersons([FromODataUri] int key)
        {
            return db.Cities.Where(m => m.Id == key).SelectMany(m => m.Persons);
        }

        public IQueryable<CityRegionPart> CityRegionParts([FromODataUri] int key)
        {
            return db.Cities.Where(m => m.Id == key).SelectMany(m => m.CityRegionParts);
        }

        // GET: odata/Cities(5)/Region

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool CityExists(int key)
        {
            return db.Cities.Count(e => e.Id == key) > 0;
        }
    }
}
