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
    builder.EntitySet<Street>("Streets");
    builder.EntitySet<StreetType>("StreetTypes"); 
    config.Routes.MapODataRoute("odata", "odata", builder.GetEdmModel());
    */
         
    public class StreetsController : ODataController
    {
        private CitizenDbContext db = new CitizenDbContext();

        // GET: odata/Streets
        [EnableQuery]
        [Logger(Roles = "Operators, SuperAdministrators")] 
        public IQueryable<Street> GetStreets()
        {
            return db.Streets.Except(db.Streets.Where(street => street.Name.Equals(string.Empty)));
        }

        // GET: odata/Streets(5)
        [EnableQuery]
        [Logger(Roles = "Operators, SuperAdministrators")] 
        public SingleResult<Street> GetStreet([FromODataUri] int key)
        {
            return SingleResult.Create(db.Streets.Where(street => street.Id == key));
        }

        // PUT: odata/Streets(5)
        [Logger(Roles = "SuperAdministrators")]
        public async Task<IHttpActionResult> Put([FromODataUri] int key, Delta<Street> patch)
        {            

            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Street street = await db.Streets.FindAsync(key);
            if (street == null)
            {
                return NotFound();
            }

            patch.Put(street);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!StreetExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(street);
        }

        // POST: odata/Streets
        [Logger(Roles = "SuperAdministrators")]
        public async Task<IHttpActionResult> Post(Street street)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.Streets.Add(street);
            await db.SaveChangesAsync();

            return Created(street);
        }

        // PATCH: odata/Streets(5)
        [AcceptVerbs("PATCH", "MERGE")]
        [Logger(Roles = "SuperAdministrators")]
        public async Task<IHttpActionResult> Patch([FromODataUri] int key, Delta<Street> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Street street = await db.Streets.FindAsync(key);
            if (street == null)
            {
                return NotFound();
            }

            patch.Patch(street);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!StreetExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(street);
        }

        // DELETE: odata/Streets(5)
        [Logger(Roles = "SuperAdministrators")]
        public async Task<IHttpActionResult> Delete([FromODataUri] int key)
        {
            Street street = await db.Streets.FindAsync(key);
            if (street == null)
            {
                return NotFound();
            }

            db.Streets.Remove(street);
            await db.SaveChangesAsync();

            return StatusCode(HttpStatusCode.NoContent);
        }

        // GET: odata/Streets(5)/StreetType
        [EnableQuery]
        public SingleResult<StreetType> GetStreetType([FromODataUri] int key)
        {
            return SingleResult.Create(db.Streets.Where(m => m.Id == key).Select(m => m.StreetType));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool StreetExists(int key)
        {
            return db.Streets.Count(e => e.Id == key) > 0;
        }
    }
}
