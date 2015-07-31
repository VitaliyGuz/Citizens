using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
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
        [PrecinctAddressesFilter]
        public IQueryable<PrecinctAddress> GetPrecinctAddresses()
        {
            return db.PrecinctAddresses;
        }

        // GET: odata/PrecinctAddresses(5)
        [EnableQuery]
        [ODataRoute("PrecinctAddresses(CityId={cityId}, StreetId={streetId}, House={house})")]
        [PrecinctAddressesFilter]
        public SingleResult<PrecinctAddress> GetPrecinctAddresses([FromODataUri] int cityId, [FromODataUri] int? streetId, [FromODataUri] string house)
        {
            return SingleResult.Create(db.PrecinctAddresses.Where(precinctAddress => precinctAddress.CityId == cityId && precinctAddress.StreetId == streetId && precinctAddress.House == house));
        }

        // PUT: odata/PrecinctAddresses(5)
        [ODataRoute("PrecinctAddresses(CityId={cityId}, StreetId={streetId}, House={house})")]
        public async Task<IHttpActionResult> Put([FromODataUri] int cityId, [FromODataUri] int? streetId, [FromODataUri] string house, [FromBody] Delta<PrecinctAddress> patch)
        {
            Validate(patch.GetEntity());

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
        public async Task<IHttpActionResult> Post(PrecinctAddress precinctAddress)
        {
            var textConflict = "";

            if (precinctAddress.StreetId == null)
            {
                precinctAddress.StreetId = 1;
            }
            if (precinctAddress.House == null)
            {
                precinctAddress.House = "";
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.PrecinctAddresses.Add(precinctAddress);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                //if (PrecinctAddressExists(precinctAddress.CityId, precinctAddress.StreetId, precinctAddress.House))
                //{
                PrecinctAddress precinctAddress2 = db.PrecinctAddresses.Include("Precinct").Include("City.CityType").Include("Street.StreetType").SingleOrDefault(precinctAddress1 => precinctAddress1.CityId == precinctAddress.CityId && precinctAddress1.StreetId == precinctAddress.StreetId && precinctAddress1.House == precinctAddress.House);
                if (precinctAddress2 != null)
                {
                    textConflict = textConflict + "Адреса " + precinctAddress.City.CityType.Name + precinctAddress.City.Name +
                                       ", " + precinctAddress.Street.StreetType.Name + precinctAddress.Street.Name +
                                       "," + precinctAddress.House + " вже знаходиться в дільниці " +
                                       precinctAddress2.Precinct.Number.ToString() + "\r\n";
                    //return Conflict();
                    return new TextResult(textConflict, Request, HttpStatusCode.Conflict);
                }
                //}
                //else
                //{
                throw;
                //}
            }

            return Created(precinctAddress);
        }

        // PATCH: odata/PrecinctAddresses(5)
        [AcceptVerbs("PATCH", "MERGE")]
        [ODataRoute("PrecinctAddresses(CityId={cityId}, StreetId={streetId}, House={house})")]
        public async Task<IHttpActionResult> Patch([FromODataUri] int cityId, [FromODataUri] int? streetId, [FromODataUri] string house, [FromBody] Delta<PrecinctAddress> patch)
        {
            Validate(patch.GetEntity());

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
}
