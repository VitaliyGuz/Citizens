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
using Citizens.Models;

namespace Citizens.Controllers.API
{
    /*
    The WebApiConfig class may require additional changes to add a route for this controller. Merge these statements into the Register method of the WebApiConfig class as applicable. Note that OData URLs are case sensitive.

    using System.Web.Http.OData.Builder;
    using Citizens.Models;
    ODataConventionModelBuilder builder = new ODataConventionModelBuilder();
    builder.EntitySet<Neighborhood>("Neighborhoods");
    config.Routes.MapODataRoute("odata", "odata", builder.GetEdmModel());
    */
    [Logger(Roles = "SuperAdministrators")]        
    public class NeighborhoodsController : ODataController
    {
        private CitizenDbContext db = new CitizenDbContext();

        // GET: odata/Neighborhoods
        [EnableQuery]
        [Logger(Roles = "Operators")] 
        public IQueryable<Neighborhood> GetNeighborhoods()
        {
            return db.Neighborhoods;
        }

        // GET: odata/Neighborhoods(5)
        [EnableQuery]
        [Logger(Roles = "Operators")] 
        public SingleResult<Neighborhood> GetNeighborhood([FromODataUri] int key)
        {
            return SingleResult.Create(db.Neighborhoods.Where(neighborhood => neighborhood.Id == key));
        }

        // PUT: odata/Neighborhoods(5)
        public async Task<IHttpActionResult> Put([FromODataUri] int key, Delta<Neighborhood> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Neighborhood neighborhood = await db.Neighborhoods.FindAsync(key);
            if (neighborhood == null)
            {
                return NotFound();
            }

            patch.Put(neighborhood);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!NeighborhoodExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(neighborhood);
        }

        // POST: odata/Neighborhoods
        public async Task<IHttpActionResult> Post(Neighborhood neighborhood)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.Neighborhoods.Add(neighborhood);
            await db.SaveChangesAsync();

            return Created(neighborhood);
        }

        // PATCH: odata/Neighborhoods(5)
        [AcceptVerbs("PATCH", "MERGE")]
        public async Task<IHttpActionResult> Patch([FromODataUri] int key, Delta<Neighborhood> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Neighborhood neighborhood = await db.Neighborhoods.FindAsync(key);
            if (neighborhood == null)
            {
                return NotFound();
            }

            patch.Patch(neighborhood);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!NeighborhoodExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(neighborhood);
        }

        // DELETE: odata/Neighborhoods(5)
        public async Task<IHttpActionResult> Delete([FromODataUri] int key)
        {
            Neighborhood neighborhood = await db.Neighborhoods.FindAsync(key);
            if (neighborhood == null)
            {
                return NotFound();
            }

            db.Neighborhoods.Remove(neighborhood);
            await db.SaveChangesAsync();

            return StatusCode(HttpStatusCode.NoContent);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool NeighborhoodExists(int key)
        {
            return db.Neighborhoods.Count(e => e.Id == key) > 0;
        }
    }
}
