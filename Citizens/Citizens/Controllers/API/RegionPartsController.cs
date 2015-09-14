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
    builder.EntitySet<RegionPart>("RegionParts");
    builder.EntitySet<Region>("Regions"); 
    config.Routes.MapODataRoute("odata", "odata", builder.GetEdmModel());
    */
   
    public class RegionPartsController : ODataController
    {
        private CitizenDbContext db = new CitizenDbContext();

        // GET: odata/RegionParts
        [EnableQuery]
        [Logger(Roles = "Operators, SuperAdministrators")] 
        public IQueryable<RegionPart> GetRegionParts()
        {
            return db.RegionParts;
        }

        // GET: odata/RegionParts(5)
        [EnableQuery]
        [Logger(Roles = "Operators, SuperAdministrators")] 
        public SingleResult<RegionPart> GetRegionPart([FromODataUri] int key)
        {
            return SingleResult.Create(db.RegionParts.Where(regionPart => regionPart.Id == key));
        }

        // PUT: odata/RegionParts(5)
        [Logger(Roles = "SuperAdministrators")]
        public async Task<IHttpActionResult> Put([FromODataUri] int key, Delta<RegionPart> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            RegionPart regionPart = await db.RegionParts.FindAsync(key);
            if (regionPart == null)
            {
                return NotFound();
            }

            patch.Put(regionPart);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RegionPartExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(regionPart);
        }

        // POST: odata/RegionParts
        [Logger(Roles = "SuperAdministrators")]
        public async Task<IHttpActionResult> Post(RegionPart regionPart)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.RegionParts.Add(regionPart);
            await db.SaveChangesAsync();

            return Created(regionPart);
        }

        // PATCH: odata/RegionParts(5)
        [AcceptVerbs("PATCH", "MERGE")]
        [Logger(Roles = "SuperAdministrators")]
        public async Task<IHttpActionResult> Patch([FromODataUri] int key, Delta<RegionPart> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            RegionPart regionPart = await db.RegionParts.FindAsync(key);
            if (regionPart == null)
            {
                return NotFound();
            }

            patch.Patch(regionPart);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RegionPartExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(regionPart);
        }

        // DELETE: odata/RegionParts(5)
        [Logger(Roles = "SuperAdministrators")]
        public async Task<IHttpActionResult> Delete([FromODataUri] int key)
        {
            RegionPart regionPart = await db.RegionParts.FindAsync(key);
            if (regionPart == null)
            {
                return NotFound();
            }

            db.RegionParts.Remove(regionPart);
            await db.SaveChangesAsync();

            return StatusCode(HttpStatusCode.NoContent);
        }

        // GET: odata/RegionParts(5)/Regin
        [EnableQuery]
        public SingleResult<Region> GetRegion([FromODataUri] int key)
        {
            return SingleResult.Create(db.RegionParts.Where(m => m.Id == key).Select(m => m.Region));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool RegionPartExists(int key)
        {
            return db.RegionParts.Count(e => e.Id == key) > 0;
        }

        [HttpGet]
        [ODataRoute("RegionParts/GetComputedProperties()")]
        public async Task<IHttpActionResult> GetComputedProperties()
        {

            var sql = @"Declare  @EmptyMajorId int Select top 1 @EmptyMajorId = id from people
                        WHERE FirstName = ''
SELECT Id, Name,RegionId,RegionPartType, SUM(Домохозяйств) AS CountHouseholds, SUM(Избирателей) AS CountElectors, COUNT(DISTINCT Старший) AS CountMajors
FROM (SELECT Id, Name,RegionId,RegionPartType, COUNT(Избирателей) AS Избирателей, COUNT(DISTINCT Домохозяйств) AS Домохозяйств, CityId, StreetId, House, Старший
       FROM (SELECT RegionParts.Id AS Id, RegionParts.Name AS Name, RegionParts.RegionId AS RegionId,RegionParts.RegionId AS RegionPartType, 1 AS Избирателей, People.ApartmentStr AS Домохозяйств, People.CityId, People.StreetId, People.House, 
              CASE WHEN People.[MajorId] <> @EmptyMajorId THEN People.[MajorId] ELSE NULL END AS Старший
                 FROM PrecinctAddresses INNER JOIN People ON PrecinctAddresses.CityId = People.CityId
				  AND PrecinctAddresses.StreetId = People.StreetId AND PrecinctAddresses.House = People.House
				  INNER JOIN  Precincts ON PrecinctAddresses.PrecinctId = Precincts.Id 
				  INNER JOIN  RegionParts ON Precincts.RegionPartId = RegionParts.Id) AS TEMP2
GROUP BY Id,Name,RegionId,RegionPartType, CityId, StreetId, House, Старший) AS TEMP
GROUP BY Id,Name,RegionId,RegionPartType OPTION (LOOP JOIN)";


            var response = await db.Database.SqlQuery<RegionPartComputed>(sql).ToListAsync();

            return Ok(response);
        }
    }
}
