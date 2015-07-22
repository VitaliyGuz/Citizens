using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Net.Http.Headers;
using System.Text;
using System.Web;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;
using Citizens.Models;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;

namespace Citizens.Extensions
{
    public class PersonFilterAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(HttpActionContext actionContext)
        {
            if (actionContext.Request.Headers.From == "self@com.com")
            {
                //actionContext.Response.Headers.Remove();
                base.OnActionExecuting(actionContext);
                return;
            }
            var uri = actionContext.Request.RequestUri.OriginalString;
            var pathBuilder = new StringBuilder();            

            var queryStringIndex = uri.IndexOf('?');

            var userMgr = HttpContext.Current.GetOwinContext().GetUserManager<ApplicationUserManager>();

            var userId = userMgr.FindByName(HttpContext.Current.User.Identity.Name).Id;


            if (queryStringIndex != -1)
            {
                var queryFilterIndex = uri.IndexOf("$Filter", StringComparison.OrdinalIgnoreCase);
                if (queryFilterIndex != -1)
                {
                    var queryAndIndex = uri.Substring(queryFilterIndex).IndexOf("&", StringComparison.OrdinalIgnoreCase);
                    if (queryAndIndex != -1)
                    //append between $Filter and &
                    {
                        queryAndIndex = queryAndIndex + queryFilterIndex;
                        appendString(pathBuilder, uri.Substring(0, queryAndIndex), " and ", userId, uri.Substring(queryAndIndex));
                        //pathBuilder.Append(uri.Substring(0, queryAndIndex));
                        //pathBuilder.Append(
                        //    " and PrecinctAddress/Precinct/UserPrecincts/any(userprecinct:userprecinct/UserId eq '438ff3a5-ef30-4931-8bfa-bf388f76c0fd')");
                        //pathBuilder.Append(uri.Substring(queryAndIndex));
                    }
                    else
                    //append at the and
                    {
                        appendString(pathBuilder, uri, " and ", userId, "");
                        //pathBuilder.Append(uri);
                        //pathBuilder.Append(
                        //    " and PrecinctAddress/Precinct/UserPrecincts/any(userprecinct:userprecinct/UserId eq '438ff3a5-ef30-4931-8bfa-bf388f76c0fd')");
                    }
                }
                else
                {
                    appendString(pathBuilder, uri, "&$Filter=", userId, "");
                    //pathBuilder.Append(uri);
                    //pathBuilder.Append(
                    //    "&$Filter=PrecinctAddress/Precinct/UserPrecincts/any(userprecinct:userprecinct/UserId eq '438ff3a5-ef30-4931-8bfa-bf388f76c0fd')");
                }
            }
            else
            {
                appendString(pathBuilder, uri, "?$Filter=", userId, "");
                //pathBuilder.Append(uri);
                //pathBuilder.Append(
                //    "?$Filter=PrecinctAddress/Precinct/UserPrecincts/any(userprecinct:userprecinct/UserId eq '438ff3a5-ef30-4931-8bfa-bf388f76c0fd')");
            }


            actionContext.Response = GetPeople(pathBuilder.ToString(), actionContext.Request.Headers.Authorization.Parameter);

        }

        private void appendString(StringBuilder pathBuilder, string preUri, string addString, string userId, string postUri)
        {
            pathBuilder.Append(preUri);
            pathBuilder.Append(addString);
            pathBuilder.Append("PrecinctAddress/Precinct/UserPrecincts/any(userprecinct:userprecinct/UserId eq '");
            pathBuilder.Append(userId);
            pathBuilder.Append("')");
            pathBuilder.Append(postUri);
        }

        private HttpResponseMessage GetPeople(string path, string authorization)
        {
            var client = new HttpClient();
            client.DefaultRequestHeaders.Clear();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("bearer", authorization);
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            client.DefaultRequestHeaders.From = "self@com.com";
            var response = client.GetAsync(path).Result;
            return response;
            //var response = client.GetAsync(path).Result.Content.ReadAsAsync<IEnumerable<Person>>().Result;
            //response.Content.Headers.ContentType = new MediaTypeHeaderValue("Application/json");
            //var message = new HttpResponseMessage();
            //message.Content = new ObjectContent(typeof(Person), response, new JsonMediaTypeFormatter());
            //return message;
        }
    }
}