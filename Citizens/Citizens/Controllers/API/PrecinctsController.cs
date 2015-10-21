using System.Collections.Generic;
using System.Data.Entity;
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
    builder.EntitySet<Precinct>("Precincts");
    builder.EntitySet<City>("Cities"); 
    builder.EntitySet<District>("Districts"); 
    builder.EntitySet<PrecinctAddress>("PrecinctAddresses"); 
    builder.EntitySet<Street>("Streets"); 
    config.Routes.MapODataRoute("odata", "odata", builder.GetEdmModel());
    */
            
    public class PrecinctsController : ODataController
    {
        private CitizenDbContext db = new CitizenDbContext();

        // GET: odata/Precincts
        [EnableQuery(MaxExpansionDepth = 3)]
        [Logger(Roles = "Operators, SuperAdministrators")] 
        [PrecinctFilter]
        public IQueryable<Precinct> GetPrecincts()
        {
            return db.Precincts;
        }

        // GET: odata/Precincts(5)
        [EnableQuery(MaxExpansionDepth = 3)]
        [Logger(Roles = "Operators, SuperAdministrators")] 
        [PrecinctFilter]
        public SingleResult<Precinct> GetPrecinct([FromODataUri] int key)
        {
            return SingleResult.Create(db.Precincts.Where(precinct => precinct.Id == key));
        }

        // PUT: odata/Precincts(5)
        [Logger(Roles = "SuperAdministrators")]
        public async Task<IHttpActionResult> Put([FromODataUri] int key, Delta<Precinct> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Precinct precinct = await db.Precincts.FindAsync(key);
            if (precinct == null)
            {
                return NotFound();
            }

            patch.Put(precinct);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PrecinctExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(precinct);
        }

        // POST: odata/Precincts
        [Logger(Roles = "SuperAdministrators")]
        public async Task<IHttpActionResult> Post(Precinct precinct)
        {
            
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
                       
            var userIds = db.UserRegionParts
                .Where(r => r.RegionPartId == precinct.RegionPartId)
                .Select(s => s.UserId)
                .Distinct();

            if (!userIds.Any())
            {
                var regionPart = await db.RegionParts.FindAsync(precinct.RegionPartId);
                if (regionPart != null)
                {
                    userIds = db.UserRegions
                        .Where(r => r.RegionId == regionPart.RegionId)
                        .Select(s => s.UserId)
                        .Distinct();
                }    
            }
            await userIds.ForEachAsync(userId => db.UserPrecincts.Add(new UserPrecinct
                   {
                       UserId = userId,
                       PrecinctId = precinct.Id
                   })); 
            db.Precincts.Add(precinct);
            await db.SaveChangesAsync();

            return Created(precinct);
        }

        

        // PATCH: odata/Precincts(5)
        [AcceptVerbs("PATCH", "MERGE")]
        [ODataRoute("Precincts")]
        [Logger(Roles = "SuperAdministrators")]
        public async Task<IHttpActionResult> Patch(Precinct precinct)
        {

            //Delta<Precinct>() patch = precinct;

            var textConflict = "";

            //if (precinct.DistrictId == 0)
            //{
            //    precinct.DistrictId = 144;
            //}
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            //Добавляем или изменяем адреса участков
            //foreach (var address in precinct.PrecinctAddresses)
            var array2 = precinct.PrecinctAddresses.ToArray();
            foreach (var address in array2)
            {
                object[] key = new object[3];

                key[0] = address.CityId;
                key[1] = address.StreetId;
                key[2] = address.House;
                //.Include(a => a.Children.Select( c=> c.ChildRelationshipType));
                var address1 = address;
                PrecinctAddress precinctAddress = await db.PrecinctAddresses.Include("Precinct").Include("City.CityType").Include("Street.StreetType").SingleOrDefaultAsync(i => i.CityId == address1.CityId && i.StreetId == address1.StreetId && i.House == address1.House);
                if (precinctAddress == null)
                {
                    //db.PrecinctAddresses.Add(address);
                    precinctAddress = new PrecinctAddress
                    {
                        CityId = address.CityId,
                        StreetId = address.StreetId,
                        House = address.House,
                        PrecinctId = address.PrecinctId,
                        HouseType = address.HouseType
                    };
                    db.PrecinctAddresses.Add(precinctAddress);
                }
                else
                {
                    if (precinctAddress.PrecinctId == address.PrecinctId)
                    {
                            

                    }
                    else
                    {
                        textConflict = textConflict + "Адреса " + precinctAddress.City.CityType.Name + precinctAddress.City.Name +
                                       ", " + precinctAddress.Street.StreetType.Name + precinctAddress.Street.Name +
                                       "," + precinctAddress.House + " вже знаходиться в дільниці " +
                                       precinctAddress.Precinct.Number.ToString() + "\r\n";

                    }

                }

            }

            if (textConflict != "")
            {
                return new TextResult(textConflict, Request, HttpStatusCode.Conflict);
            }


            //db.Precincts.Add(precinct);
            await db.SaveChangesAsync();

            return Created(precinct);
        }

        // DELETE: odata/Precincts(5)
        [Logger(Roles = "SuperAdministrators")]
        public async Task<IHttpActionResult> Delete([FromODataUri] int key)
        {
            Precinct precinct = await db.Precincts.FindAsync(key);
            if (precinct == null)
            {
                return NotFound();
            }

            db.Precincts.Remove(precinct);
            await db.SaveChangesAsync();

            return StatusCode(HttpStatusCode.NoContent);
        }

        // GET: odata/Precincts(5)/City
        [EnableQuery]
        public SingleResult<City> GetCity([FromODataUri] int key)
        {
            return SingleResult.Create(db.Precincts.Where(m => m.Id == key).Select(m => m.City));
        }

        //// GET: odata/Precincts(5)/District
        //[EnableQuery]
        //public SingleResult<District> GetDistrict([FromODataUri] int key)
        //{
        //    return SingleResult.Create(db.Precincts.Where(m => m.Id == key).Select(m => m.District));
        //}

        // GET: odata/Precincts(5)/PrecinctAddresses
        [EnableQuery]
        public IQueryable<PrecinctAddress> GetPrecinctAddresses([FromODataUri] int key)
        {
            return db.Precincts.Where(m => m.Id == key).SelectMany(m => m.PrecinctAddresses);
        }

        // GET: odata/Precincts(5)/Street
        [EnableQuery]
        public SingleResult<Street> GetStreet([FromODataUri] int key)
        {
            return SingleResult.Create(db.Precincts.Where(m => m.Id == key).Select(m => m.Street));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool PrecinctExists(int key)
        {
            return db.Precincts.Count(e => e.Id == key) > 0;
        }

        [HttpPost]
        [ODataRoute("Precincts({precinctId})/AddAddresses")]
        public async Task<IHttpActionResult> AddAddresses([FromODataUri] int precinctId, ODataActionParameters parameters)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var param = parameters["Addresses"] as IEnumerable<PrecinctAddress>;
            if (param == null) return BadRequest("Not found parameter 'Addresses'");

            var addresses = param as PrecinctAddress[] ?? param.Distinct(new PrecinctAddressComparer()).ToArray();
            if (addresses.Length == 0) return StatusCode(HttpStatusCode.Created);

            if (!PrecinctExists(precinctId)) return BadRequest("Precinct not found");

            var exist = addresses.Where(a => db.PrecinctAddresses
                .Count(pa => pa.CityId == a.CityId && pa.StreetId == a.StreetId && pa.House == a.House) > 0)
                .ToList();

            if (exist.Any())
            {
                var respBuilder = new PrecinctAddressConflictResponseBuilder(exist,db);
                return new TextResult(respBuilder.ToString(), Request, HttpStatusCode.Conflict);
            }

            foreach (var a in addresses)
            {
                a.PrecinctId = precinctId;
            }

            db.PrecinctAddresses.AddRange(addresses);
            await db.SaveChangesAsync();

            return StatusCode(HttpStatusCode.Created);
        }
    }
}
