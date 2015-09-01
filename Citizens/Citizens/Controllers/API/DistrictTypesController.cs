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
    builder.EntitySet<DistrictType>("DistrictTypes");
    config.Routes.MapODataRoute("odata", "odata", builder.GetEdmModel());
    */
            
    public class DistrictTypesController : ODataController
    {
        private CitizenDbContext db = new CitizenDbContext();

        // GET: odata/DistrictTypes
        [EnableQuery]
        [Logger(Roles = "Operators, SuperAdministrators")] 
        public IQueryable<DistrictType> GetDistrictTypes()
        {
            return db.DistrictTypes;
        }

        // GET: odata/DistrictTypes(5)
        [EnableQuery]
        [Logger(Roles = "Operators, SuperAdministrators")] 
        public SingleResult<DistrictType> GetDistrictType([FromODataUri] int key)
        {
            return SingleResult.Create(db.DistrictTypes.Where(districtType => districtType.Id == key));
        }

        // PUT: odata/DistrictTypes(5)
        [Logger(Roles = "SuperAdministrators")]
        public async Task<IHttpActionResult> Put([FromODataUri] int key, Delta<DistrictType> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            DistrictType districtType = await db.DistrictTypes.FindAsync(key);
            if (districtType == null)
            {
                return NotFound();
            }

            patch.Put(districtType);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DistrictTypeExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(districtType);
        }

        // POST: odata/DistrictTypes
        [Logger(Roles = "SuperAdministrators")]
        public async Task<IHttpActionResult> Post(DistrictType districtType)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.DistrictTypes.Add(districtType);
            await db.SaveChangesAsync();

            return Created(districtType);
        }

        // PATCH: odata/DistrictTypes(5)
        [AcceptVerbs("PATCH", "MERGE")]
        [Logger(Roles = "SuperAdministrators")]
        public async Task<IHttpActionResult> Patch([FromODataUri] int key, Delta<DistrictType> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            DistrictType districtType = await db.DistrictTypes.FindAsync(key);
            if (districtType == null)
            {
                return NotFound();
            }

            patch.Patch(districtType);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DistrictTypeExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(districtType);
        }

        // DELETE: odata/DistrictTypes(5)
        [Logger(Roles = "SuperAdministrators")]
        public async Task<IHttpActionResult> Delete([FromODataUri] int key)
        {
            DistrictType districtType = await db.DistrictTypes.FindAsync(key);
            if (districtType == null)
            {
                return NotFound();
            }

            db.DistrictTypes.Remove(districtType);
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

        private bool DistrictTypeExists(int key)
        {
            return db.DistrictTypes.Count(e => e.Id == key) > 0;
        }
    }
}
