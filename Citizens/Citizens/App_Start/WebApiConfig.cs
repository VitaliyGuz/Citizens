using System;
using System.Web.Http;
using Microsoft.Data.OData;
using Citizens.Models;
using System.Web.OData.Builder;
using System.Web.OData.Routing.Conventions;
using System.Web.OData.Routing;
using System.Web.OData.Extensions;
using Citizens.Extensions;

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
            builder.EntitySet<ApplicationRole>("Roles");
            
            // copmuted properties
            builder.EntityType<Person>().Property(p => p.CountSupporters);
            builder.EntityType<WorkArea>().Property(p => p.AddressesStr);
            builder.EntityType<WorkArea>().Property(p => p.CountElectors);
            builder.EntityType<WorkArea>().Property(p => p.CountMajors);
            builder.EntityType<WorkArea>().Property(p => p.CountHouseholds);

            builder.EntityType<UserPrecinct>()
                .Collection
                .Action("AddRange")
                .CollectionParameter<UserPrecinct>("Array");

            builder.EntityType<UserPrecinct>()
                .Collection
                .Action("RemoveRange")
                .CollectionParameter<UserPrecinct>("Array");
            
            var func = builder.EntityType<WorkArea>().Collection.Function("GetCountPeopleByPrecinct");
            func.Parameter<int>("PrecinctId");
            func.ReturnsCollection<AddressCountPeople>();

            builder.EntityType<WorkArea>()
                .Function("GetMajors")
                .ReturnsCollectionFromEntitySet<Person>("People");

            builder.EntityType<WorkArea>()
                .Function("GetSupporters")
                .ReturnsCollectionFromEntitySet<Person>("People");

            builder.EntityType<WorkArea>()
                .Collection
                .Action("CaclComputedProperties")
                .ReturnsCollection<WorkAreaComputed>()
                //.ReturnsCollectionFromEntitySet<WorkArea>("WorkAreas")
                .CollectionParameter<int>("WorkAreaIds");

            builder.EntityType<Person>()
                .Function("Precinct")
                .ReturnsCollectionFromEntitySet<Precinct>("Precincts");

            func = builder.EntityType<Person>().Collection.Function("FirstNames");
            func.Parameter<string>("StartsWith");
            func.ReturnsCollection<String>();

            func = builder.EntityType<Person>().Collection.Function("MidleNames");
            func.Parameter<string>("StartsWith");
            func.ReturnsCollection<String>();

            func = builder.EntityType<Person>().Collection.Function("LastNames");
            func.Parameter<string>("StartsWith");
            func.ReturnsCollection<String>();

            builder.EntityType<RegionPart>().Collection
                .Function("GetComputedProperties")
                .ReturnsCollection<RegionPartComputed>();

            builder.EntityType<PersonAdditionalProperty>()
                .Collection
                .Action("GetRange")
                .ReturnsCollectionFromEntitySet<PersonAdditionalProperty>("PersonAdditionalProperties")
                .CollectionParameter<PersonAdditionalProperty>("AdditionalProperties");

            builder.EntityType<Person>().Action("ClearMajor");
            
            config.EnableCaseInsensitive(caseInsensitive: true);
            config.EnableUnqualifiedNameCall(unqualifiedNameCall: true);
            config.EnableEnumPrefixFree(enumPrefixFree: true);
            var edm = builder.GetEdmModel();
            config.MapODataServiceRoute(
            routeName: "odata",
            routePrefix: "odata",
            model: edm,
            pathHandler: new PathAndSlashEscapeODataPathHandler(), 
            routingConventions: ODataRoutingConventions.CreateDefaultWithAttributeRouting(config, edm));
            
        }
    }

    
}
