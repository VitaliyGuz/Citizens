﻿using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity.Infrastructure;
using System.Data.SqlClient;
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

        [HttpPost]
        public IHttpActionResult CountPeopleAtAddresses(ODataActionParameters parameters)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var paramAddresses = parameters["Addresses"] as IEnumerable<AddressCountPeople>;
            if (paramAddresses == null) return BadRequest("Not found property 'Addresses'");

            var addresses = paramAddresses as List<AddressCountPeople> ?? paramAddresses.ToList();
            if (addresses.Count == 0) return Ok();

            var response = addresses
                .Join(db.People, 
                    a => new {a.CityId, a.StreetId, a.House},
                    person => new {person.CityId,person.StreetId, person.House }, (a, p) => p)
                .GroupBy(k => new {k.CityId, k.StreetId, k.House}, g => g.Id,
                        (k, g) => new AddressCountPeople { CityId = k.CityId, StreetId = k.StreetId, House = k.House, PrecinctId = 0, CountPeople = g.Distinct().Count() })
                .ToArray();

            return Ok(response);
        }

        [HttpPost]
        public IHttpActionResult CountPeopleAtPrecincts(ODataActionParameters parameters)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var paramPrecincts = parameters["Precincts"] as IEnumerable<AddressCountPeople>;
            if (paramPrecincts == null) return BadRequest("Not found property 'Precincts'");

            var precincts = paramPrecincts as List<AddressCountPeople> ?? paramPrecincts.ToList();
            if (precincts.Count == 0) return Ok();

            var response = precincts
                .Join(db.People.Include("PrecinctAddress"),
                    a => a.PrecinctId,
                    person => person.PrecinctAddress.PrecinctId, (a, p) => p)
                .GroupBy(k => k.PrecinctAddress.PrecinctId, g => g.Id,
                        (k, g) => new AddressCountPeople { CityId = 0, StreetId = 0, House = string.Empty, PrecinctId = k, CountPeople = g.Distinct().Count() })
                .ToArray();

            return Ok(response);
        }

        [HttpPost]
        public IHttpActionResult GetMajors(ODataActionParameters parameters)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var paramAddresses = parameters["Addresses"] as IEnumerable<AddressCountPeople>;
            if (paramAddresses == null) return BadRequest("Not found property 'Addresses'");

            var addresses = paramAddresses as List<AddressCountPeople> ?? paramAddresses.ToList();
            if (addresses.Count == 0) return Ok();

            var response = addresses
                .Join(db.People.Include("Major"),
                    a => new { a.CityId, a.StreetId, a.House },
                    person => new { person.CityId, person.StreetId, person.House }, (a, p) => p)
                .GroupBy(k => k.Major, g => g.Id, (k, g) => new Person
                {
                    Id = k.Id,
                    FirstName = k.FirstName,
                    LastName = k.LastName,
                    MidleName = k.MidleName,
                    CityId = k.CityId,
                    StreetId = k.StreetId,
                    House = k.House,
                    Apartment = k.Apartment,
                    ApartmentStr = k.ApartmentStr,
                    DateOfBirth = k.DateOfBirth,
                    Gender = k.Gender,
                    MajorId = k.MajorId,
                    CountSupporters = g.Distinct().Count()
                })
                .Where(p => !p.LastName.Equals(string.Empty) && !p.MidleName.Equals(string.Empty) && !p.FirstName.Equals(string.Empty));

            return Ok(response);
        }

        [HttpPost]
        public IHttpActionResult GetSupporters(ODataActionParameters parameters)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var paramAddresses = parameters["Addresses"] as IEnumerable<AddressCountPeople>;
            if (paramAddresses == null) return BadRequest("Not found property 'Addresses'");

            var addresses = paramAddresses as List<AddressCountPeople> ?? paramAddresses.ToList();
            if (addresses.Count == 0) return Ok();

            var response = addresses
                .Join(db.People,
                    a => new { a.CityId, a.StreetId, a.House },
                    person => new { person.CityId, person.StreetId, person.House }, (a, p) => p)
                .Except(db.People.Where(p => p.LastName.Equals(string.Empty) && p.MidleName.Equals(string.Empty) && p.FirstName.Equals(string.Empty)));

            return Ok(response);
        }

        [HttpPost]
        public IHttpActionResult CaclComputedProperties(ODataActionParameters parameters)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var paramIds = parameters["WorkAreaIds"] as IEnumerable<int>;
            if (paramIds == null) return BadRequest("Not found property 'WorkAreaIds'");

            var workAreaIds = paramIds as List<int> ?? paramIds.ToList();
            if (workAreaIds.Count == 0) return Ok();

            var myDataTable = new DataTable("Ids");
            myDataTable.Columns.Add("Id", typeof(Int32));
            myDataTable.Rows.Add(1);

            var parameter = new SqlParameter
            {
                ParameterName = "@Ids",
                SqlDbType = SqlDbType.Structured,
                Value = myDataTable,
                TypeName = "Ids"
            };

            var sql = @"Declare  @EmptyMajorId int
Select top 1 @EmptyMajorId = id from people
where FirstName = ''
SELECT DISTINCT WorkAreas.Id AS Участок, Streets.Name + ' (' + StreetTypes.Name + ')' AS Улица, PrecinctAddresses.House AS [Номер дома],
	People.Id as Person, People.ApartmentStr as Apartment, CASE WHEN People.[MajorId]<>@EmptyMajorId THEN 1 ELSE 0 END as Старший
	into #Temp
	FROM            People INNER JOIN
                         PrecinctAddresses ON People.CityId = PrecinctAddresses.CityId AND People.StreetId = PrecinctAddresses.StreetId AND People.House = PrecinctAddresses.House INNER JOIN
                         WorkAreas ON PrecinctAddresses.WorkAreaId = WorkAreas.Id INNER JOIN
                         Precincts ON PrecinctAddresses.PrecinctId = Precincts.Id 
						 INNER JOIN
                         Streets ON Streets.Id = PrecinctAddresses.StreetId INNER JOIN
                         StreetTypes ON Streets.StreetTypeId = StreetTypes.Id
							 inner join @Ids Ids
							 on Ids.Id = WorkAreas.Id
SELECT Участок , Улица,( select distinct [Номер дома] + ',' as 'data()' from #Temp t2 where t1.[Улица]=t2.[Улица] and t1.Участок=t2.Участок for xml path('') ) as [Номер дома],
	Count(Distinct Person) as PeopleCount, Count(Distinct Apartment) as ApartmentCount, Sum(Старший) as Старший
	into #Temp2
	FROM            #Temp t1
	group by Участок , Улица
SELECT Участок as Id , ( select distinct Улица + [Номер дома] + ',' as 'data()' from #Temp2 t2 where t1.Участок=t2.Участок for xml path('') ) as AddressesStr,
	Sum(ApartmentCount) as CountHouseholds, Sum(PeopleCount) as CountElectors, Cast(Sum(PeopleCount*0.033) as int) as CountMajorsPlan, Sum(Старший) as CountMajorsFact
	FROM            #Temp2 t1
	group by Участок
";

            var response = db.Database.ExecuteSqlCommand(sql, parameter);
            //var response = db.Database.SqlQuery<WorkArea>(sql, parameter);

            return Ok(response);
        }
    }
}
