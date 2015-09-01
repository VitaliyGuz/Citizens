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
    builder.EntitySet<CityType>("CityTypes");
    config.Routes.MapODataRoute("odata", "odata", builder.GetEdmModel());
    */
     
    public class CityTypesController : ODataController
    {
        private CitizenDbContext db = new CitizenDbContext();

        // GET: odata/CityTypes
        [EnableQuery]
        [Logger(Roles = "Operators, SuperAdministrators")] 
        public IQueryable<CityType> GetCityTypes()
        {
            return db.CityTypes;
        }

        // GET: odata/CityTypes(5)
        [EnableQuery]
        [Logger(Roles = "Operators, SuperAdministrators")] 
        public SingleResult<CityType> GetCityType([FromODataUri] int key)
        {
            return SingleResult.Create(db.CityTypes.Where(cityType => cityType.Id == key));
        }

        // PUT: odata/CityTypes(5)
        [Logger(Roles = "SuperAdministrators")]   
        public async Task<IHttpActionResult> Put([FromODataUri] int key, Delta<CityType> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            CityType cityType = await db.CityTypes.FindAsync(key);
            if (cityType == null)
            {
                return NotFound();
            }

            patch.Put(cityType);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CityTypeExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(cityType);
        }

        // POST: odata/CityTypes
       [Logger(Roles = "SuperAdministrators")]   
        public async Task<IHttpActionResult> Post(CityType cityType)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.CityTypes.Add(cityType);
            await db.SaveChangesAsync();

            return Created(cityType);
        }

        // PATCH: odata/CityTypes(5)
        [AcceptVerbs("PATCH", "MERGE")]
        [Logger(Roles = "SuperAdministrators")]   
        public async Task<IHttpActionResult> Patch([FromODataUri] int key, Delta<CityType> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            CityType cityType = await db.CityTypes.FindAsync(key);
            if (cityType == null)
            {
                return NotFound();
            }

            patch.Patch(cityType);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CityTypeExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(cityType);
        }

        // DELETE: odata/CityTypes(5)
        [Logger(Roles = "SuperAdministrators")]   
        public async Task<IHttpActionResult> Delete([FromODataUri] int key)
        {
            CityType cityType = await db.CityTypes.FindAsync(key);
            if (cityType == null)
            {
                return NotFound();
            }

            db.CityTypes.Remove(cityType);
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

        private bool CityTypeExists(int key)
        {
            return db.CityTypes.Count(e => e.Id == key) > 0;
        }
    }
}
