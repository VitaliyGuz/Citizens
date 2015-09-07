using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity.Infrastructure;
using System.Data.SqlClient;
using System.Linq;
using System.Net;
using System.Web.Http;
using System.Web.OData;
using Citizens.Models;
using System.Threading.Tasks;
using System.Web.OData.Query;
using System.Web.OData.Routing;

namespace Citizens.Controllers.API
{
    /*
    The WebApiConfig class may require additional changes to add a route for this controller. Merge these statements into the Register method of the WebApiConfig class as applicable. Note that OData URLs are case sensitive.

    using System.Web.Http.OData.Builder;
    using Citizens.Models;
    ODataConventionModelBuilder builder = new ODataConventionModelBuilder();
    builder.EntitySet<WorkArea>("WorkAreas");
    builder.EntitySet<Precinct>("Precincts"); 
    builder.EntitySet<PrecinctAddress>("PrecinctAddresses"); 
    builder.EntitySet<Person>("People"); 
    config.Routes.MapODataRoute("odata", "odata", builder.GetEdmModel());
    */
    [Logger()]        
    public class WorkAreasController : ODataController
    {
        private CitizenDbContext db = new CitizenDbContext();

        [Logger(Roles = "Operators, SuperAdministrators")] 
        // GET: odata/WorkAreas
        [EnableQuery]
        public IQueryable<WorkArea> GetWorkAreas()
        {
            return db.WorkAreas;
        }

        // GET: odata/WorkAreas(5)
        [Logger(Roles = "Operators, SuperAdministrators")] 
        [EnableQuery]
        public SingleResult<WorkArea> GetWorkArea([FromODataUri] int key)
        {
            return SingleResult.Create(db.WorkAreas.Where(workArea => workArea.Id == key));
        }

        // PUT: odata/WorkAreas(5)
        [Logger(Roles = "Operators, SuperAdministrators")] 
        public IHttpActionResult Put([FromODataUri] int key, Delta<WorkArea> patch)
        {
            var entity = patch.GetEntity();
            Validate(entity);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            WorkArea workArea = db.WorkAreas.Find(key);
            if (workArea == null)
            {
                return NotFound();
            }
            if (entity.TopId == 0)
            {
                var emptyPerson = GetEmptyPerson();
                if (emptyPerson == null) return BadRequest();
                entity.TopId = emptyPerson.Id;
            }
            patch.Put(workArea);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!WorkAreaExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(workArea);
        }

        // POST: odata/WorkAreas
        [Logger(Roles = "Operators, SuperAdministrators")] 
        public IHttpActionResult Post(WorkArea workArea)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (workArea.TopId == 0)
            {
                var emptyPerson = GetEmptyPerson();
                if (emptyPerson == null) return BadRequest();
                workArea.TopId = emptyPerson.Id;
            }

            db.WorkAreas.Add(workArea);
            db.SaveChanges();

            return Created(workArea);
        }

        private Person GetEmptyPerson()
        {
            return db.People.FirstOrDefault(p => p.LastName.Equals(string.Empty) && p.MidleName.Equals(string.Empty) && p.FirstName.Equals(string.Empty));
        }

        // PATCH: odata/WorkAreas(5)
        [AcceptVerbs("PATCH", "MERGE")]
        [Logger(Roles = "Operators, SuperAdministrators")] 
        public IHttpActionResult Patch([FromODataUri] int key, Delta<WorkArea> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            WorkArea workArea = db.WorkAreas.Find(key);
            if (workArea == null)
            {
                return NotFound();
            }
            if (workArea.TopId == 0)
            {
                var emptyPerson = GetEmptyPerson();
                if (emptyPerson == null) return BadRequest();
                workArea.TopId = emptyPerson.Id;
            }
            patch.Patch(workArea);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!WorkAreaExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(workArea);
        }

        // DELETE: odata/WorkAreas(5)
        [Logger(Roles = "Operators, SuperAdministrators")] 
        public IHttpActionResult Delete([FromODataUri] int key)
        {
            WorkArea workArea = db.WorkAreas.Find(key);
            if (workArea == null)
            {
                return NotFound();
            }

            db.WorkAreas.Remove(workArea);
            db.SaveChanges();

            return StatusCode(HttpStatusCode.NoContent);
        }

