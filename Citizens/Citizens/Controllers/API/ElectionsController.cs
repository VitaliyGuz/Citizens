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
using Citizens.Models;

namespace Citizens.Controllers.API
{
    /*
    The WebApiConfig class may require additional changes to add a route for this controller. Merge these statements into the Register method of the WebApiConfig class as applicable. Note that OData URLs are case sensitive.

    using System.Web.Http.OData.Builder;
    using Citizens.Models;
    ODataConventionModelBuilder builder = new ODataConventionModelBuilder();
    builder.EntitySet<Election>("Elections");
    config.Routes.MapODataRoute("odata", "odata", builder.GetEdmModel());
    */
    [Logger(Roles = "SuperAdministrators")]        
    public class ElectionsController : ODataController
    {
        private CitizenDbContext db = new CitizenDbContext();

        // GET: odata/Elections
        [EnableQuery]
        [Logger(Roles = "Operators")] 
        public IQueryable<Election> GetElections()
        {
            return db.Elections;
        }

        // GET: odata/Elections(5)
        [EnableQuery]
        [Logger(Roles = "Operators")] 
        public SingleResult<Election> GetElection([FromODataUri] int key)
        {
            return SingleResult.Create(db.Elections.Where(election => election.Id == key));
        }

        // PUT: odata/Elections(5)
        public async Task<IHttpActionResult> Put([FromODataUri] int key, Delta<Election> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Election election = await db.Elections.FindAsync(key);
            if (election == null)
            {
                return NotFound();
            }

            patch.Put(election);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ElectionExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(election);
        }

        // POST: odata/Elections
        public async Task<IHttpActionResult> Post(Election election)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.Elections.Add(election);
            await db.SaveChangesAsync();

            return Created(election);
        }

        // PATCH: odata/Elections(5)
        [AcceptVerbs("PATCH", "MERGE")]
        public async Task<IHttpActionResult> Patch([FromODataUri] int key, Delta<Election> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Election election = await db.Elections.FindAsync(key);
            if (election == null)
            {
                return NotFound();
            }

            patch.Patch(election);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ElectionExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(election);
        }

        // DELETE: odata/Elections(5)
        public async Task<IHttpActionResult> Delete([FromODataUri] int key)
        {
            Election election = await db.Elections.FindAsync(key);
            if (election == null)
            {
                return NotFound();
            }

            db.Elections.Remove(election);
            await db.SaveChangesAsync();

            return StatusCode(HttpStatusCode.NoContent);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool ElectionExists(int key)
        {
            return db.Elections.Count(e => e.Id == key) > 0;
        }
    }
}
