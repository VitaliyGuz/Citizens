using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Web.Http;
using System.Web.OData;
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
    [Logger(Roles = "SuperAdministrators")]        
    public class UserRegionsController : ODataController
    {
        private CitizenDbContext db = new CitizenDbContext();

        // GET: odata/UserRegions
        [EnableQuery]
        [Logger(Roles = "Operators")] 
        public IQueryable<UserRegion> GetUserRegions()
        {
            return db.UserRegions;
        }

        // GET: odata/UserRegions(5)
        [EnableQuery]
        [Logger(Roles = "Operators")] 
        public SingleResult<UserRegion> GetUserRegion([FromODataUri] string key)
        {
            return SingleResult.Create(db.UserRegions.Where(userRegion => userRegion.UserId == key));
        }

        // PUT: odata/UserRegions(5)
        public IHttpActionResult Put([FromODataUri] string key, Delta<UserRegion> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            UserRegion userRegion = db.UserRegions.Find(key);
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
                if (!UserRegionExists(key))
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
        public IHttpActionResult Post(UserRegion userRegion)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.UserRegions.Add(userRegion);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateException)
            {
                if (UserRegionExists(userRegion.UserId))
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
        public IHttpActionResult Patch([FromODataUri] string key, Delta<UserRegion> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            UserRegion userRegion = db.UserRegions.Find(key);
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
                if (!UserRegionExists(key))
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
        public IHttpActionResult Delete([FromODataUri] string key)
        {
            UserRegion userRegion = db.UserRegions.Find(key);
            if (userRegion == null)
            {
                return NotFound();
            }

            db.UserRegions.Remove(userRegion);
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

        private bool UserRegionExists(string key)
        {
            return db.UserRegions.Count(e => e.UserId == key) > 0;
        }
    }
}
