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
    builder.EntitySet<Role>("Roles");
    builder.EntitySet<IdentityUserRole>("IdentityUserRoles"); 
    config.Routes.MapODataRoute("odata", "odata", builder.GetEdmModel());
    */
     
    public class RolesController : ODataController
    {
        private CitizenDbContext db = new CitizenDbContext();

        // GET: odata/Roles
        [EnableQuery]
        public IQueryable<ApplicationRole> GetRoles()
        {
            return db.Roles;
        }

        // GET: odata/Roles(5)
        [EnableQuery]
        [ODataRoute("Roles(Id={key})")]
        public SingleResult<ApplicationRole> GetRole([FromODataUri] string key)
        {
            return SingleResult.Create(db.Roles.Where(role => role.Id == key));
        }

        // PUT: odata/Roles(5)
        [ODataRoute("Roles(Id={key})")]
        public async Task<IHttpActionResult> Put([FromODataUri] string key, Delta<ApplicationRole> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            ApplicationRole role = db.Roles.Find(key);
            if (role == null)
            {
                return NotFound();
            }

            patch.Put(role);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RoleExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(role);
        }

        // POST: odata/Roles
        public async Task<IHttpActionResult> Post(ApplicationRole role)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.Roles.Add(role);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (RoleExists(role.Id))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return Created(role);
        }

        // PATCH: odata/Roles(5)
        [AcceptVerbs("PATCH", "MERGE")]
        [ODataRoute("Roles(Id={key})")]
        public async Task<IHttpActionResult> Patch([FromODataUri] string key, Delta<ApplicationRole> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            ApplicationRole role = db.Roles.Find(key);
            if (role == null)
            {
                return NotFound();
            }

            patch.Patch(role);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RoleExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(role);
        }

        // DELETE: odata/Roles(5)
        [ODataRoute("Roles(Id={key})")]
        public async Task<IHttpActionResult> Delete([FromODataUri] string key)
        {
            ApplicationRole role = db.Roles.Find(key);
            if (role == null)
            {
                return NotFound();
            }

            db.Roles.Remove(role);
            await db.SaveChangesAsync();

            return StatusCode(HttpStatusCode.NoContent);
        }

        // GET: odata/Roles(5)/Users
        [EnableQuery]
        [ODataRoute("Roles(Id={key})/Users")]
        public IQueryable<ApplicationUserRole> GetUsers([FromODataUri] string key)
        {
            return db.Roles.Where(m => m.Id == key).SelectMany(m => m.Users);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool RoleExists(string key)
        {
            return db.Roles.Count(e => e.Id == key) > 0;
        }
    }
}
