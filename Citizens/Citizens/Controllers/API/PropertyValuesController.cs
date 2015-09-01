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
    builder.EntitySet<PropertyValue>("PropertyValues");
    builder.EntitySet<PersonAdditionalProperty>("PersonAdditionalProperties"); 
    builder.EntitySet<PropertyKey>("PropertyKeys"); 
    config.Routes.MapODataRoute("odata", "odata", builder.GetEdmModel());
    */
          
    public class PropertyValuesController : ODataController
    {
        private CitizenDbContext db = new CitizenDbContext();

        // GET: odata/PropertyValues
        [EnableQuery]
        [Logger(Roles = "Operators, SuperAdministrators")] 
        public IQueryable<PropertyValue> GetPropertyValues()
        {
            return db.PropertyValues;
        }

        // GET: odata/PropertyValues(5)
        [EnableQuery]
        [Logger(Roles = "Operators, SuperAdministrators")] 
        public SingleResult<PropertyValue> GetPropertyValue([FromODataUri] int key)
        {
            return SingleResult.Create(db.PropertyValues.Where(propertyValue => propertyValue.Id == key));
        }

        // PUT: odata/PropertyValues(5)
        [Logger(Roles = "SuperAdministrators")]
        public async Task<IHttpActionResult> Put([FromODataUri] int key, Delta<PropertyValue> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            PropertyValue propertyValue = await db.PropertyValues.FindAsync(key);
            if (propertyValue == null)
            {
                return NotFound();
            }

            patch.Put(propertyValue);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PropertyValueExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(propertyValue);
        }

        // POST: odata/PropertyValues
        [Logger(Roles = "SuperAdministrators")]
        public async Task<IHttpActionResult> Post(PropertyValue propertyValue)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.PropertyValues.Add(propertyValue);
            await db.SaveChangesAsync();

            return Created(propertyValue);
        }

        // PATCH: odata/PropertyValues(5)
        [AcceptVerbs("PATCH", "MERGE")]
        [Logger(Roles = "SuperAdministrators")]
        public async Task<IHttpActionResult> Patch([FromODataUri] int key, Delta<PropertyValue> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            PropertyValue propertyValue = await db.PropertyValues.FindAsync(key);
            if (propertyValue == null)
            {
                return NotFound();
            }

            patch.Patch(propertyValue);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PropertyValueExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(propertyValue);
        }

        // DELETE: odata/PropertyValues(5)
        [Logger(Roles = "SuperAdministrators")]
        public async Task<IHttpActionResult> Delete([FromODataUri] int key)
        {
            PropertyValue propertyValue = await db.PropertyValues.FindAsync(key);
            if (propertyValue == null)
            {
                return NotFound();
            }

            db.PropertyValues.Remove(propertyValue);
            await db.SaveChangesAsync();

            return StatusCode(HttpStatusCode.NoContent);
        }

        // GET: odata/PropertyValues(5)/PersonAdditionalProperties
        [EnableQuery]
        public IQueryable<PersonAdditionalProperty> GetPersonAdditionalProperties([FromODataUri] int key)
        {
            return db.PropertyValues.Where(m => m.Id == key).SelectMany(m => m.PersonAdditionalProperties);
        }

        // GET: odata/PropertyValues(5)/PropertyKey
        [EnableQuery]
        public SingleResult<PropertyKey> GetPropertyKey([FromODataUri] int key)
        {
            return SingleResult.Create(db.PropertyValues.Where(m => m.Id == key).Select(m => m.PropertyKey));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool PropertyValueExists(int key)
        {
            return db.PropertyValues.Count(e => e.Id == key) > 0;
        }
    }
}
