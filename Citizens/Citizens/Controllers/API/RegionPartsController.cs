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
    builder.EntitySet<RegionPart>("RegionParts");
    builder.EntitySet<Region>("Regions"); 
    config.Routes.MapODataRoute("odata", "odata", builder.GetEdmModel());
    */
    public class RegionPartsController : ODataController
    {
        private CitizenDbContext db = new CitizenDbContext();

        // GET: odata/RegionParts
        [EnableQuery]
        public IQueryable<RegionPart> GetRegionParts()
        {
            return db.RegionParts;
        }

        // GET: odata/RegionParts(5)
        [EnableQuery]
        public SingleResult<RegionPart> GetRegionPart([FromODataUri] int key)
        {
            return SingleResult.Create(db.RegionParts.Where(regionPart => regionPart.Id == key));
        }

        // PUT: odata/RegionParts(5)
        public async Task<IHttpActionResult> Put([FromODataUri] int key, Delta<RegionPart> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            RegionPart regionPart = await db.RegionParts.FindAsync(key);
            if (regionPart == null)
            {
                return NotFound();
            }

            patch.Put(regionPart);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RegionPartExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(regionPart);
        }

        // POST: odata/RegionParts
        public async Task<IHttpActionResult> Post(RegionPart regionPart)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.RegionParts.Add(regionPart);
            await db.SaveChangesAsync();

            return Created(regionPart);
        }

        // PATCH: odata/RegionParts(5)
        [AcceptVerbs("PATCH", "MERGE")]
        public async Task<IHttpActionResult> Patch([FromODataUri] int key, Delta<RegionPart> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            RegionPart regionPart = await db.RegionParts.FindAsync(key);
            if (regionPart == null)
            {
                return NotFound();
            }

            patch.Patch(regionPart);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RegionPartExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(regionPart);
        }

        // DELETE: odata/RegionParts(5)
        public async Task<IHttpActionResult> Delete([FromODataUri] int key)
        {
            RegionPart regionPart = await db.RegionParts.FindAsync(key);
            if (regionPart == null)
            {
                return NotFound();
            }

            db.RegionParts.Remove(regionPart);
            await db.SaveChangesAsync();

            return StatusCode(HttpStatusCode.NoContent);
        }

        // GET: odata/RegionParts(5)/Regin
        [EnableQuery]
        public SingleResult<Region> GetRegion([FromODataUri] int key)
        {
            return SingleResult.Create(db.RegionParts.Where(m => m.Id == key).Select(m => m.Region));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool RegionPartExists(int key)
        {
            return db.RegionParts.Count(e => e.Id == key) > 0;
        }
    }
}