        // GET: odata/WorkAreas(5)/Precinct
        [EnableQuery]
        public SingleResult<Precinct> GetPrecinct([FromODataUri] int key)
        {
            return SingleResult.Create(db.WorkAreas.Where(m => m.Id == key).Select(m => m.Precinct));
        }

        // GET: odata/WorkAreas(5)/PrecinctAddresses
        [EnableQuery]
        public IQueryable<PrecinctAddress> GetPrecinctAddresses([FromODataUri] int key)
        {
            return db.WorkAreas.Where(m => m.Id == key).SelectMany(m => m.PrecinctAddresses);
        }

        // GET: odata/WorkAreas(5)/Top
        [EnableQuery]
        public SingleResult<Person> GetTop([FromODataUri] int key)
        {
            return SingleResult.Create(db.WorkAreas.Where(m => m.Id == key).Select(m => m.Top));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool WorkAreaExists(int key)
        {
            return db.WorkAreas.Count(e => e.Id == key) > 0;
        }

        [HttpGet]
        [ODataRoute("WorkAreas({id})/GetCountPeopleByPrecinct(PrecinctId={precinctId})")]
        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All)]
        public IHttpActionResult GetCountPeopleByPrecinct([FromODataUri] int precinctId)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            if (precinctId == 0) return BadRequest("PrecinctId equal 0");

            var response = db.People.Include("PrecinctAddress")
                .Where(p => p.PrecinctAddress.PrecinctId == precinctId) 
                .GroupBy(k => new {k.CityId, k.StreetId, k.House}, g => g.Id,
                        (k, g) => new AddressCountPeople { CityId = k.CityId, StreetId = k.StreetId, House = k.House, PrecinctId = 0, CountPeople = g.Distinct().Count() });

            return Ok(response);
        }

        [HttpGet]
        [ODataRoute("WorkAreas({id})/GetMajors()")]
        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All)]
        public IHttpActionResult GetMajors(int id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id == 0) return BadRequest("WorkAreaId equal 0");

            var response = db.People.Include("Major").Include("PrecinctAddress")
                .Where(p => p.PrecinctAddress.WorkAreaId == id)
                .GroupBy(k => k.Major, g => g.Id, (k, g) => new 
                {
                    Person = k,
                    CountSupporters = g.Distinct().Count()
                })
                .AsEnumerable()
                .Select(x => new Person
                {
                    Id = x.Person.Id,
                    FirstName = x.Person.FirstName,
                    LastName = x.Person.LastName,
                    MidleName = x.Person.MidleName,
                    CityId = x.Person.CityId,
                    StreetId = x.Person.StreetId,
                    House = x.Person.House,
                    Apartment = x.Person.Apartment,
                    ApartmentStr = x.Person.ApartmentStr,
                    DateOfBirth = x.Person.DateOfBirth,
                    Gender = x.Person.Gender,
                    MajorId = x.Person.MajorId,
                    CountSupporters = x.CountSupporters
                })
                .Where(p => !p.LastName.Equals(string.Empty) && !p.MidleName.Equals(string.Empty) && !p.FirstName.Equals(string.Empty));

            return Ok(response);
        }

        [HttpGet]
        [ODataRoute("WorkAreas({id})/GetSupporters()")]
        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All)]
        public IHttpActionResult GetSupporters(int id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            if (id == 0) return BadRequest("WorkAreaId equal 0");
            
            var response = db.People.Include("PrecinctAddress")
                .Where(p => p.PrecinctAddress.WorkAreaId == id && !p.LastName.Equals(string.Empty) && !p.MidleName.Equals(string.Empty) && !p.FirstName.Equals(string.Empty));    
                
            return Ok(response);
        }

        [HttpPost]
        public async Task<IHttpActionResult> CaclComputedProperties(ODataActionParameters parameters)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var paramIds = parameters["WorkAreaIds"] as IEnumerable<int>;
            if (paramIds == null) return BadRequest("Not found property 'WorkAreaIds'");

            var workAreaIds = paramIds as List<int> ?? paramIds.ToList();
            if (workAreaIds.Count == 0) return Ok();

            var tableIds = new DataTable();
            tableIds.Columns.Add("Id", typeof(Int32));
            workAreaIds.ForEach(id => tableIds.Rows.Add(id));

            var parameter = new SqlParameter
            {
                ParameterName = "@Ids",
                SqlDbType = SqlDbType.Structured,
                Value = tableIds,
                TypeName = "Ids"
            };

            var sql = @"Declare  @EmptyMajorId int
