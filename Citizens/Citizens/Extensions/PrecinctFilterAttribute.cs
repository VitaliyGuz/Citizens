using System.Data.SqlClient;
using System.Net;
using System.Net.Http;
using System.Web.Http.Controllers;
using Citizens.Models;

namespace Citizens.Extensions
{
    public class PrecinctFilterAttribute : BaseActionFilter
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
                @"SELECT TOP 1 dbo.Precincts.Id as Id
                      FROM dbo.Precincts
                      INNER JOIN dbo.UserPrecincts ON dbo.UserPrecincts.PrecinctId = dbo.Precincts.Id
                      WHERE dbo.Precincts.Id = @precinctId AND dbo.UserPrecincts.UserId = @userId",
                new SqlParameter("precinctId", entryId), new SqlParameter("userId", userId)
            ).CountAsync().Result;
            if (count == 0) actionContext.Response = new HttpResponseMessage(HttpStatusCode.NotFound); 
        }

    }

    public class PrecinctAddressesFilterAttribute : BaseActionFilter
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
                setFilterString("Precinct");
                base.OnActionExecuting(actionContext);
                return;
            }

            var userId = getUserId();
            if (string.IsNullOrEmpty(userId))
            {
                actionContext.Response = new HttpResponseMessage(HttpStatusCode.NotFound);
                return;
            }
            var splittedId = entryId.Split(',');
            var cityId = splittedId[0].Substring(splittedId[0].IndexOf("=") + 1);
            var streetId = splittedId[1].Substring(splittedId[1].IndexOf("=") + 1);
            var ind = splittedId[2].IndexOf("'");
            var house = splittedId[2].Substring(ind + 1, splittedId[2].Length - ind - 2);
            var count = db.Database.SqlQuery<PrecinctAddress>(@"
                    SELECT TOP 1 * FROM dbo.PrecinctAddresses
                    INNER JOIN dbo.UserPrecincts ON dbo.UserPrecincts.PrecinctId = dbo.PrecinctAddresses.PrecinctId
                    WHERE dbo.PrecinctAddresses.CityId = @cityId
                    AND dbo.PrecinctAddresses.StreetId = @streetId
                    AND dbo.PrecinctAddresses.House = @house
                    AND dbo.UserPrecincts.UserId = @userId",
                    new SqlParameter("cityId", cityId), 
                    new SqlParameter("streetId", streetId),
                    new SqlParameter("house", house),
                    new SqlParameter("userId", userId)
            ).CountAsync().Result;
            if (count == 0) actionContext.Response = new HttpResponseMessage(HttpStatusCode.NotFound); 
        }
    }
}