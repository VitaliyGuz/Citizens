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
    builder.EntitySet<District>("Districts");
    builder.EntitySet<Precinct>("Precincts"); 
    config.Routes.MapODataRoute("odata", "odata", builder.GetEdmModel());
    */
    public class DistrictsController : ODataController
    {
        private CitizenDbContext db = new CitizenDbContext();

        // GET: odata/Districts
        [EnableQuery]
        public IQueryable<District> GetDistricts()
        {
            return db.Districts;
        }

        // GET: odata/Districts(5)
        [EnableQuery]
        public SingleResult<District> GetDistrict([FromODataUri] int key)
        {
            return SingleResult.Create(db.Districts.Where(district => district.Id == key));
        }

        // PUT: odata/Districts(5)
        public async Task<IHttpActionResult> Put([FromODataUri] int key, Delta<District> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            District district = await db.Districts.FindAsync(key);
            if (district == null)
            {
                return NotFound();
            }

            patch.Put(district);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DistrictExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(district);
        }

        // POST: odata/Districts
        public async Task<IHttpActionResult> Post(District district)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.Districts.Add(district);
            await db.SaveChangesAsync();

            return Created(district);
        }

        // PATCH: odata/Districts(5)
        [AcceptVerbs("PATCH", "MERGE")]
        public async Task<IHttpActionResult> Patch([FromODataUri] int key, Delta<District> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            District district = await db.Districts.FindAsync(key);
            if (district == null)
            {
                return NotFound();
            }

            patch.Patch(district);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DistrictExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(district);
        }

        // DELETE: odata/Districts(5)
        public async Task<IHttpActionResult> Delete([FromODataUri] int key)
        {
            District district = await db.Districts.FindAsync(key);
            if (district == null)
            {
                return NotFound();
            }

            db.Districts.Remove(district);
            await db.SaveChangesAsync();

            return StatusCode(HttpStatusCode.NoContent);
        }

        //// GET: odata/Districts(5)/Precincts
        //[EnableQuery]
        //public IQueryable<Precinct> GetPrecincts([FromODataUri] int key)
        //{
        //    return db.Districts.Where(m => m.Id == key).SelectMany(m => m.Precincts);
        //}

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool DistrictExists(int key)
        {
            return db.Districts.Count(e => e.Id == key) > 0;
        }
    }
}
