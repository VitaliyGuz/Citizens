using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
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
        public IQueryable<UserRegionPart> GetUserRegionParts()
        {
            return db.UserRegionParts;
        }

        // GET: odata/UserRegionParts(5)
        [EnableQuery]
        public SingleResult<UserRegionPart> GetUserRegionPart([FromODataUri] string key)
        {
            return SingleResult.Create(db.UserRegionParts.Where(userRegionPart => userRegionPart.UserId == key));
        }

        // PUT: odata/UserRegionParts(5)
        public IHttpActionResult Put([FromODataUri] string key, Delta<UserRegionPart> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

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
                if (!UserRegionPartExists(key))
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
        public IHttpActionResult Post(UserRegionPart userRegionPart)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.UserRegionParts.Add(userRegionPart);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateException)
            {
                if (UserRegionPartExists(userRegionPart.UserId))
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
        public IHttpActionResult Patch([FromODataUri] string key, Delta<UserRegionPart> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

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
                if (!UserRegionPartExists(key))
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
        public IHttpActionResult Delete([FromODataUri] string key)
        {
            UserRegionPart userRegionPart = db.UserRegionParts.Find(key);
            if (userRegionPart == null)
            {
                return NotFound();
            }

            db.UserRegionParts.Remove(userRegionPart);
            db.SaveChanges();

            return StatusCode(HttpStatusCode.NoContent);
        }

        // GET: odata/UserRegionParts(5)/RegionPart
        [EnableQuery]
        public SingleResult<RegionPart> GetRegionPart([FromODataUri] string key)
        {
            return SingleResult.Create(db.UserRegionParts.Where(m => m.UserId == key).Select(m => m.RegionPart));
        }

        // GET: odata/UserRegionParts(5)/User
        [EnableQuery]
        public SingleResult<ApplicationUser> GetUser([FromODataUri] string key)
        {
            return SingleResult.Create(db.UserRegionParts.Where(m => m.UserId == key).Select(m => m.User));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool UserRegionPartExists(string key)
        {
            return db.UserRegionParts.Count(e => e.UserId == key) > 0;
        }
    }
}
