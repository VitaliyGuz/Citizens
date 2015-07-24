using System.Data.SqlClient;
using System.Net;
using System.Net.Http;
using System.Web.Http.Controllers;

namespace Citizens.Extensions
{
    public class PersonFilterAttribute : BaseActionFilter
    {
        public override void OnActionExecuting(HttpActionContext actionContext)
        {
            var entryId = getEntryId(actionContext);

            if (entryId == null)
            {
                actionContext.Response = new HttpResponseMessage(HttpStatusCode.NotFound);
                return;
            }

            if (string.IsNullOrEmpty(entryId))
            {
                setFilterString("PrecinctAddress/Precinct");
                base.OnActionExecuting(actionContext);
                return;
            }

            var userId = getUserId();
            if (string.IsNullOrEmpty(userId))
            {
                actionContext.Response = new HttpResponseMessage(HttpStatusCode.NotFound);
                return;
            }

            var count = db.Database.SqlQuery<int>(
                @"SELECT TOP 1 dbo.People.Id as Id
                      FROM dbo.People
                      INNER JOIN dbo.PrecinctAddresses ON dbo.People.CityId = dbo.PrecinctAddresses.CityId
                        AND dbo.People.StreetId = dbo.PrecinctAddresses.StreetId
                        AND dbo.People.House = dbo.PrecinctAddresses.House
                            INNER JOIN dbo.UserPrecincts ON dbo.PrecinctAddresses.PrecinctId = dbo.UserPrecincts.PrecinctId
                      WHERE dbo.People.Id = @personId AND dbo.UserPrecincts.UserId = @userId",
                new SqlParameter("personId", entryId), new SqlParameter("userId", userId)
            ).CountAsync().Result;
            if (count == 0) actionContext.Response = new HttpResponseMessage(HttpStatusCode.NotFound);
                
        }
    }
}