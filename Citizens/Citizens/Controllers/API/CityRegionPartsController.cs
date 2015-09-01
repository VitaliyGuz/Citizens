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
    builder.EntitySet<CityRegionPart>("CityRegionParts");
    builder.EntitySet<City>("Cities"); 
    builder.EntitySet<RegionPart>("RegionParts"); 
    config.Routes.MapODataRoute("odata", "odata", builder.GetEdmModel());
    */
    [Logger(Roles = "SuperAdministrators")]        
    public class CityRegionPartsController : ODataController
    {
        private CitizenDbContext db = new CitizenDbContext();

        // GET: odata/CityRegionParts
        [EnableQuery]
        [Logger(Roles = "Operators")] 
        public IQueryable<CityRegionPart> GetCityRegionParts()
        {
            return db.CityRegionParts;
        }

        // GET: odata/CityRegionParts(5, 5)
        [EnableQuery]
        [Logger(Roles = "Operators")] 
        [ODataRoute("CityRegionParts(CityId={cityId}, RegionPartId={regionPartId})")]
        public SingleResult<CityRegionPart> GetCityRegionPart([FromODataUri] int cityId, [FromODataUri] int regionPartId)
        {
            return SingleResult.Create(db.CityRegionParts.Where(cityRegionPart => cityRegionPart.CityId == cityId && cityRegionPart.RegionPartId == regionPartId));            
        }

        // PUT: odata/CityRegionParts(5, 5)
        [ODataRoute("CityRegionParts(CityId={cityId}, RegionPartId={regionPartId})")]
        public async Task<IHttpActionResult> Put([FromODataUri] int cityId, [FromODataUri] int regionPartId, Delta<CityRegionPart> patch)
        {
            CityRegionPart dbEntity = patch.GetEntity();
            Validate(dbEntity);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            object[] key = new object[2];

            key[0] = cityId;
            key[1] = regionPartId;            

            CityRegionPart cityRegionPart = await db.CityRegionParts.FindAsync(key);
            if (cityRegionPart == null)
            {
                return NotFound();
            }

            //patch.Put(cityRegionPart);
            db.CityRegionParts.Remove(cityRegionPart);
            db.CityRegionParts.Add(dbEntity);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CityRegionPartExists(dbEntity.CityId, dbEntity.RegionPartId))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Created(dbEntity);
        }

        // POST: odata/CityRegionParts
        public async Task<IHttpActionResult> Post(CityRegionPart cityRegionPart)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.CityRegionParts.Add(cityRegionPart);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (CityRegionPartExists(cityRegionPart.CityId, cityRegionPart.RegionPartId))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return Created(cityRegionPart);
        }

        // PATCH: odata/CityRegionParts(5)
        [AcceptVerbs("PATCH", "MERGE")]
        [ODataRoute("CityRegionParts(CityId={cityId}, RegionPartId={regionPartId})")]
        public async Task<IHttpActionResult> Patch([FromODataUri] int cityId, [FromODataUri] int regionPartId, Delta<CityRegionPart> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            object[] key = new object[3];

            key[0] = cityId;
            key[1] = regionPartId; 

            CityRegionPart cityRegionPart = await db.CityRegionParts.FindAsync(key);
            if (cityRegionPart == null)
            {
                return NotFound();
            }

            patch.Patch(cityRegionPart);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CityRegionPartExists(cityId, regionPartId))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(cityRegionPart);
        }

        // DELETE: odata/CityRegionParts(5)
        [ODataRoute("CityRegionParts(CityId={cityId}, RegionPartId={regionPartId})")]
        public async Task<IHttpActionResult> Delete([FromODataUri] int cityId, [FromODataUri] int regionPartId)
        {
            object[] key = new object[2];

            key[0] = cityId;
            key[1] = regionPartId;

            CityRegionPart cityRegionPart = await db.CityRegionParts.FindAsync(key);
            if (cityRegionPart == null)
            {
                return NotFound();
            }

            db.CityRegionParts.Remove(cityRegionPart);
            await db.SaveChangesAsync();

            return StatusCode(HttpStatusCode.NoContent);
        }

        // GET: odata/CityRegionParts(5)/City
        [EnableQuery]
        [ODataRoute("CityRegionParts(CityId={cityId}, RegionPartId={regionPartId})/City")]
        public SingleResult<City> GetCity([FromODataUri] int cityId, [FromODataUri] int regionPartId)
        {
            return SingleResult.Create(db.CityRegionParts.Where(cityRegionPart => cityRegionPart.CityId == cityId && cityRegionPart.RegionPartId == regionPartId).Select(m => m.City));
        }

        // GET: odata/CityRegionParts(5)/RegionPart
        [EnableQuery]
        [ODataRoute("CityRegionParts(CityId={cityId}, RegionPartId={regionPartId})/RegionPart")]
        public SingleResult<RegionPart> GetRegionPart([FromODataUri] int cityId, [FromODataUri] int regionPartId)
        {
            return SingleResult.Create(db.CityRegionParts.Where(cityRegionPart => cityRegionPart.CityId == cityId && cityRegionPart.RegionPartId == regionPartId).Select(m => m.RegionPart));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool CityRegionPartExists( int cityId,  int regionPartId)
        {
            return db.CityRegionParts.Count(cityRegionPart => cityRegionPart.CityId == cityId && cityRegionPart.RegionPartId == regionPartId) > 0;
        }
    }
}
