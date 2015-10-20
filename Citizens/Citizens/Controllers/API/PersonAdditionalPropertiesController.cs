using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using System.Web.Http;

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
    builder.EntitySet<PersonAdditionalProperty>("PersonAdditionalProperties");
    builder.EntitySet<Person>("People"); 
    builder.EntitySet<PropertyKey>("PropertyKeys"); 
    builder.EntitySet<PropertyValue>("PropertyValues"); 
    config.Routes.MapODataRoute("odata", "odata", builder.GetEdmModel());
    */
    
    public class PersonAdditionalPropertiesController : ODataController
    {
        private CitizenDbContext db = new CitizenDbContext();

        // GET: odata/PersonAdditionalProperties
        [EnableQuery]
        [Logger(Roles = "Operators, SuperAdministrators")] 
        public IQueryable<PersonAdditionalProperty> GetPersonAdditionalProperties()
        {
            return db.PersonAdditionalProperties;
        }

        // GET: odata/PersonAdditionalProperties(5)
        [EnableQuery]
        [Logger(Roles = "Operators, SuperAdministrators")] 
        [ODataRoute("PersonAdditionalProperties(PersonId={personId}, PropertyKeyId={propertyKeyId})")]
        public SingleResult<PersonAdditionalProperty> GetPersonAdditionalProperty([FromODataUri] int personId, [FromODataUri] int propertyKeyId)
        {
            return SingleResult.Create(db.PersonAdditionalProperties.Where(personAdditionalProperty => personAdditionalProperty.PersonId == personId && personAdditionalProperty.PropertyKeyId == propertyKeyId));
        }

        // PUT: odata/PersonAdditionalProperties(5)
        [ODataRoute("PersonAdditionalProperties(PersonId={personId}, PropertyKeyId={propertyKeyId})")]
        public async Task<IHttpActionResult> Put([FromODataUri] int personId, [FromODataUri] int propertyKeyId, Delta<PersonAdditionalProperty> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            object[] key = new object[2];

            key[0] = personId;
            key[1] = propertyKeyId;            

            PersonAdditionalProperty personAdditionalProperty = await db.PersonAdditionalProperties.FindAsync(key);
            if (personAdditionalProperty == null)
            {
                return NotFound();
            }

            patch.Put(personAdditionalProperty);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PersonAdditionalPropertyExists(personId, propertyKeyId))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(personAdditionalProperty);
        }

        // POST: odata/PersonAdditionalProperties
        public async Task<IHttpActionResult> Post(PersonAdditionalProperty personAdditionalProperty)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.PersonAdditionalProperties.Add(personAdditionalProperty);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (PersonAdditionalPropertyExists(personAdditionalProperty.PersonId, personAdditionalProperty.PropertyKeyId))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return Created(personAdditionalProperty);
        }

        // PATCH: odata/PersonAdditionalProperties(5)
        [AcceptVerbs("PATCH", "MERGE")]
        [ODataRoute("PersonAdditionalProperties(PersonId={personId}, PropertyKeyId={propertyKeyId})")]
        public async Task<IHttpActionResult> Patch([FromODataUri] int personId, [FromODataUri] int propertyKeyId, Delta<PersonAdditionalProperty> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            object[] key = new object[2];

            key[0] = personId;
            key[1] = propertyKeyId; 

            PersonAdditionalProperty personAdditionalProperty = await db.PersonAdditionalProperties.FindAsync(key);
            if (personAdditionalProperty == null)
            {
                return NotFound();
            }

            patch.Patch(personAdditionalProperty);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PersonAdditionalPropertyExists(personId, propertyKeyId))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(personAdditionalProperty);
        }

        // DELETE: odata/PersonAdditionalProperties(5)
        [ODataRoute("PersonAdditionalProperties(PersonId={personId}, PropertyKeyId={propertyKeyId})")]
        public async Task<IHttpActionResult> Delete([FromODataUri] int personId, [FromODataUri] int propertyKeyId)
        {
            object[] key = new object[2];

            key[0] = personId;
            key[1] = propertyKeyId;

            PersonAdditionalProperty personAdditionalProperty = await db.PersonAdditionalProperties.FindAsync(key);
            if (personAdditionalProperty == null)
            {
                return NotFound();
            }

            db.PersonAdditionalProperties.Remove(personAdditionalProperty);
            await db.SaveChangesAsync();

            return StatusCode(HttpStatusCode.NoContent);
        }

        // GET: odata/PersonAdditionalProperties(5)/Person
        [EnableQuery]
        [ODataRoute("PersonAdditionalProperties(PersonId={personId}, PropertyKeyId={propertyKeyId})/Person")]
        public SingleResult<Person> GetPerson([FromODataUri] int personId, [FromODataUri] int propertyKeyId)
        {
            return SingleResult.Create(db.PersonAdditionalProperties.Where(e => e.PersonId == personId && e.PropertyKeyId == propertyKeyId).Select(m => m.Person));
        }

        // GET: odata/PersonAdditionalProperties(5)/PropertyKey
        
        [EnableQuery]
        [ODataRoute("PersonAdditionalProperties(PersonId={personId}, PropertyKeyId={propertyKeyId})/PropertyKey")]
        public SingleResult<PropertyKey> GetPropertyKey([FromODataUri] int personId, [FromODataUri] int propertyKeyId)
        {
            return SingleResult.Create(db.PersonAdditionalProperties.Where(e => e.PersonId == personId && e.PropertyKeyId == propertyKeyId).Select(m => m.PropertyKey));
        }

        // GET: odata/PersonAdditionalProperties(5)/PropertyValue
        [EnableQuery]
        [ODataRoute("PersonAdditionalProperties(PersonId={personId}, PropertyKeyId={propertyKeyId})/PropertyValue")]
        public SingleResult<PropertyValue> GetPropertyValue([FromODataUri] int personId, [FromODataUri] int propertyKeyId)
        {
            return SingleResult.Create(db.PersonAdditionalProperties.Where(e => e.PersonId == personId && e.PropertyKeyId == propertyKeyId).Select(m => m.PropertyValue));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool PersonAdditionalPropertyExists(int personId, int propertyKeyId)
        {
            return db.PersonAdditionalProperties.Count(e => e.PersonId == personId && e.PropertyKeyId == propertyKeyId) > 0;
        }

        [HttpPost]
        [EnableQuery]
        public IHttpActionResult GetRange(ODataActionParameters parameters)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var param = parameters["Keys"] as IEnumerable<PersonAdditionalProperty>;
            if (param == null) return BadRequest("Not found parameter 'Keys'");
            
            var apKeys = param as PersonAdditionalProperty[] ?? param.ToArray();
            
            var propertyKeyIds = apKeys.Select(x => x.PropertyKeyId).Distinct();
            var personIds = apKeys.Select(x => x.PersonId).Distinct();
            var resp = db.PersonAdditionalProperties
                .Where(p => propertyKeyIds.Contains(p.PropertyKeyId) && personIds.Contains(p.PersonId))
                .ToList()
                .Join(apKeys, a => new { a.PersonId, a.PropertyKeyId }, 
                              p => new { p.PersonId, p.PropertyKeyId }, (k, v) => k);

            return Ok(resp);
        }

        [HttpPost]
        public async Task<IHttpActionResult> AddRange(ODataActionParameters parameters)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var paramProperties = parameters["Properties"] as IEnumerable<PersonAdditionalProperty>;
            if (paramProperties == null) return BadRequest("Properties can't be null");

            var properties = paramProperties as PersonAdditionalProperty[] ?? paramProperties.ToArray();
            if (properties.Length == 0) return StatusCode(HttpStatusCode.Created);

            var replaceExisting = (bool)parameters["ReplaceExisting"];

            var uniqueProperties = properties.Distinct(new PersonAdditionalPropertyComparer()).ToArray();

            db.PersonAdditionalProperties.AddRange(uniqueProperties
                .Where(p => db.PersonAdditionalProperties
                    .Count(a => a.PersonId == p.PersonId && a.PropertyKeyId == p.PropertyKeyId) == 0));

            if (replaceExisting)
            {
                uniqueProperties
                    .Join(db.PersonAdditionalProperties,
                        u => new { u.PersonId, u.PropertyKeyId },
                        p => new { p.PersonId, p.PropertyKeyId }, (src, des) => new { src, des })
                    .ToList()
                    .ForEach(it =>
                        {
                            it.des.GetType().GetProperties().ToList().ForEach(propInfo =>
                            {
                                if (propInfo.CanRead && propInfo.CanWrite)
                                {
                                    propInfo.SetValue(it.des, propInfo.GetValue(it.src));
                                }
                            });
                        });
            }

            await db.SaveChangesAsync();
            
            return StatusCode(HttpStatusCode.Created);
        }

        [HttpPost]
        public async Task<IHttpActionResult> RemoveRange(ODataActionParameters parameters)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var paramProperties = parameters["Properties"] as IEnumerable<PersonAdditionalProperty>;
            if (paramProperties == null) return BadRequest("Properties can't be null");

            var properties = paramProperties as PersonAdditionalProperty[] ?? paramProperties.ToArray();
            if (properties.Length == 0) return StatusCode(HttpStatusCode.NoContent);

            var valuePropertyName = string.Empty;

            try
            {
                valuePropertyName = (string)parameters["ValuePropertyName"];
            }
            catch (KeyNotFoundException) {/*NOP*/}

            var removingItems = properties
                .Join(db.PersonAdditionalProperties,
                    p1 => new {p1.PersonId, p1.PropertyKeyId},
                    p2 => new {p2.PersonId, p2.PropertyKeyId}, (k, v) => v)
                .ToList();

            if (!string.IsNullOrEmpty(valuePropertyName))
            {
                var propInfo = typeof (PersonAdditionalProperty).GetProperty(valuePropertyName);
                var values = properties.Select(p => propInfo.GetValue(p)).Distinct().Where(v => v != null);
                removingItems = removingItems.Where(p => values.Contains(propInfo.GetValue(p))).ToList();
            }

            db.PersonAdditionalProperties.RemoveRange(removingItems);

            await db.SaveChangesAsync();
            
            return StatusCode(HttpStatusCode.NoContent);
        }
    }

    class PersonAdditionalPropertyComparer : IEqualityComparer<PersonAdditionalProperty>
    {
        public bool Equals(PersonAdditionalProperty x, PersonAdditionalProperty y)
        {
            return x.PersonId == y.PersonId && x.PropertyKeyId == y.PropertyKeyId;
        }

        public int GetHashCode(PersonAdditionalProperty obj)
        {
            return obj.PersonId.GetHashCode() ^ obj.PropertyKeyId.GetHashCode();
        }
    }

}
