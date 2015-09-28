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
    builder.EntitySet<UserPrecinct>("UserPrecincts");
    builder.EntitySet<Precinct>("Precincts"); 
    builder.EntitySet<AppUser>("AppUsers"); 
    config.Routes.MapODataRoute("odata", "odata", builder.GetEdmModel());
    */

           
    
    public class UserPrecinctsController : ODataController
    {
        private CitizenDbContext db = new CitizenDbContext();

        // GET: odata/UserPrecincts

        [EnableQuery]
        [Logger(Roles = "Operators, SuperAdministrators")] 
        public IQueryable<UserPrecinct> GetUserPrecincts()
        {
            return db.UserPrecincts;
        }

        // GET: odata/UserPrecincts(5)
        [EnableQuery]
        [Logger(Roles = "Operators, SuperAdministrators")] 
        [ODataRoute("UserPrecincts(UserId={userId}, PrecinctId={precinctId})")]
        public SingleResult<UserPrecinct> GetUserPrecinct([FromODataUri] string userId, [FromODataUri] int precinctId)
        {
            return SingleResult.Create(db.UserPrecincts.Where(userPrecinct => userPrecinct.UserId == userId && userPrecinct.PrecinctId == precinctId));
        }

        // PUT: odata/UserPrecincts(5)
        [ODataRoute("UserPrecincts(UserId={userId}, PrecinctId={precinctId})")]
        [Logger(Roles = "SuperAdministrators")]
        public async Task<IHttpActionResult> Put([FromODataUri] string userId, [FromODataUri] int precinctId, Delta<UserPrecinct> patch)
        {
            UserPrecinct dbEntity = patch.GetEntity();

            Validate(dbEntity);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            object[] key = new object[2];

            key[0] = userId;
            key[1] = precinctId; 

            UserPrecinct userPrecinct = await db.UserPrecincts.FindAsync(key);
            if (userPrecinct == null)
            {
                return NotFound();
            }

            //patch.Put(userPrecinct);
            db.UserPrecincts.Remove(userPrecinct);
            db.UserPrecincts.Add(dbEntity);
            await RemoveUserRegionPartAsync(userId, precinctId);
            await AddUserRegionPartAsync(dbEntity);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserPrecinctExists(dbEntity.UserId, dbEntity.PrecinctId))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(userPrecinct);
        }

        // POST: odata/UserPrecincts
        [Logger(Roles = "SuperAdministrators")]
        public async Task<IHttpActionResult> Post(UserPrecinct userPrecinct)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.UserPrecincts.Add(userPrecinct);
            await AddUserRegionPartAsync(userPrecinct);
            
            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (UserPrecinctExists(userPrecinct.UserId, userPrecinct.PrecinctId))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return Created(userPrecinct);
        }

        [Logger(Roles = "SuperAdministrators")]
        private async Task AddUserRegionPartAsync(UserPrecinct modelUserPrecinct)
        {
            var precinct = await db.Precincts.FindAsync(modelUserPrecinct.PrecinctId);
            if (precinct == null || precinct.RegionPartId == null) return;
            var regionPartId = (int) precinct.RegionPartId;
            var total = GetTotalPrecinctsByRegionPartId(regionPartId);
            var count = GetCountUserPrecinctsByRegionPartId(regionPartId, modelUserPrecinct.UserId);
            if ((count + 1) == total)
            {
                var entity = new UserRegionPart
                {
                    UserId = modelUserPrecinct.UserId,
                    RegionPartId = regionPartId
                };
                db.UserRegionParts.Add(entity);
                await AddUserRegionAsync(entity);
            }
        }

        private async Task AddUserRegionAsync(UserRegionPart userRegionPart)
        {
            var regionPart = await db.RegionParts.FindAsync(userRegionPart.RegionPartId);
            if (regionPart == null) return;
            var regionId = regionPart.RegionId;
            var total = GetTotalRegionPartsByRegionId(regionId);
            var count = GetCountUserRegionPartsByRegionId(regionId, userRegionPart.UserId);
            if ((count + 1) == total)
            {
                db.UserRegions.Add(new UserRegion { UserId = userRegionPart.UserId, RegionId = regionId });
            }
        }

        [Logger(Roles = "SuperAdministrators")]
        private async Task RemoveUserRegionPartAsync(string userId, int precinctId)
        {
            var precinct = await db.Precincts.FindAsync(precinctId);
            if (precinct == null || precinct.RegionPartId == null) return;
            var userRegionPart = await db.UserRegionParts.FindAsync(new object[] { userId, precinct.RegionPartId });
            if (userRegionPart != null)
            {
                db.UserRegionParts.Remove(userRegionPart);
                await RemoveUserRegionAsync(userId, userRegionPart.RegionPartId);
            }
        }

        private async Task RemoveUserRegionAsync(string userId, int regionPartId)
        {
            var regionPart = await db.RegionParts.FindAsync(regionPartId);
            if (regionPart == null) return;
            var userRegion = await db.UserRegions.FindAsync(new object[] { userId, regionPart.RegionId });
            if (userRegion != null) db.UserRegions.Remove(userRegion);
        }

        // PATCH: odata/UserPrecincts(5)
        [AcceptVerbs("PATCH", "MERGE")]
        [Logger(Roles = "SuperAdministrators")]
        public async Task<IHttpActionResult> Patch([FromODataUri] string userId, [FromODataUri] int precinctId, Delta<UserPrecinct> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            object[] key = new object[2];

            key[0] = userId;
            key[1] = precinctId;

            UserPrecinct userPrecinct = await db.UserPrecincts.FindAsync(key);
            if (userPrecinct == null)
            {
                return NotFound();
            }

            patch.Patch(userPrecinct);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserPrecinctExists(userId, precinctId))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(userPrecinct);
        }

        // DELETE: odata/UserPrecincts(5)
        [Logger(Roles = "SuperAdministrators")]
        [ODataRoute("UserPrecincts(UserId={userId}, PrecinctId={precinctId})")]
        public async Task<IHttpActionResult> Delete([FromODataUri] string userId, [FromODataUri] int precinctId)
        {

            object[] key = new object[2];

            key[0] = userId;
            key[1] = precinctId;

            UserPrecinct userPrecinct = await db.UserPrecincts.FindAsync(key);
            if (userPrecinct == null)
            {
                return NotFound();
            }

            db.UserPrecincts.Remove(userPrecinct);
            await RemoveUserRegionPartAsync(userId, precinctId);

            await db.SaveChangesAsync();

            return StatusCode(HttpStatusCode.NoContent);
        }

        // GET: odata/UserPrecincts(5)/Precinct
        [EnableQuery]
        public SingleResult<Precinct> GetPrecinct([FromODataUri] string userId, [FromODataUri] int precinctId)
        {
            return SingleResult.Create(db.UserPrecincts.Where(userPrecinct => userPrecinct.UserId == userId && userPrecinct.PrecinctId == precinctId).Select(m => m.Precinct));
        }

        // GET: odata/UserPrecincts(5)/User
        [EnableQuery]
        public SingleResult<ApplicationUser> GetUser([FromODataUri] string userId, [FromODataUri] int precinctId)
        {
            return SingleResult.Create(db.UserPrecincts.Where(userPrecinct => userPrecinct.UserId == userId && userPrecinct.PrecinctId == precinctId).Select(m => m.User));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool UserPrecinctExists(string userId,  int precinctId)
        {
            return db.UserPrecincts.Count(userPrecinct => userPrecinct.UserId == userId && userPrecinct.PrecinctId == precinctId) > 0;
        }

        [HttpPost]
        public async Task<IHttpActionResult> AddRange(ODataActionParameters parameters)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            var paramArray = parameters["Array"] as IEnumerable<UserPrecinct>;
            if (paramArray == null) return BadRequest("Not found property 'Array'");

            var userPrecincts = paramArray as UserPrecinct[] ?? paramArray.ToArray();
            if (userPrecincts.Length == 0) return StatusCode(HttpStatusCode.Created);

            var savingUserPrecincts = userPrecincts
                .Distinct(new UserPrecinctComparer()) // removing duplicate
                .GroupJoin(db.UserPrecincts, e => new { e.PrecinctId, e.UserId }, param => new { param.PrecinctId, param.UserId }, (k, v) => new { Key = k, Values = v })
                .SelectMany(x => x.Values.DefaultIfEmpty(), (x, y) => new { Exist = x.Key, NotExist = y })
                .Where(p => p.NotExist == null) //filter existing items
                .Select(e => e.Exist)
                .ToArray();

            var savingUserRegionParts = savingUserPrecincts
                .Join(db.Precincts, up => up.PrecinctId, p => p.Id,
                    (k, v) => new {k.UserId, v.RegionPartId, k.PrecinctId})
                .GroupBy(x => new { x.UserId, x.RegionPartId }, g => g.PrecinctId, 
                    (k, g) => new { k.UserId, k.RegionPartId, CountPrecincts = g.Distinct().Count() })
                .Where(x => IsCountUserPrecinctsEqualTotalPrecincts(x.RegionPartId, x.UserId, x.CountPrecincts))
                .Select(x => new UserRegionPart{UserId = x.UserId, RegionPartId = (int) x.RegionPartId})
                .ToArray();

            var savingUserRegions = savingUserRegionParts
               .Join(db.RegionParts, up => up.RegionPartId, p => p.Id,
                   (k, v) => new { k.UserId, v.RegionId, k.RegionPartId })
               .GroupBy(x => new { x.UserId, x.RegionId }, g => g.RegionPartId,
                   (k, g) => new { k.UserId, k.RegionId, CountRegionParts = g.Distinct().Count() })
               .Where(x => IsCountUserRegionPartsEqualTotalRegionParts(x.RegionId, x.UserId, x.CountRegionParts))
               .Select(x => new UserRegion { UserId = x.UserId, RegionId = x.RegionId })
               .ToArray();

            db.UserPrecincts.AddRange(savingUserPrecincts);
            db.UserRegionParts.AddRange(savingUserRegionParts);
            db.UserRegions.AddRange(savingUserRegions);
            
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
            var paramArray = parameters["Array"] as IEnumerable<UserPrecinct>;
            if (paramArray == null) return BadRequest("Not found property 'Array'");

            var userPrecincts = paramArray as UserPrecinct[] ?? paramArray.ToArray();
            if (userPrecincts.Length == 0) return StatusCode(HttpStatusCode.NoContent);

            var removingUserPrecincts = userPrecincts
                .Distinct(new UserPrecinctComparer())
                .Join(db.UserPrecincts.Include("Precinct"),
                    param => new { param.PrecinctId, param.UserId },
                    up => new { up.PrecinctId, up.UserId }, (k, v) => v).ToArray();

            var removingUserRegionParts = removingUserPrecincts
                .Join(db.UserRegionParts.Include("RegionPart"), 
                    p => new { p.Precinct.RegionPartId, p.UserId }, 
                    r => new { RegionPartId = (int?)r.RegionPartId, r.UserId }, (p, r) => r)
                .Distinct(new UserRegionPartComparer())
                .ToArray();

            var removingUserRegions = removingUserRegionParts
                .Join(db.UserRegions, p => new { p.RegionPart.RegionId, p.UserId },
                    r => new { r.RegionId, r.UserId }, (p, r) => r)
                .Distinct(new UserRegionComparer())
                .ToArray();

            db.UserPrecincts.RemoveRange(removingUserPrecincts);
            db.UserRegionParts.RemoveRange(removingUserRegionParts);
            db.UserRegions.RemoveRange(removingUserRegions);
                    
            await db.SaveChangesAsync();

            return StatusCode(HttpStatusCode.NoContent);
        }

        private bool IsCountUserPrecinctsEqualTotalPrecincts(int? regionPartId, string userId, int countSave)
        {
            if (regionPartId == 0 || regionPartId == null || userId.Equals(string.Empty)) return false; 
            return countSave + GetCountUserPrecinctsByRegionPartId(regionPartId, userId) == GetTotalPrecinctsByRegionPartId(regionPartId);
        }

        private int GetCountUserPrecinctsByRegionPartId(int? regionPartId, string userId)
        {
            return db.UserPrecincts.Count(up => up.Precinct.RegionPartId == regionPartId && up.UserId == userId);
        }

        private int GetTotalPrecinctsByRegionPartId(int? regionPartId)
        {
            return db.Precincts.Count(p => p.RegionPartId == regionPartId);
        }

        private bool IsCountUserRegionPartsEqualTotalRegionParts(int regionId, string userId, int countSave)
        {
            if (regionId == 0 || userId.Equals(string.Empty)) return false;
            return countSave + GetCountUserRegionPartsByRegionId(regionId, userId) == GetTotalRegionPartsByRegionId(regionId);
        }

        private int GetCountUserRegionPartsByRegionId(int regionId, string userId)
        {
            return db.UserRegionParts.Count(up => up.RegionPart.RegionId == regionId && up.UserId == userId);
        }

        private int GetTotalRegionPartsByRegionId(int regionId)
        {
            return db.RegionParts.Count(r => r.RegionId == regionId);
        }
    }

    class UserPrecinctComparer : IEqualityComparer<UserPrecinct>
    {
        public bool Equals(UserPrecinct x, UserPrecinct y)
        {
            return x.UserId == y.UserId && x.PrecinctId == y.PrecinctId;
        }

        public int GetHashCode(UserPrecinct obj)
        {
            return obj.UserId.GetHashCode() ^ obj.PrecinctId.GetHashCode();
        }
    }

    class UserRegionPartComparer : IEqualityComparer<UserRegionPart>
    {
        public bool Equals(UserRegionPart x, UserRegionPart y)
        {
            return x.UserId == y.UserId && x.RegionPartId == y.RegionPartId;
        }

        public int GetHashCode(UserRegionPart obj)
        {
            return obj.UserId.GetHashCode() ^ obj.RegionPartId.GetHashCode();
        }
    }

    class UserRegionComparer : IEqualityComparer<UserRegion>
    {
        public bool Equals(UserRegion x, UserRegion y)
        {
            return x.UserId == y.UserId && x.RegionId == y.RegionId;
        }

        public int GetHashCode(UserRegion obj)
        {
            return obj.UserId.GetHashCode() ^ obj.RegionId.GetHashCode();
        }
    }
}
