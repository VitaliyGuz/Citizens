using System.Data.SqlClient;
using System.Net;
using System.Net.Http;
using System.Web.Http.Controllers;

namespace Citizens.Extensions
{
    public class WorkAreaFilterAttribute : BaseActionFilter
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

            var count = db.Database.SqlQuery<int>(
                @"SELECT TOP 1 dbo.WorkAreas.Id as Id
                      FROM dbo.WorkAreas
                      INNER JOIN dbo.UserPrecincts ON dbo.UserPrecincts.PrecinctId = dbo.WorkAreas.PrecinctId
                      WHERE dbo.WorkAreas.Id = @workAreaId AND dbo.UserPrecincts.UserId = @userId",
                new SqlParameter("workAreaId", entryId), new SqlParameter("userId", userId)
            ).CountAsync().Result;
            if (count == 0) actionContext.Response = new HttpResponseMessage(HttpStatusCode.NotFound); 
        }
    }
}