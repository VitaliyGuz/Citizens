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
using Microsoft.AspNet.Identity.EntityFramework;

namespace Citizens.Controllers.API
{
    /*
    The WebApiConfig class may require additional changes to add a route for this controller. Merge these statements into the Register method of the WebApiConfig class as applicable. Note that OData URLs are case sensitive.

    using System.Web.Http.OData.Builder;
    using Citizens.Models;
    ODataConventionModelBuilder builder = new ODataConventionModelBuilder();
    builder.EntitySet<User>("Users");
    builder.EntitySet<IdentityUserClaim>("Claims"); 
    builder.EntitySet<IdentityUserLogin>("Logins"); 
    builder.EntitySet<IdentityUserRole>("UserRoles"); 
    builder.EntitySet<UserPrecinct>("UserPrecincts"); 
    config.Routes.MapODataRoute("odata", "odata", builder.GetEdmModel());
    */
    public class UsersController : ODataController
    {
        private CitizenDbContext db = new CitizenDbContext();

        // GET: odata/Users
        [EnableQuery]        
        public IQueryable<ApplicationUser> GetUsers()
        {
            return db.Users.Include(u => u.Roles);
        }

        // GET: odata/Users(5)
        [EnableQuery]
        [ODataRoute("Users(Id={key})")]
        public SingleResult<ApplicationUser> GetUser([FromODataUri] string key)
        {
            return SingleResult.Create(db.Users.Where(user => user.Id == key));
        }

        // PUT: odata/Users(5)
        [ODataRoute("Users(Id={key})")]
        public async Task<IHttpActionResult> Put([FromODataUri] string key, Delta<ApplicationUser> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            ApplicationUser user = db.Users.Find(key);
            if (user == null)
            {
                return NotFound();
            }

            patch.Put(user);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(user);
        }

        // POST: odata/Users
        [ODataRoute("Users(Id={key})")]
        public async Task<IHttpActionResult> Post(ApplicationUser user)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.Users.Add(user);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (UserExists(user.Id))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return Created(user);
        }

        // PATCH: odata/Users(5)
        [AcceptVerbs("PATCH", "MERGE")]
        [ODataRoute("Users(Id={key})")]
        public async Task<IHttpActionResult> Patch([FromODataUri] string key, Delta<ApplicationUser> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            ApplicationUser user = db.Users.Find(key);
            if (user == null)
            {
                return NotFound();
            }

            patch.Patch(user);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(user);
        }

        // DELETE: odata/Users(5)
        [ODataRoute("Users(Id={key})")]
        public async Task<IHttpActionResult> Delete([FromODataUri] string key)
        {
            ApplicationUser user = db.Users.Find(key);
            if (user == null)
            {
                return NotFound();
            }

            db.Users.Remove(user);
            await db.SaveChangesAsync();

            return StatusCode(HttpStatusCode.NoContent);
        }

        //// GET: odata/Users(5)/Claims
        //[EnableQuery]
        //[ODataRoute("Users(Id={key})/Claims")]
        //public IQueryable<IdentityUserClaim> GetClaims([FromODataUri] string key)
        //{
        //    return db.Users.Where(m => m.Id == key).SelectMany(m => m.Claims);
        //}

        //// GET: odata/Users(5)/Logins
        //[EnableQuery]
        //[ODataRoute("Users(Id={key})/Logins")]
        //public IQueryable<IdentityUserLogin> GetLogins([FromODataUri] string key)
        //{
        //    return db.Users.Where(m => m.Id == key).SelectMany(m => m.Logins);
        //}

        // GET: odata/Users(5)/Roles
        [EnableQuery]
        [ODataRoute("Users(Id={key})/Roles")]
        public IQueryable<ApplicationUserRole> GetRoles([FromODataUri] string key)
        {
            return db.Users.Where(m => m.Id == key).SelectMany(m => m.Roles);
        }

        // GET: odata/Users(5)/UserPrecincts
        [EnableQuery]
        [ODataRoute("Users(Id={key})/UserPrecincts")]
        public IQueryable<UserPrecinct> GetUserPrecincts([FromODataUri] string key)
        {
            return db.Users.Where(m => m.Id == key).SelectMany(m => m.UserPrecincts);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool UserExists(string key)
        {
            return db.Users.Count(e => e.Id == key) > 0;
        }
    }
}
