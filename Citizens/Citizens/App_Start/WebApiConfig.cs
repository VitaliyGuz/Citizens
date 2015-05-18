using System;
using System.Collections.Generic;
using System.Linq;
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

namespace Citizens
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            //config.Filters.Add(new AuthorizeAttribute());            
            // Web API configuration and services
            ODataConventionModelBuilder builder = new ODataConventionModelBuilder();
            builder.EntitySet<City>("Cities");
            builder.EntitySet<CityType>("CityTypes");
            builder.EntitySet<CityRegionPart>("CityRegionParts");
            builder.EntitySet<District>("Districts");
            builder.EntitySet<Person>("People");
            builder.EntitySet<Precinct>("Precincts");
            builder.EntitySet<PrecinctAddress>("PrecinctAddresses");
            builder.EntitySet<Region>("Regions");
            builder.EntitySet<RegionPart>("RegionParts");
            builder.EntitySet<Street>("Streets");
            builder.EntitySet<StreetType>("StreetTypes");
            builder.EntitySet<UserPrecinct>("UserPrecincts");


            builder.EntitySet<User>("Users");
            builder.EntitySet<IdentityUserClaim>("Claims");
            builder.EntitySet<Role>("Roles");
            //builder.EntitySet<IdentityUserRole>("UserRoles");
            //builder.EntitySet<IdentityUserLogin>("Logins");
            //var conventions = ODataRoutingConventions.CreateDefault();
            //conventions.Insert(0, new CompositeKeyRoutingConvention());
            config.MapODataServiceRoute(
            routeName: "odata",
            routePrefix: "odata",
            model: builder.GetEdmModel());
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

            //config.Routes.MapHttpRoute(
            //    name: "OrdersRoute",
            //    routeTemplate: "nonrest/{controller}/{action}/{id}",
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
}
