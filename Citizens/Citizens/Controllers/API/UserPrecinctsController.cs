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
    [AllowAnonymous]
    
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
        public SingleResult<UserPrecinct> GetUserPrecinct([FromODataUri] string key)
        {
            return SingleResult.Create(db.UserPrecincts.Where(userPrecinct => userPrecinct.UserId == key));
        }

        // PUT: odata/UserPrecincts(5)
        public async Task<IHttpActionResult> Put([FromODataUri] string key, Delta<UserPrecinct> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            UserPrecinct userPrecinct = await db.UserPrecincts.FindAsync(key);
            if (userPrecinct == null)
            {
                return NotFound();
            }

            patch.Put(userPrecinct);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserPrecinctExists(key))
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
                if (UserPrecinctExists(userPrecinct.UserId))
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
        public async Task<IHttpActionResult> Patch([FromODataUri] string key, Delta<UserPrecinct> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

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
                if (!UserPrecinctExists(key))
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
        public async Task<IHttpActionResult> Delete([FromODataUri] string key)
        {
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
        public SingleResult<Precinct> GetPrecinct([FromODataUri] string key)
        {
            return SingleResult.Create(db.UserPrecincts.Where(m => m.UserId == key).Select(m => m.Precinct));
        }

        // GET: odata/UserPrecincts(5)/User
        [EnableQuery]
        public SingleResult<User> GetUser([FromODataUri] string key)
        {
            return SingleResult.Create(db.UserPrecincts.Where(m => m.UserId == key).Select(m => m.User));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool UserPrecinctExists(string key)
        {
            return db.UserPrecincts.Count(e => e.UserId == key) > 0;
        }
    }
}
