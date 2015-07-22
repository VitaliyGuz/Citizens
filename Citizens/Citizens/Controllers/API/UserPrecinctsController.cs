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
        public IQueryable<UserPrecinct> GetUserPrecincts()
        {
            return db.UserPrecincts;
        }

        // GET: odata/UserPrecincts(5)
        [EnableQuery]
        [ODataRoute("UserPrecincts(UserId={userId}, PrecinctId={precinctId})")]
        public SingleResult<UserPrecinct> GetUserPrecinct([FromODataUri] string userId, [FromODataUri] int precinctId)
        {
            return SingleResult.Create(db.UserPrecincts.Where(userPrecinct => userPrecinct.UserId == userId && userPrecinct.PrecinctId == precinctId));
        }

        // PUT: odata/UserPrecincts(5)
        [ODataRoute("UserPrecincts(UserId={userId}, PrecinctId={precinctId})")]
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
        public async Task<IHttpActionResult> Post(UserPrecinct userPrecinct)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.UserPrecincts.Add(userPrecinct);

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

        // PATCH: odata/UserPrecincts(5)
        [AcceptVerbs("PATCH", "MERGE")]
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
    }
}
