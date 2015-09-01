using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Data.SqlClient;
using System.Linq;
using System.Net;
using System.Net.Http;
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

    [Logger(Roles = "SuperAdministrators")]        
    public class UserRegionPartsController : ODataController
    {
        private CitizenDbContext db = new CitizenDbContext();

        // GET: odata/UserRegionParts
        [EnableQuery]
        [Logger(Roles = "Operators")] 
        public IQueryable<UserRegionPart> GetUserRegionParts()
        {
            return db.UserRegionParts;
        }

        // GET: odata/UserRegionParts(5)
        [EnableQuery]
        [Logger(Roles = "Operators")] 
        [ODataRoute("UserRegionParts(UserId={userId}, RegionPartId={regionPartId})")]
        public SingleResult<UserRegionPart> GetUserRegionPart([FromODataUri] string userId, [FromODataUri] int regionPartId)
        {
            return SingleResult.Create(db.UserRegionParts.Where(userRegionPart => userRegionPart.UserId == userId && userRegionPart.RegionPartId == regionPartId));
        }

        // PUT: odata/UserRegionParts(5)
        [ODataRoute("UserRegionParts(UserId={userId}, RegionPartId={regionPartId})")]
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
        public async Task<IHttpActionResult> Post(UserRegionPart userRegionPart)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.UserRegionParts.Add(userRegionPart);
            
            var userPrecincts = new List<UserPrecinct>();
            //await db.Precincts.Where(precinct => precinct.RegionPartId == userRegionPart.RegionPartId)
            //    .Where(p => db.UserPrecincts.Count(up => up.UserId == userRegionPart.UserId && up.PrecinctId == p.Id) == 0)
            //    .ForEachAsync(p => userPrecincts.Add(new UserPrecinct {UserId = userRegionPart.UserId, PrecinctId = p.Id}));
            await db.Database.SqlQuery<int>(
                @"SELECT dbo.Precincts.Id as Id
                      FROM dbo.Precincts
                      LEFT JOIN dbo.UserPrecincts ON dbo.UserPrecincts.PrecinctId = dbo.Precincts.Id AND dbo.UserPrecincts.UserId = @userId
                      WHERE dbo.Precincts.RegionPartId = @regionPartId AND dbo.UserPrecincts.UserId IS NULL",
                new SqlParameter("regionPartId", userRegionPart.RegionPartId), new SqlParameter("userId", userRegionPart.UserId)
                ).ForEachAsync(precinctId => userPrecincts.Add(new UserPrecinct { UserId = userRegionPart.UserId, PrecinctId = precinctId }));

            db.UserPrecincts.AddRange(userPrecincts);
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
