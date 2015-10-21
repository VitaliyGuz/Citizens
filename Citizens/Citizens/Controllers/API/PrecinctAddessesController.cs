using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.OData;
using System.Web.OData.Routing;
using Citizens.Extensions;
using Citizens.Models;

namespace Citizens.Controllers.API
{
    /*
    The WebApiConfig class may require additional changes to add a route for this controller. Merge these statements into the Register method of the WebApiConfig class as applicable. Note that OData URLs are case sensitive.

    using System.Web.Http.OData.Builder;
    using Citizens.Models;
    ODataConventionModelBuilder builder = new ODataConventionModelBuilder();
    builder.EntitySet<PrecinctAddress>("PrecinctAddresses");
    builder.EntitySet<City>("Cities"); 
    builder.EntitySet<Precinct>("Precincts"); 
    builder.EntitySet<Street>("Streets"); 
    config.Routes.MapODataRoute("odata", "odata", builder.GetEdmModel());
    */
           
    public class PrecinctAddressesController : ODataController
    {
        private CitizenDbContext db = new CitizenDbContext();

        // GET: odata/PrecinctAddresses
        [EnableQuery]
        [Logger(Roles = "Operators, SuperAdministrators")] 
        [PrecinctAddressesFilter]
        public IQueryable<PrecinctAddress> GetPrecinctAddresses()
        {
            return db.PrecinctAddresses;
        }

        // GET: odata/PrecinctAddresses(5)
        [EnableQuery]
        [Logger(Roles = "Operators, SuperAdministrators")] 
        [ODataRoute("PrecinctAddresses(CityId={cityId}, StreetId={streetId}, House={house})")]
        [PrecinctAddressesFilter]
        public SingleResult<PrecinctAddress> GetPrecinctAddresses([FromODataUri] int cityId, [FromODataUri] int? streetId, [FromODataUri] string house)
        {
            return SingleResult.Create(db.PrecinctAddresses.Where(precinctAddress => precinctAddress.CityId == cityId && precinctAddress.StreetId == streetId && precinctAddress.House == house));
        }

        // PUT: odata/PrecinctAddresses(5)
        [ODataRoute("PrecinctAddresses(CityId={cityId}, StreetId={streetId}, House={house})")]
        [Logger(Roles = "Operators, SuperAdministrators")]
        public async Task<IHttpActionResult> Put([FromODataUri] int cityId, [FromODataUri] int? streetId, [FromODataUri] string house, [FromBody] Delta<PrecinctAddress> patch)
        {
            var entity = patch.GetEntity();
            Validate(entity);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            object[] key = new object[3];

            key[0] = cityId;
            key[1] = streetId;
            key[2] = house;

            PrecinctAddress precinctAddress = await db.PrecinctAddresses.FindAsync(key);
            if (precinctAddress == null)
            {
                return NotFound();
            }
            if (!User.IsInRole("Administrators") &&
                !User.IsInRole("SuperAdministrators") &&
                entity.PrecinctId != precinctAddress.PrecinctId)
            {
                return StatusCode(HttpStatusCode.Forbidden);
            }

            patch.Put(precinctAddress);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PrecinctAddressExists(cityId, streetId, house))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(precinctAddress);
        }

        // POST: odata/PrecinctAddresses
        [Logger(Roles = "Operators, SuperAdministrators")]
        public async Task<IHttpActionResult> Post(PrecinctAddress precinctAddress)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (precinctAddress.StreetId == 0)
            {
                var nullStreet = db.Streets.FirstOrDefault(s => s.Name.Equals(string.Empty));
                if (nullStreet == null) return BadRequest();
                precinctAddress.StreetId = nullStreet.Id;
            }
            if (precinctAddress.House == null)
            {
                precinctAddress.House = "";
            }
           

