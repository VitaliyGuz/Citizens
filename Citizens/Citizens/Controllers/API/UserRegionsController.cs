using System.Data.Entity;
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
    builder.EntitySet<UserRegion>("UserRegions");
    builder.EntitySet<Region>("Regions"); 
    builder.EntitySet<ApplicationUser>("ApplicationUsers"); 
    config.Routes.MapODataRoute("odata", "odata", builder.GetEdmModel());
    */
      
    public class UserRegionsController : ODataController
    {
        private CitizenDbContext db = new CitizenDbContext();

        // GET: odata/UserRegions
        [EnableQuery]
        [Logger(Roles = "Operators, SuperAdministrators")] 
        public IQueryable<UserRegion> GetUserRegions()
        {
            return db.UserRegions;
        }

        // GET: odata/UserRegions(5)
        [EnableQuery]
        [Logger(Roles = "Operators, SuperAdministrators")]
        [ODataRoute("UserRegions(UserId={userId}, RegionId={regionId})")]
        public SingleResult<UserRegion> GetUserRegion([FromODataUri] string userId, [FromODataUri] int regionId)
        {
            return SingleResult.Create(db.UserRegions.Where(userRegion => userRegion.UserId == userId && userRegion.RegionId == regionId));
        }

        // PUT: odata/UserRegions(5)
        [Logger(Roles = "SuperAdministrators")]
        [ODataRoute("UserRegions(UserId={userId}, RegionId={regionId})")]
        public IHttpActionResult Put([FromODataUri] string userId,[FromODataUri] int regionId, Delta<UserRegion> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            UserRegion userRegion = db.UserRegions.Find(new object[] { userId, regionId });
            if (userRegion == null)
            {
                return NotFound();
            }

            patch.Put(userRegion);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserRegionExists(userId, regionId))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(userRegion);
        }

        // POST: odata/UserRegions
        [Logger(Roles = "SuperAdministrators")]
        public async Task<IHttpActionResult> Post(UserRegion userRegion)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            await db.Precincts
                .Where(precinct => precinct.RegionPart.RegionId == userRegion.RegionId &&
                        db.UserPrecincts.Count(up => up.UserId == userRegion.UserId && up.PrecinctId == precinct.Id) == 0)
                .ForEachAsync(p => db.UserPrecincts.Add(new UserPrecinct { UserId = userRegion.UserId, PrecinctId = p.Id }));

            await db.RegionParts
                .Where(regionPart => regionPart.RegionId == userRegion.RegionId &&                db.UserRegionParts.Count(urp => urp.UserId == userRegion.UserId && urp.RegionPartId ==        regionPart.Id)==0)
                .ForEachAsync(rp => db.UserRegionParts.Add(new UserRegionPart{UserId = userRegion.UserId, RegionPartId = rp.Id}));

            db.UserRegions.Add(userRegion);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateException)
            {
                if (UserRegionExists(userRegion.UserId, userRegion.RegionId))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return Created(userRegion);
        }

        // PATCH: odata/UserRegions(5)
        [AcceptVerbs("PATCH", "MERGE")]
        [Logger(Roles = "SuperAdministrators")]
        [ODataRoute("UserRegions(UserId={userId}, RegionId={regionId})")]
        public IHttpActionResult Patch([FromODataUri] string userId, [FromODataUri] int regionId, Delta<UserRegion> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            UserRegion userRegion = db.UserRegions.Find(userId, regionId);
            if (userRegion == null)
            {
                return NotFound();
            }

            patch.Patch(userRegion);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserRegionExists(userId, regionId))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(userRegion);
        }

        // DELETE: odata/UserRegions(5)
        [Logger(Roles = "SuperAdministrators")]
        [ODataRoute("UserRegions(UserId={userId}, RegionId={regionId})")]
        public IHttpActionResult Delete([FromODataUri] string userId, [FromODataUri] int regionId)
        {
            UserRegion userRegion = db.UserRegions.Find(new object[] { userId, regionId });
            if (userRegion == null)
            {
                return NotFound();
            }

            db.UserRegions.Remove(userRegion);

            db.UserPrecincts.RemoveRange(db.UserPrecincts.Where(
                userPrecinct => userPrecinct.Precinct.RegionPart.RegionId == regionId && userPrecinct.UserId == userId));

            db.UserRegionParts.RemoveRange(db.UserRegionParts.Where(urp => urp.UserId == userId && urp.RegionPart.RegionId == regionId));

            db.SaveChanges();

            return StatusCode(HttpStatusCode.NoContent);
        }

        // GET: odata/UserRegions(5)/Region
        [EnableQuery]
        public SingleResult<Region> GetRegion([FromODataUri] string key)
        {
            return SingleResult.Create(db.UserRegions.Where(m => m.UserId == key).Select(m => m.Region));
        }

        // GET: odata/UserRegions(5)/User
        [EnableQuery]
        public SingleResult<ApplicationUser> GetUser([FromODataUri] string key)
        {
            return SingleResult.Create(db.UserRegions.Where(m => m.UserId == key).Select(m => m.User));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool UserRegionExists(string userId,int regionId)
        {
            return db.UserRegions.Count(e => e.UserId == userId && e.RegionId == regionId) > 0;
        }
    }
}
