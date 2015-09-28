using System.Collections.Generic;
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
    builder.EntitySet<UserRegionPart>("UserRegionParts");
    builder.EntitySet<RegionPart>("RegionParts"); 
    builder.EntitySet<ApplicationUser>("ApplicationUsers"); 
    config.Routes.MapODataRoute("odata", "odata", builder.GetEdmModel());
    */

            
    public class UserRegionPartsController : ODataController
    {
        private CitizenDbContext db = new CitizenDbContext();

        // GET: odata/UserRegionParts
        [EnableQuery]
        [Logger(Roles = "Operators, SuperAdministrators")] 
        public IQueryable<UserRegionPart> GetUserRegionParts()
        {
            return db.UserRegionParts;
        }

        // GET: odata/UserRegionParts(5)
        [EnableQuery]
        [Logger(Roles = "Operators, SuperAdministrators")] 
        [ODataRoute("UserRegionParts(UserId={userId}, RegionPartId={regionPartId})")]
        public SingleResult<UserRegionPart> GetUserRegionPart([FromODataUri] string userId, [FromODataUri] int regionPartId)
        {
            return SingleResult.Create(db.UserRegionParts.Where(userRegionPart => userRegionPart.UserId == userId && userRegionPart.RegionPartId == regionPartId));
        }

        // PUT: odata/UserRegionParts(5)
        [ODataRoute("UserRegionParts(UserId={userId}, RegionPartId={regionPartId})")]
        [Logger(Roles = "SuperAdministrators")]
        public IHttpActionResult Put([FromODataUri] string userId, [FromODataUri] int regionPartId, Delta<UserRegionPart> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            object[] key = new object[2];
            key[0] = userId;
            key[1] = regionPartId; 

            UserRegionPart userRegionPart = db.UserRegionParts.Find(key);
            if (userRegionPart == null)
            {
                return NotFound();
            }

            patch.Put(userRegionPart);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserRegionPartExists(userId, regionPartId))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(userRegionPart);
        }

        // POST: odata/UserRegionParts
        [Logger(Roles = "SuperAdministrators")]
        public async Task<IHttpActionResult> Post(UserRegionPart userRegionPart)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userPrecincts = new List<UserPrecinct>();

            await db.Precincts
                .Where( precinct => precinct.RegionPartId == userRegionPart.RegionPartId &&
                        db.UserPrecincts.Count(up => up.UserId == userRegionPart.UserId && up.PrecinctId == precinct.Id) == 0)
                .ForEachAsync(p => userPrecincts.Add(new UserPrecinct { UserId = userRegionPart.UserId, PrecinctId = p.Id }));

            var regionPart = await db.RegionParts.FindAsync(userRegionPart.RegionPartId);
            if (regionPart != null)
            {
                var userRegion = await db.UserRegions.FindAsync(new object[] { userRegionPart.UserId, regionPart.RegionId });
                if (userRegion == null)
                {
                    var countUserRegionPartsByRegion = await db.UserRegionParts
                    .CountAsync(up => up.RegionPart.RegionId == regionPart.RegionId && up.UserId == userRegionPart.UserId);

                    var totalRegionPartsByRegion = await db.RegionParts.CountAsync(rp => rp.RegionId == regionPart.RegionId);

                    if (++countUserRegionPartsByRegion == totalRegionPartsByRegion)
                        db.UserRegions.Add(new UserRegion { UserId = userRegionPart.UserId, RegionId = regionPart.RegionId });  
                }
                 
            }

            db.UserPrecincts.AddRange(userPrecincts);
            db.UserRegionParts.Add(userRegionPart);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateException)
            {
                if (UserRegionPartExists(userRegionPart.UserId, userRegionPart.RegionPartId))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return Created(userRegionPart);
        }

        // PATCH: odata/UserRegionParts(5)
        [AcceptVerbs("PATCH", "MERGE")]
        [Logger(Roles = "SuperAdministrators")]
        public IHttpActionResult Patch([FromODataUri] string userId, [FromODataUri] int regionPartId, Delta<UserRegionPart> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            object[] key = new object[2];
            key[0] = userId;
            key[1] = regionPartId;
            UserRegionPart userRegionPart = db.UserRegionParts.Find(key);
            if (userRegionPart == null)
            {
                return NotFound();
            }

            patch.Patch(userRegionPart);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserRegionPartExists(userId, regionPartId))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(userRegionPart);
        }

        // DELETE: odata/UserRegionParts(5)
        [ODataRoute("UserRegionParts(UserId={userId}, RegionPartId={regionPartId})")]
        [Logger(Roles = "SuperAdministrators")]
        public async Task<IHttpActionResult> Delete([FromODataUri] string userId, [FromODataUri] int regionPartId)
        {
            object[] key = new object[2];
            key[0] = userId;
            key[1] = regionPartId;

            UserRegionPart userRegionPart = await db.UserRegionParts.FindAsync(key);
            if (userRegionPart == null)
            {
                return NotFound();
            }

            db.UserRegionParts.Remove(userRegionPart);
            db.UserPrecincts.RemoveRange(db.UserPrecincts.Where(
                userPrecinct => userPrecinct.Precinct.RegionPartId == regionPartId && userPrecinct.UserId == userId));
            var regionPart = await db.RegionParts.FindAsync(regionPartId);
            if (regionPart != null)
            {
                var userRegion = await db.UserRegions.FindAsync(new object[] { userId, regionPart.RegionId });
                if (userRegion != null) db.UserRegions.Remove(userRegion);
            }
            
            await db.SaveChangesAsync();

            return StatusCode(HttpStatusCode.NoContent);
        }

        // GET: odata/UserRegionParts(5)/RegionPart
        [EnableQuery]
        public SingleResult<RegionPart> GetRegionPart([FromODataUri] string userId, [FromODataUri] int regionPartId)
        {
            return SingleResult.Create(db.UserRegionParts.Where(userRegionPart => userRegionPart.UserId == userId && userRegionPart.RegionPartId == regionPartId).Select(m => m.RegionPart));
        }

        // GET: odata/UserRegionParts(5)/User
        [EnableQuery]
        public SingleResult<ApplicationUser> GetUser([FromODataUri] string userId, [FromODataUri] int regionPartId)
        {
            return SingleResult.Create(db.UserRegionParts.Where(userRegionPart => userRegionPart.UserId == userId && userRegionPart.RegionPartId == regionPartId).Select(m => m.User));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool UserRegionPartExists(string userId, int regionPartId)
        {
            return db.UserRegionParts.Count(userRegionPart => userRegionPart.UserId == userId && userRegionPart.RegionPartId == regionPartId) > 0;
        }
    }
}