            db.PrecinctAddresses.Add(precinctAddress);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (PrecinctAddressExists(precinctAddress.CityId, precinctAddress.StreetId, precinctAddress.House))
                {
                    var respBuilder = new PrecinctAddressConflictResponseBuilder(precinctAddress,db);
                    return new TextResult(respBuilder.ToString(), Request, HttpStatusCode.Conflict);
                }
                throw;
            }

            return Created(precinctAddress);
        }

        // PATCH: odata/PrecinctAddresses(5)
        [AcceptVerbs("PATCH", "MERGE")]
        [Logger(Roles = "Operators, SuperAdministrators")]
        [ODataRoute("PrecinctAddresses(CityId={cityId}, StreetId={streetId}, House={house})")]
        public async Task<IHttpActionResult> Patch([FromODataUri] int cityId, [FromODataUri] int? streetId, [FromODataUri] string house, [FromBody] Delta<PrecinctAddress> patch)
        {
            var entity = patch.GetEntity();
            Validate(entity);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            object[] key = new object[3];

            key[0] = cityId;
            key[1] = streetId;
            key[2] = house;

            PrecinctAddress precinctAddress = await db.PrecinctAddresses.FindAsync(key);
            if (precinctAddress == null)
            {
                return NotFound();
            }
            if (!User.IsInRole("Administrators") &&
                !User.IsInRole("SuperAdministrators") &&
                entity.PrecinctId != precinctAddress.PrecinctId)
            {
                return StatusCode(HttpStatusCode.Forbidden);
            }

            patch.Patch(precinctAddress);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PrecinctAddressExists(cityId, streetId, house))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(precinctAddress);
        }

        // DELETE: odata/PrecinctAddresses(5)
        [ODataRoute("PrecinctAddresses(CityId={cityId}, StreetId={streetId}, House={house})")]
        [Logger(Roles = "SuperAdministrators")]
        public async Task<IHttpActionResult> Delete([FromODataUri] int cityId, [FromODataUri] int? streetId, [FromODataUri] string house)
        {
            object[] key = new object[3];

            key[0] = cityId;
            key[1] = streetId;
            key[2] = house;

            PrecinctAddress precinctAddress = await db.PrecinctAddresses.FindAsync(key);
            if (precinctAddress == null)
            {
                return NotFound();
            }

            db.PrecinctAddresses.Remove(precinctAddress);
            await db.SaveChangesAsync();

            return StatusCode(HttpStatusCode.NoContent);
        }

        // GET: odata/PrecinctAddresses(5)/City
        [EnableQuery]
        public SingleResult<City> GetCity([FromODataUri] int key)
        {
            return SingleResult.Create(db.PrecinctAddresses.Where(m => m.CityId == key).Select(m => m.City));
        }

        // GET: odata/PrecinctAddresses(5)/Precinct
        [EnableQuery]
        public SingleResult<Precinct> GetPrecinct([FromODataUri] int key)
        {
            return SingleResult.Create(db.PrecinctAddresses.Where(m => m.CityId == key).Select(m => m.Precinct));
        }

        // GET: odata/PrecinctAddresses(5)/Street
        [EnableQuery]
        public SingleResult<Street> GetStreet([FromODataUri] int key)
        {
            return SingleResult.Create(db.PrecinctAddresses.Where(m => m.CityId == key).Select(m => m.Street));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool PrecinctAddressExists([FromODataUri] int cityId, [FromODataUri] int? streetId, [FromODataUri] string house)
        {
            return db.PrecinctAddresses.Count(precinctAddress => precinctAddress.CityId == cityId && precinctAddress.StreetId == streetId && precinctAddress.House == house) > 0;
        }
    }

    class PrecinctAddressComparer : IEqualityComparer<PrecinctAddress>
    {
        public bool Equals(PrecinctAddress x, PrecinctAddress y)
        {
            return x.CityId == y.CityId && x.StreetId == y.StreetId && x.House == y.House;
        }

        public int GetHashCode(PrecinctAddress obj)
        {
            return obj.CityId.GetHashCode() ^ obj.StreetId.GetHashCode() ^ obj.House.GetHashCode();
        }
    }

    public class PrecinctAddressConflictResponseBuilder
    {
        private readonly CitizenDbContext db;

        private readonly List<PrecinctAddress> addresses;

        public override string ToString()
        {
            var builder = new StringBuilder();
            addresses.ForEach(a =>
            {
                var expanded = db.PrecinctAddresses.Include("Precinct")
                        .Include("City.CityType")
                        .Include("Street.StreetType")
                        .FirstOrDefault(
                            i => i.CityId == a.CityId && i.StreetId == a.StreetId && i.House == a.House);
                if (expanded != null)
                {
                    builder.Append(string.Format("Адреса {0}{1}, {2}{3} {4} вже знаходиться в дільниці {5}\n", expanded.City.CityType.Name, expanded.City.Name,
                        expanded.Street.StreetType.Name, expanded.Street.Name,
                        expanded.House, expanded.Precinct.Number));
                }
            });
            return builder.ToString();
        }

        public PrecinctAddressConflictResponseBuilder(List<PrecinctAddress> addresses, CitizenDbContext db)
        {
            this.addresses = addresses;
            this.db = db;
        }

        public PrecinctAddressConflictResponseBuilder(PrecinctAddress address, CitizenDbContext db)
        {
            this.db = db;
            addresses = new List<PrecinctAddress>(1) {address};
        }
    }
}
