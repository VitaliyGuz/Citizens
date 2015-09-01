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
    builder.EntitySet<PropertyKey>("PropertyKeys");
    builder.EntitySet<PersonAdditionalProperty>("PersonAdditionalProperties"); 
    builder.EntitySet<PropertyValue>("PropertyValues"); 
    config.Routes.MapODataRoute("odata", "odata", builder.GetEdmModel());
    */
    [Logger(Roles = "SuperAdministrators")]        
    public class PropertyKeysController : ODataController
    {
        private CitizenDbContext db = new CitizenDbContext();

        // GET: odata/PropertyKeys
        [EnableQuery]
        [Logger(Roles = "Operators")] 
        public IQueryable<PropertyKey> GetPropertyKeys()
        {
            return db.PropertyKeys;
        }

        // GET: odata/PropertyKeys(5)
        [EnableQuery]
        [Logger(Roles = "Operators")] 
        public SingleResult<PropertyKey> GetPropertyKey([FromODataUri] int key)
        {
            return SingleResult.Create(db.PropertyKeys.Where(propertyKey => propertyKey.Id == key));
        }

        // PUT: odata/PropertyKeys(5)
        public async Task<IHttpActionResult> Put([FromODataUri] int key, Delta<PropertyKey> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            PropertyKey propertyKey = await db.PropertyKeys.FindAsync(key);
            if (propertyKey == null)
            {
                return NotFound();
            }

            patch.Put(propertyKey);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PropertyKeyExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(propertyKey);
        }

        // POST: odata/PropertyKeys
        public async Task<IHttpActionResult> Post(PropertyKey propertyKey)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.PropertyKeys.Add(propertyKey);
            await db.SaveChangesAsync();

            return Created(propertyKey);
        }

        // PATCH: odata/PropertyKeys(5)
        [AcceptVerbs("PATCH", "MERGE")]
        public async Task<IHttpActionResult> Patch([FromODataUri] int key, Delta<PropertyKey> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            PropertyKey propertyKey = await db.PropertyKeys.FindAsync(key);
            if (propertyKey == null)
            {
                return NotFound();
            }

            patch.Patch(propertyKey);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PropertyKeyExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(propertyKey);
        }

        // DELETE: odata/PropertyKeys(5)
        public async Task<IHttpActionResult> Delete([FromODataUri] int key)
        {
            PropertyKey propertyKey = await db.PropertyKeys.FindAsync(key);
            if (propertyKey == null)
            {
                return NotFound();
            }

            db.PropertyKeys.Remove(propertyKey);
            await db.SaveChangesAsync();

            return StatusCode(HttpStatusCode.NoContent);
        }

        // GET: odata/PropertyKeys(5)/PersonAdditionalProperties
        [EnableQuery]
        public IQueryable<PersonAdditionalProperty> GetPersonAdditionalProperties([FromODataUri] int key)
        {
            return db.PropertyKeys.Where(m => m.Id == key).SelectMany(m => m.PersonAdditionalProperties);
        }

        // GET: odata/PropertyKeys(5)/PropertyValues
        [EnableQuery]
        public IQueryable<PropertyValue> GetPropertyValues([FromODataUri] int key)
        {
            return db.PropertyKeys.Where(m => m.Id == key).SelectMany(m => m.PropertyValues);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool PropertyKeyExists(int key)
        {
            return db.PropertyKeys.Count(e => e.Id == key) > 0;
        }
    }
}
