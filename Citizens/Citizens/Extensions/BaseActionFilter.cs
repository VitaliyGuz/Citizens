using System;
using System.Text;
using System.Web;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;
using System.Web.OData.Routing;
using Citizens.Models;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;

namespace Citizens.Extensions
{
    public class BaseActionFilter : ActionFilterAttribute
    {
        private const string baseFilterString = "UserPrecincts/any(userprecinct:userprecinct/UserId eq '";

        private string filterString = string.Empty;

        protected CitizenDbContext db = new CitizenDbContext();

        public override void OnActionExecuting(HttpActionContext actionContext)
        {
            actionContext.Request.RequestUri = new Uri(buildNewPath(actionContext.Request.RequestUri.OriginalString));
        }

        protected string getEntryId(HttpActionContext actionContext)
        {
            object pathValue;
            if (!actionContext.Request.Properties.TryGetValue("System.Web.OData.Path", out pathValue)) return null;
            var odataPathValue = (ODataPath)pathValue;
            return odataPathValue.Segments.Count > 1 ? odataPathValue.Segments[1].ToString() : string.Empty;
        }

        protected void setFilterString(string filterString)
        {
            if(filterString == null) return;
            this.filterString = filterString + "/";
        }

        private string buildNewPath(string uri)
        {
            var pathBuilder = new StringBuilder();

            var queryStringIndex = uri.IndexOf('?');
            
            var userId = getUserId();
            
            if (queryStringIndex != -1)
            {
                var queryFilterIndex = uri.IndexOf("$Filter", StringComparison.OrdinalIgnoreCase);
                if (queryFilterIndex != -1)
                {
                    var queryAndIndex = uri.Substring(queryFilterIndex).IndexOf("&", StringComparison.OrdinalIgnoreCase);
                    if (queryAndIndex != -1)
                    {
                        queryAndIndex = queryAndIndex + queryFilterIndex;
                        appendString(pathBuilder, uri.Substring(0, queryAndIndex), " and ", userId, uri.Substring(queryAndIndex));
                    }
                    else
                    {
                        appendString(pathBuilder, uri, " and ", userId, "");
                    }
                }
                else
                {
                    appendString(pathBuilder, uri, "&$Filter=", userId, "");
                }
            }
            else
            {
                appendString(pathBuilder, uri, "?$Filter=", userId, "");
            }
            return pathBuilder.ToString();
        }

        private void appendString(StringBuilder pathBuilder, string preUri, string addString, string userId, string postUri)
        {
            pathBuilder.Append(preUri);
            pathBuilder.Append(addString);
            pathBuilder.Append(filterString + baseFilterString);
            pathBuilder.Append(userId);
            pathBuilder.Append("')");
            pathBuilder.Append(postUri);
        }

        protected string getUserId()
        {
            var userMgr = HttpContext.Current.GetOwinContext().GetUserManager<ApplicationUserManager>();
            return userMgr.FindByName(HttpContext.Current.User.Identity.Name).Id;
        }
    }
}