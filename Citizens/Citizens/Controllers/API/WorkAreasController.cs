using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Web.Http;
using System.Web.OData;
using Citizens.Models;

namespace Citizens.Controllers.API
{
    /*
    The WebApiConfig class may require additional changes to add a route for this controller. Merge these statements into the Register method of the WebApiConfig class as applicable. Note that OData URLs are case sensitive.

    using System.Web.Http.OData.Builder;
    using Citizens.Models;
    ODataConventionModelBuilder builder = new ODataConventionModelBuilder();
    builder.EntitySet<WorkArea>("WorkAreas");
    builder.EntitySet<Precinct>("Precincts"); 
    builder.EntitySet<PrecinctAddress>("PrecinctAddresses"); 
    builder.EntitySet<Person>("People"); 
    config.Routes.MapODataRoute("odata", "odata", builder.GetEdmModel());
    */
    [Logger()]        
    public class WorkAreasController : ODataController
    {
        private CitizenDbContext db = new CitizenDbContext();

        [Logger(Roles = "Operators, SuperAdministrators")] 
        // GET: odata/WorkAreas
        [EnableQuery]
        public IQueryable<WorkArea> GetWorkAreas()
        {
            return db.WorkAreas;
        }

        // GET: odata/WorkAreas(5)
        [Logger(Roles = "Operators, SuperAdministrators")] 
        [EnableQuery]
        public SingleResult<WorkArea> GetWorkArea([FromODataUri] int key)
        {
            return SingleResult.Create(db.WorkAreas.Where(workArea => workArea.Id == key));
        }

        // PUT: odata/WorkAreas(5)
        [Logger(Roles = "Operators, SuperAdministrators")] 
        public IHttpActionResult Put([FromODataUri] int key, Delta<WorkArea> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            WorkArea workArea = db.WorkAreas.Find(key);
            if (workArea == null)
            {
                return NotFound();
            }

            patch.Put(workArea);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!WorkAreaExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(workArea);
        }

        // POST: odata/WorkAreas
        [Logger(Roles = "Operators, SuperAdministrators")] 
        public IHttpActionResult Post(WorkArea workArea)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.WorkAreas.Add(workArea);
            db.SaveChanges();

            return Created(workArea);
        }

        // PATCH: odata/WorkAreas(5)
        [AcceptVerbs("PATCH", "MERGE")]
        [Logger(Roles = "Operators, SuperAdministrators")] 
        public IHttpActionResult Patch([FromODataUri] int key, Delta<WorkArea> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            WorkArea workArea = db.WorkAreas.Find(key);
            if (workArea == null)
            {
                return NotFound();
            }

            patch.Patch(workArea);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!WorkAreaExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(workArea);
        }

        // DELETE: odata/WorkAreas(5)
        [Logger(Roles = "Operators, SuperAdministrators")] 
        public IHttpActionResult Delete([FromODataUri] int key)
        {
            WorkArea workArea = db.WorkAreas.Find(key);
            if (workArea == null)
            {
                return NotFound();
            }

            db.WorkAreas.Remove(workArea);
            db.SaveChanges();

            return StatusCode(HttpStatusCode.NoContent);
        }

        // GET: odata/WorkAreas(5)/Precinct
        [EnableQuery]
        public SingleResult<Precinct> GetPrecinct([FromODataUri] int key)
        {
            return SingleResult.Create(db.WorkAreas.Where(m => m.Id == key).Select(m => m.Precinct));
        }

        // GET: odata/WorkAreas(5)/PrecinctAddresses
        [EnableQuery]
        public IQueryable<PrecinctAddress> GetPrecinctAddresses([FromODataUri] int key)
        {
            return db.WorkAreas.Where(m => m.Id == key).SelectMany(m => m.PrecinctAddresses);
        }

        // GET: odata/WorkAreas(5)/Top
        [EnableQuery]
        public SingleResult<Person> GetTop([FromODataUri] int key)
        {
            return SingleResult.Create(db.WorkAreas.Where(m => m.Id == key).Select(m => m.Top));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool WorkAreaExists(int key)
        {
            return db.WorkAreas.Count(e => e.Id == key) > 0;
        }

        [HttpPost]
        public IHttpActionResult CountPeopleAtAddresses(ODataActionParameters parameters)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var paramAddresses = parameters["Addresses"] as IEnumerable<AddressCountPeople>;
            if (paramAddresses == null) return BadRequest("Not found property 'Addresses'");

            var addresses = paramAddresses as List<AddressCountPeople> ?? paramAddresses.ToList();
            if (addresses.Count == 0) return Ok();

            var response = addresses
                .Join(db.People, 
                    a => new {a.CityId, a.StreetId, a.House},
                    person => new {person.CityId,person.StreetId, person.House }, (a, p) => p)
                .GroupBy(k => new {k.CityId, k.StreetId, k.House}, g => g.Id,
                        (k, g) => new AddressCountPeople { CityId = k.CityId, StreetId = k.StreetId, House = k.House, PrecinctId = 0, CountPeople = g.Distinct().Count() })
                .ToArray();

            return Ok(response);
        }

        [HttpPost]
        public IHttpActionResult CountPeopleAtPrecincts(ODataActionParameters parameters)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var paramPrecincts = parameters["Precincts"] as IEnumerable<AddressCountPeople>;
            if (paramPrecincts == null) return BadRequest("Not found property 'Precincts'");

            var precincts = paramPrecincts as List<AddressCountPeople> ?? paramPrecincts.ToList();
            if (precincts.Count == 0) return Ok();

            var response = precincts
                .Join(db.People.Include("PrecinctAddress"),
                    a => a.PrecinctId,
                    person => person.PrecinctAddress.PrecinctId, (a, p) => p)
                .GroupBy(k => k.PrecinctAddress.PrecinctId, g => g.Id,
                        (k, g) => new AddressCountPeople { CityId = 0, StreetId = 0, House = string.Empty, PrecinctId = k, CountPeople = g.Distinct().Count() })
                .ToArray();

            return Ok(response);
        }
    }
}
