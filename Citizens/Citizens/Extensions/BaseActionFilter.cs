using System;
using System.Collections.Generic;
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
        private const string filterPattern = "UserPrecincts/any(userprecinct:userprecinct/UserId eq '@userId')";

        private string filterString = string.Empty;

        protected CitizenDbContext db = new CitizenDbContext();

        public override void OnActionExecuting(HttpActionContext actionContext)
        {
            buildNewRequestUri(actionContext);
        }

        private static ODataPath getODataPath(HttpActionContext actionContext)
        {
            object pathValue;
            if (!actionContext.Request.Properties.TryGetValue("System.Web.OData.Path", out pathValue)) return null;
            return (ODataPath)pathValue;
        }

        protected string getEntryId(HttpActionContext actionContext)
        {
            var odataPathValue = getODataPath(actionContext);
            if (odataPathValue == null) return null;
            return odataPathValue.Segments.Count > 1 ? odataPathValue.Segments[1].ToString() : string.Empty;
        }

        protected void setFilterString(string filterString)
        {
            if(filterString == null) return;
            this.filterString = filterString + "/";
        }

        private void buildNewRequestUri(HttpActionContext actionContext)
        {
            var queryBuilder = new StringBuilder();
            object propValue;
            if (actionContext.Request.Properties.TryGetValue("MS_QueryNameValuePairs", out propValue))
            {
                var queryPairs = (KeyValuePair<string, string>[]) propValue;
                foreach (var pair in queryPairs)
                {
                    if (queryBuilder.Length > 0) queryBuilder.Append('&');
                    queryBuilder.Append(pair.Key).Append('=').Append(pair.Value);
                    if ("$filter".Equals(pair.Key.ToLower()))
                    {
                        addFilter(queryBuilder, true);
                    }
                }
                if (!queryBuilder.ToString().ToLower().Contains("$filter"))
                {
                    queryBuilder.Append("&");
                    addFilter(queryBuilder, false);    
                }
            }
            else
            {
                addFilter(queryBuilder, false);
            }
            var uriString = actionContext.Request.RequestUri.Scheme + "://" + actionContext.Request.RequestUri.Authority +      actionContext.Request.RequestUri.AbsolutePath + '?' + queryBuilder;
            actionContext.Request.RequestUri = new Uri(uriString);
        }

        private void addFilter(StringBuilder builder, bool isExists)
        {
            builder.Append(isExists ? " and " : "$filter=");
            builder.Append(filterString).Append(filterPattern.Replace("@userId", getUserId()));
        }

        protected string getUserId()
        {
            var userMgr = HttpContext.Current.GetOwinContext().GetUserManager<ApplicationUserManager>();
            return userMgr.FindByName(HttpContext.Current.User.Identity.Name).Id;
        }
    }
}