Select top 1 @EmptyMajorId = id from people
where FirstName = ''
SELECT DISTINCT WorkAreas.Id AS Участок, Streets.Name + ' (' + StreetTypes.Name + ')' AS Улица, PrecinctAddresses.House AS [Номер дома],
	People.Id as Person, People.ApartmentStr as Apartment, CASE WHEN People.[MajorId]<>@EmptyMajorId THEN People.[MajorId] ELSE NULL END as Старший
	into #Temp
	FROM            People INNER JOIN
                         PrecinctAddresses ON People.CityId = PrecinctAddresses.CityId AND People.StreetId = PrecinctAddresses.StreetId AND People.House = PrecinctAddresses.House INNER JOIN
                         WorkAreas ON PrecinctAddresses.WorkAreaId = WorkAreas.Id INNER JOIN
                         Precincts ON PrecinctAddresses.PrecinctId = Precincts.Id 
						 INNER JOIN
                         Streets ON Streets.Id = PrecinctAddresses.StreetId INNER JOIN
                         StreetTypes ON Streets.StreetTypeId = StreetTypes.Id
						 INNER JOIN @Ids Ids ON Ids.Id = WorkAreas.Id
SELECT Участок , Улица,Старший,( select distinct [Номер дома] + ',' as 'data()' from #Temp t2 where t1.[Улица]=t2.[Улица] and t1.Участок=t2.Участок for xml path('') ) as [Номер дома],
	Count(Distinct Person) as PeopleCount, Count(Distinct Apartment) as ApartmentCount
	into #Temp2
	FROM            #Temp t1
	group by Участок , Улица,[Номер дома],Старший
SELECT Участок as Id , ( select distinct Улица + [Номер дома] + ',' as 'data()' from #Temp2 t2 where t1.Участок=t2.Участок for xml path('') ) as AddressesStr,
	Sum(ApartmentCount) as CountHouseholds, Count(Distinct Старший) as CountMajors, Sum(PeopleCount) as CountElectors
	FROM            #Temp2 t1
	group by Участок
    Drop table #Temp
    Drop table #Temp2
";

            //var response = db.Database.ExecuteSqlCommand(sql, parameter);
            //var response = new List<WorkArea>();
            //await db.Database.SqlQuery<WorkArea>(sql, parameter).ForEachAsync(w => response.Add(new WorkArea {
            //    Id = w.Id,
            //    Number = w.Number,
            //    PrecinctId = w.PrecinctId,
            //    TopId = w.TopId,
            //    AddressesStr = w.AddressesStr,
            //    CountElectors = w.CountElectors,
            //    CountHouseholds = w.CountHouseholds,
            //    CountMajors = w.CountMajors
            //}));

            //var response = new List<WorkAreaComputed>();
            //var tasks = new List<Task<WorkAreaComputed>>();
            //workAreaIds.ForEach(id =>
            //{
            //    var tableIds = new DataTable();
            //    tableIds.Columns.Add("Id", typeof(Int32));
            //    tableIds.Rows.Add(id);
            //    var parameter = new SqlParameter
            //    {
            //        ParameterName = "@Ids",
            //        SqlDbType = SqlDbType.Structured,
            //        Value = tableIds,
            //        TypeName = "Ids"
            //    };
            //    var task = db.Database.SqlQuery<WorkAreaComputed>(sql, parameter).FirstAsync();
            //    tasks.Add(task);
            //    //response.Add(result);
            //    //tableIds.Rows.Remove(dataRow);
            //});
            //var resp = await Task.WhenAll<WorkAreaComputed>(tasks);

            var response = await db.Database.SqlQuery<WorkAreaComputed>(sql, parameter).ToListAsync();

            return Ok(response);
        }
    }
}
