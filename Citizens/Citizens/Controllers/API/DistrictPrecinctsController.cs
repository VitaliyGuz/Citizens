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
    builder.EntitySet<DistrictPrecinct>("DistrictPrecincts");
    builder.EntitySet<District>("Districts"); 
    builder.EntitySet<Precinct>("Precincts"); 
    config.Routes.MapODataRoute("odata", "odata", builder.GetEdmModel());
    */
    public class DistrictPrecinctsController : ODataController
    {
        private CitizenDbContext db = new CitizenDbContext();

        // GET: odata/DistrictPrecincts
        [EnableQuery]
        public IQueryable<DistrictPrecinct> GetDistrictPrecincts()
        {
            return db.DistrictPrecincts;
        }

        // GET: odata/DistrictPrecincts(5,5)
        [EnableQuery]
        [ODataRoute("DistrictPrecincts(DistrictId={districtId}, PrecinctId={precinctId})")]
        public SingleResult<DistrictPrecinct> GetDistrictPrecinct([FromODataUri] int districtId, [FromODataUri] int precinctId)
        {
            return SingleResult.Create(db.DistrictPrecincts.Where(districtPrecinct => districtPrecinct.DistrictId == districtId && districtPrecinct.PrecinctId == precinctId));
        }

        // PUT: odata/DistrictPrecincts(5)
        [ODataRoute("DistrictPrecincts(DistrictId={districtId}, PrecinctId={precinctId})")]
        public async Task<IHttpActionResult> Put([FromODataUri] int districtId, [FromODataUri] int precinctId, Delta<DistrictPrecinct> patch)
        {
            DistrictPrecinct dbEntity = patch.GetEntity();
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            object[] key = new object[2];

            key[0] = districtId;
            key[1] = precinctId;

            DistrictPrecinct districtPrecinct = await db.DistrictPrecincts.FindAsync(key);
            if (districtPrecinct == null)
            {
                return NotFound();
            }

            //patch.Put(districtPrecinct);
            db.DistrictPrecincts.Remove(districtPrecinct);
            db.DistrictPrecincts.Add(dbEntity);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DistrictPrecinctExists(districtId, precinctId))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(districtPrecinct);
        }

        // POST: odata/DistrictPrecincts
        public async Task<IHttpActionResult> Post(DistrictPrecinct districtPrecinct)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.DistrictPrecincts.Add(districtPrecinct);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (DistrictPrecinctExists(districtPrecinct.DistrictId, districtPrecinct.PrecinctId))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return Created(districtPrecinct);
        }

        // PATCH: odata/DistrictPrecincts(5)
        [AcceptVerbs("PATCH", "MERGE")]
        [ODataRoute("DistrictPrecincts(DistrictId={districtId}, PrecinctId={precinctId})")]
        public async Task<IHttpActionResult> Patch([FromODataUri] int districtId, [FromODataUri] int precinctId, Delta<DistrictPrecinct> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            object[] key = new object[2];

            key[0] = districtId;
            key[1] = precinctId;

            DistrictPrecinct districtPrecinct = await db.DistrictPrecincts.FindAsync(key);
            if (districtPrecinct == null)
            {
                return NotFound();
            }

            patch.Patch(districtPrecinct);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DistrictPrecinctExists(districtId, precinctId))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(districtPrecinct);
        }

        // DELETE: odata/DistrictPrecincts(5)
        [ODataRoute("DistrictPrecincts(DistrictId={districtId}, PrecinctId={precinctId})")]
        public async Task<IHttpActionResult> Delete([FromODataUri] int districtId, [FromODataUri] int precinctId)
        {

            object[] key = new object[2];

            key[0] = districtId;
            key[1] = precinctId;

            DistrictPrecinct districtPrecinct = await db.DistrictPrecincts.FindAsync(key);
            if (districtPrecinct == null)
            {
                return NotFound();
            }

            db.DistrictPrecincts.Remove(districtPrecinct);
            await db.SaveChangesAsync();

            return StatusCode(HttpStatusCode.NoContent);
        }

        // GET: odata/DistrictPrecincts(5, 5)/District
        [EnableQuery]
        [ODataRoute("DistrictPrecincts(DistrictId={districtId}, PrecinctId={precinctId})/District")]
        public SingleResult<District> GetDistrict([FromODataUri] int districtId, [FromODataUri] int precinctId)
        {
            return SingleResult.Create(db.DistrictPrecincts.Where(districtPrecinct => districtPrecinct.DistrictId == districtId && districtPrecinct.PrecinctId == precinctId).Select(m => m.District));
        }

        // GET: odata/DistrictPrecincts(5, 5)/Precinct
        [EnableQuery]
        [ODataRoute("DistrictPrecincts(DistrictId={districtId}, PrecinctId={precinctId})/Precinct")]
        public SingleResult<Precinct> GetPrecinct([FromODataUri] int districtId, [FromODataUri] int precinctId)
        {
            return SingleResult.Create(db.DistrictPrecincts.Where(districtPrecinct => districtPrecinct.DistrictId == districtId && districtPrecinct.PrecinctId == precinctId).Select(m => m.Precinct));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool DistrictPrecinctExists(int districtId,  int precinctId)
        {
            return db.DistrictPrecincts.Count(districtPrecinct => districtPrecinct.DistrictId == districtId && districtPrecinct.PrecinctId == precinctId) > 0;
        }
    }
}
