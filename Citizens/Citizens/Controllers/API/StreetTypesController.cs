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
    builder.EntitySet<StreetType>("StreetTypes");
    config.Routes.MapODataRoute("odata", "odata", builder.GetEdmModel());
    */
    public class StreetTypesController : ODataController
    {
        private CitizenDbContext db = new CitizenDbContext();

        // GET: odata/StreetTypes
        [EnableQuery]
        public IQueryable<StreetType> GetStreetTypes()
        {
            return db.StreetTypes;
        }

        // GET: odata/StreetTypes(5)
        [EnableQuery]
        public SingleResult<StreetType> GetStreetType([FromODataUri] int key)
        {
            return SingleResult.Create(db.StreetTypes.Where(streetType => streetType.Id == key));
        }

        // PUT: odata/StreetTypes(5)
        public async Task<IHttpActionResult> Put([FromODataUri] int key, Delta<StreetType> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            StreetType streetType = await db.StreetTypes.FindAsync(key);
            if (streetType == null)
            {
                return NotFound();
            }

            patch.Put(streetType);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!StreetTypeExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(streetType);
        }

        // POST: odata/StreetTypes
        public async Task<IHttpActionResult> Post(StreetType streetType)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.StreetTypes.Add(streetType);
            await db.SaveChangesAsync();

            return Created(streetType);
        }

        // PATCH: odata/StreetTypes(5)
        [AcceptVerbs("PATCH", "MERGE")]
        public async Task<IHttpActionResult> Patch([FromODataUri] int key, Delta<StreetType> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            StreetType streetType = await db.StreetTypes.FindAsync(key);
            if (streetType == null)
            {
                return NotFound();
            }

            patch.Patch(streetType);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!StreetTypeExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(streetType);
        }

        // DELETE: odata/StreetTypes(5)
        public async Task<IHttpActionResult> Delete([FromODataUri] int key)
        {
            StreetType streetType = await db.StreetTypes.FindAsync(key);
            if (streetType == null)
            {
                return NotFound();
            }

            db.StreetTypes.Remove(streetType);
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

        private bool StreetTypeExists(int key)
        {
            return db.StreetTypes.Count(e => e.Id == key) > 0;
        }
    }
}
