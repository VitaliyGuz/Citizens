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
        [PrecinctFilter]
        public IQueryable<Precinct> GetPrecincts()
        {
            return db.Precincts;
        }

        // GET: odata/Precincts(5)
        [EnableQuery(MaxExpansionDepth = 3)]
        [PrecinctFilter]
        public SingleResult<Precinct> GetPrecinct([FromODataUri] int key)
        {
            return SingleResult.Create(db.Precincts.Where(precinct => precinct.Id == key));
        }

        // PUT: odata/Precincts(5)
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
        public async Task<IHttpActionResult> Post(Precinct precinct)
        {
            //if (precinct.DistrictId == 0)
            //{
            //    precinct.DistrictId = 144;
            //}
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.Precincts.Add(precinct);
            await db.SaveChangesAsync();

            return Created(precinct);
        }

        

        // PATCH: odata/Precincts(5)
        [AcceptVerbs("PATCH", "MERGE")]
        [ODataRoute("Precincts")]
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
                PrecinctAddress precinctAddress = await db.PrecinctAddresses.Include("City.CityType").Include("Street.StreetType").SingleOrDefaultAsync(i => i.CityId == address1.CityId && i.StreetId == address1.StreetId && i.House == address1.House);
                if (precinctAddress == null)
                {
                    //db.PrecinctAddresses.Add(address);
                    precinctAddress = new PrecinctAddress
                    {
                        CityId = address.CityId,
                        StreetId = address.StreetId,
                        House = address.House,
                        PrecinctId = address.PrecinctId
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
                                       precinctAddress.PrecinctId.ToString() + "\r\n";

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
    }
}
