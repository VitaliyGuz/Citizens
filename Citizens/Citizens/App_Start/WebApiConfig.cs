using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using Citizens.Infrastructure;

using Microsoft.Data.OData;
using Citizens.Models;
using Microsoft.AspNet.Identity.EntityFramework;
using System.Web.Http.Filters;

using System.Web.Http.Controllers;
using System.Web.OData.Builder;
using System.Web.OData.Routing.Conventions;
using System.Web.OData.Routing;
using System.Web.OData.Extensions;
using Citizens.Extensions;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin.Security;

namespace Citizens
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            config.MapHttpAttributeRoutes();

            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );

            config.Filters.Add(new LoggerAttribute() { Roles = "Operators, Administrators, SuperAdministrators, ReadOnly" });
            // Web API configuration and services
            ODataConventionModelBuilder builder = new ODataConventionModelBuilder();
            builder.EntitySet<City>("Cities");
            builder.EntitySet<CityType>("CityTypes");
            builder.EntitySet<CityRegionPart>("CityRegionParts");
            builder.EntitySet<District>("Districts");
            builder.EntitySet<DistrictPrecinct>("DistrictPrecincts");
            builder.EntitySet<DistrictType>("DistrictTypes");
            builder.EntitySet<Election>("Elections");
            builder.EntitySet<Person>("People");
            builder.EntitySet<Precinct>("Precincts");
            builder.EntitySet<PrecinctAddress>("PrecinctAddresses");
            builder.EntitySet<Region>("Regions");
            builder.EntitySet<RegionPart>("RegionParts");
            builder.EntitySet<Street>("Streets");
            builder.EntitySet<StreetType>("StreetTypes");
            builder.EntitySet<UserPrecinct>("UserPrecincts");
            builder.EntitySet<PropertyKey>("PropertyKeys");
            builder.EntitySet<PropertyValue>("PropertyValues");
            builder.EntitySet<PersonAdditionalProperty>("PersonAdditionalProperties");
            builder.EntitySet<Neighborhood>("Neighborhoods");
            builder.EntitySet<UserRegion>("UserRegions");
            builder.EntitySet<UserRegionPart>("UserRegionParts");
            builder.EntitySet<WorkArea>("WorkAreas");

            builder.EntitySet<ApplicationUser>("Users");
            //builder.EntitySet<IdentityUserClaim>("Claims");
            builder.EntitySet<ApplicationRole>("Roles");

            builder.EntityType<UserPrecinct>()
                .Collection
                .Action("AddRange")
                .CollectionParameter<UserPrecinct>("Array");

            builder.EntityType<UserPrecinct>()
                .Collection
                .Action("RemoveRange")
                .CollectionParameter<UserPrecinct>("Array");

            builder.EntityType<WorkArea>()
                .Collection
                .Action("CountPeopleAtAddresses")
                .ReturnsCollection<AddressCountPeople>()
                .CollectionParameter<AddressCountPeople>("Addresses");

            builder.EntityType<WorkArea>()
                .Collection
                .Action("CountPeopleAtPrecincts")
                .ReturnsCollection<AddressCountPeople>()
                .CollectionParameter<AddressCountPeople>("Precincts");

            //builder.EntitySet<IdentityUserRole>("UserRoles");
            //builder.EntitySet<ApplicationUserLogin>("Logins");
            //var conventions = ODataRoutingConventions.CreateDefault();
            //conventions.Insert(0, new CompositeKeyRoutingConvention());
            //conventions.Insert(0, new UnEncodeOdataUri());
            config.EnableCaseInsensitive(caseInsensitive: true);
            config.EnableUnqualifiedNameCall(unqualifiedNameCall: true);
            config.EnableEnumPrefixFree(enumPrefixFree: true);
            var edm = builder.GetEdmModel();
            config.MapODataServiceRoute(
            routeName: "odata",
            routePrefix: "odata",
            model: edm,
            pathHandler: new PathAndSlashEscapeODataPathHandler(), routingConventions: ODataRoutingConventions.CreateDefaultWithAttributeRouting(config, edm));
            //config.Routes.MapODataRoute(
            //    routeName: "odata",
            //    routePrefix: "odata",
            //    model: builder.GetEdmModel(),
            //    pathHandler: new DefaultODataPathHandler(),
            //    routingConventions: conventions);


            //config.Routes.MapODataRoute("odata", "odata", builder.GetEdmModel());

            //IActionFilter filter = new QueryableAttribute() { MaxExpansionDepth = 3 };
            //config.EnableQuerySupport(filter);

            // Web API routes
            //config.MapHttpAttributeRoutes();

            //config.MapHttpAttributeRoutes();

            //config.Routes.MapHttpRoute(
            //    name: "DefaultApi",
            //    routeTemplate: "api/{controller}/{action}/{id}",
            //    defaults: new { id = RouteParameter.Optional }
            //);

            //config.Routes.MapHttpRoute(
            //    name: "DefaultApi",
            //    routeTemplate: "api/{controller}/{id}",
            //    defaults: new { id = RouteParameter.Optional }
            //);

            //config.Routes.MapHttpRoute(
            //    name: "DefaultApi",
            //    routeTemplate: "api/{controller}/{id}",
            //    defaults: new { id = RouteParameter.Optional }
            //);
            //config.Formatters.Remove(config.Formatters.XmlFormatter);
            //config.DependencyResolver = new CustomResolver();

            //GlobalConfiguration.Configuration.Formatters.JsonFormatter
            //    .SerializerSettings.ReferenceLoopHandling =
            //    Newtonsoft.Json.ReferenceLoopHandling.Ignore;
        }
    }

    //public class UnEncodeOdataUri : EntityRoutingConvention
    //{
    //    public override string SelectAction(ODataPath odataPath, HttpControllerContext controllerContext,
    //        ILookup<string, HttpActionDescriptor> actionMap)
    //    {
    //        var newpath = controllerContext.Request.RequestUri.OriginalString
    //            .Replace("[GREATER]", @">")
    //            .Replace("[LESS]", @"<")
    //            .Replace("[STAR]", @"*")
    //            .Replace("[EQUAL]", @"=")
    //            .Replace("[COLON]", @":")
    //            .Replace("[SQUOTE]", "'")
    //            .Replace("[SQUOTE]", "'")
    //            .Replace("[PERCENT]", "%")
    //            .Replace("[PLUS]", "+")
    //            .Replace("[FSLASH]", @"/")
    //            .Replace("[BSLASH]", @"\")
    //            .Replace("[QUESTION]", "?")
    //            .Replace("[POUND]", "#")
    //            .Replace("[AMPERSAND]", "&")
    //            .Replace("[DQUOTE]", "\"");
    //        controllerContext.Request = new HttpRequestMessage(controllerContext.Request.Method, new Uri(newpath));
    //        var action = base.SelectAction(odataPath, controllerContext, actionMap);
    //        return action;
    //    }
    //}

    //public class CompositeKeyRoutingConvention : EntityRoutingConvention
    //{
    //    public override string SelectAction(ODataPath odataPath, HttpControllerContext controllerContext, ILookup<string, HttpActionDescriptor> actionMap)
    //    {
    //        var action = base.SelectAction(odataPath, controllerContext, actionMap);
    //        if (action != null)
    //        {
    //            var routeValues = controllerContext.RouteData.Values;
    //            if (routeValues.ContainsKey(ODataRouteConstants.Key))
    //            {
    //                var keyRaw = routeValues[ODataRouteConstants.Key] as string;
    //                IEnumerable<string> compoundKeyPairs = keyRaw.Split(',');
    //                if (compoundKeyPairs == null || !compoundKeyPairs.Any())
    //                {
    //                    return action;
    //                }

    //                foreach (var compoundKeyPair in compoundKeyPairs)
    //                {
    //                    string[] pair = compoundKeyPair.Split('=');
    //                    if (pair == null || pair.Length != 2)
    //                    {
    //                        continue;
    //                    }
    //                    var keyName = pair[0].Trim();
    //                    var keyValue = pair[1].Trim();

    //                    routeValues.Add(keyName, keyValue);
    //                }
    //            }
    //        }

    //        return action;
    //    }
    //}
    
    //public class LoggerAttribute : AuthorizationFilterAttribute 
    public class LoggerAttribute : AuthorizeAttribute 
    {
        
        //public override void OnAuthorization(HttpActionContext actionContext)
        //{
        //    if (actionContext.Request.RequestUri.Scheme != Uri.UriSchemeHttps)
        //    {
        //        actionContext.Response = new HttpResponseMessage(HttpStatusCode.Forbidden) { Content = new StringContent("SSL required") };
        //    } 
        //}
        protected override void HandleUnauthorizedRequest(HttpActionContext ctx)
        {
            if (!ctx.RequestContext.Principal.Identity.IsAuthenticated)
                base.HandleUnauthorizedRequest(ctx);
            else
            {                
                ctx.Response = new HttpResponseMessage(System.Net.HttpStatusCode.Forbidden);
            }
        }
    }

    //public class PersonFilterAttribute : ActionFilterAttribute
    //{
    //    public override void OnActionExecuting(HttpActionContext actionContext)
    //    {
    //        if (actionContext.Request.Headers.From == "self@com.com")
    //        {
    //            base.OnActionExecuting(actionContext);
    //            return;
    //        }
    //        var uri = actionContext.Request.RequestUri.OriginalString;
    //        var pathBuilder = new StringBuilder();
    //        var client = new HttpClient();

    //        var queryStringIndex = uri.IndexOf('?');
            
    //        var userMgr = HttpContext.Current.GetOwinContext().GetUserManager<ApplicationUserManager>();
            
    //        var userId = userMgr.FindByName(HttpContext.Current.User.Identity.Name).Id;


    //        if (queryStringIndex != -1)
    //        {
    //            var queryFilterIndex = uri.IndexOf("$Filter", StringComparison.OrdinalIgnoreCase);
    //            if (queryFilterIndex != -1)
    //            {
    //                var queryAndIndex = uri.Substring(queryFilterIndex).IndexOf("&", StringComparison.OrdinalIgnoreCase);
    //                if (queryAndIndex != -1)
    //                //append between $Filter and &
    //                {
    //                    queryAndIndex = queryAndIndex + queryFilterIndex;
    //                    pathBuilder.Append(uri.Substring(0, queryAndIndex));
    //                    pathBuilder.Append(
    //                        " and PrecinctAddress/Precinct/UserPrecincts/any(userprecinct:userprecinct/UserId eq '438ff3a5-ef30-4931-8bfa-bf388f76c0fd')");
    //                    pathBuilder.Append(uri.Substring(queryAndIndex));
    //                }
    //                else
    //                //append at the and
    //                {
    //                    pathBuilder.Append(uri);
    //                    pathBuilder.Append(
    //                        " and PrecinctAddress/Precinct/UserPrecincts/any(userprecinct:userprecinct/UserId eq '438ff3a5-ef30-4931-8bfa-bf388f76c0fd')");
    //                }
    //            }
    //            else
    //            {
    //                pathBuilder.Append(uri);
    //                pathBuilder.Append(
    //                    "&$Filter=PrecinctAddress/Precinct/UserPrecincts/any(userprecinct:userprecinct/UserId eq '438ff3a5-ef30-4931-8bfa-bf388f76c0fd')");
    //            }
    //        }
    //        else
    //        {
    //            pathBuilder.Append(uri);
    //            pathBuilder.Append(
    //                "?$Filter=PrecinctAddress/Precinct/UserPrecincts/any(userprecinct:userprecinct/UserId eq '438ff3a5-ef30-4931-8bfa-bf388f76c0fd')");
    //        }


    //        actionContext.Response = GetPeople(pathBuilder.ToString(), actionContext.Request.Headers.Authorization.Parameter);

    //    }

    //    private HttpResponseMessage appendString(StringBuilder pathBuilder, string preUri, string addString, string userId, string postUri)
    //    {            
    //        pathBuilder.Append(preUri);
    //        pathBuilder.Append(addString);
    //        pathBuilder.Append("PrecinctAddress/Precinct/UserPrecincts/any(userprecinct:userprecinct/UserId eq '");
    //        pathBuilder.Append(userId);
    //        pathBuilder.Append("')");
    //        pathBuilder.Append(postUri);
    //    }

    //    private HttpResponseMessage GetPeople(string path, string authorization)
    //    {
    //        var client = new HttpClient();
    //        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("bearer", authorization);
    //        client.DefaultRequestHeaders.From = "self@com.com";            
    //        var response = client.GetAsync(path).Result;
    //        return response;
    //    }
    //}

    

    //class PersonFilterHandler : DelegatingHandler
    //{
    //    StreamWriter _writer;

    //    public LoggingHandler(Stream stream)
    //    {
    //        _writer = new StreamWriter(stream);
    //    }

    //    protected override async Task<HttpResponseMessage> SendAsync(
    //        HttpRequestMessage request, System.Threading.CancellationToken cancellationToken)
    //    {
    //        var response = await base.SendAsync(request, cancellationToken);

    //        if (!response.IsSuccessStatusCode)
    //        {
    //            _writer.WriteLine("{0}\t{1}\t{2}", request.RequestUri,
    //                (int)response.StatusCode, response.Headers.Date);
    //        }
    //        return response;
    //    }

    //    protected override void Dispose(bool disposing)
    //    {
    //        if (disposing)
    //        {
    //            _writer.Dispose();
    //        }
    //        base.Dispose(disposing);
    //    }
    //}
}
