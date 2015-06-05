using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using System.Web.Security;
using System.Web.SessionState;
using System.Web.Http;

namespace Citizens
{
    public class Global : HttpApplication
    {
        void Application_Start(object sender, EventArgs e)
        {
            // Code that runs on application startup
            AreaRegistration.RegisterAllAreas();
            GlobalConfiguration.Configure(WebApiConfig.Register);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            GlobalFilters.Filters.Add(new CustomAuthorize());//GlobalFilters.Filters.Add(new AuthorizeAttribute() { Roles = "Admin, SuperUser" });
            GlobalConfiguration.Configuration.MessageHandlers.Add(new HttpMessageHandler(new CorsHandler(
            "http://localhost:36561",
            "PUT,GET,PATCH,DELETE,HEAD,OPTIONS",
            "Content-Type",
            true
    )));
        }
    }


    

    public class CustomAuthorize : System.Web.Mvc.AuthorizeAttribute
    {        
        protected override void HandleUnauthorizedRequest(AuthorizationContext filterContext)
        {
            if (!filterContext.HttpContext.User.Identity.IsAuthenticated)
            {
                base.HandleUnauthorizedRequest(filterContext);
            }
            else
            {
                filterContext.Result = new RedirectToRouteResult(new
                RouteValueDictionary(new { controller = "Home", action = "Index" }));
            }
        }
    }

    public abstract class Handler
    {
        public string Methods { get; protected set; }
        public abstract HttpResponseMessage Apply(Task<HttpResponseMessage> response, HttpRequestMessage request);
    }

    public class CorsHandler : Handler
    {
        private readonly bool _corsEnabled;
        private readonly string _allowedOrigins;
        private readonly string _allowedHeaders;
        private readonly bool _allowCredentials;

        public CorsHandler(string allowedOrigins,
                            string allowedMethods,
                            string allowedHeaders,
                            bool allowCredentials)
        {
            // Force to be explicit on cors configuration
            if (string.IsNullOrEmpty(allowedOrigins) ||
                string.IsNullOrEmpty(allowedMethods) ||
                string.IsNullOrEmpty(allowedHeaders))
            {
                return;
            }

            _corsEnabled = true;
            _allowedOrigins = allowedOrigins;
            _allowedHeaders = allowedHeaders;
            _allowCredentials = allowCredentials;
            Methods = allowedMethods;
        }

        public override HttpResponseMessage Apply(Task<HttpResponseMessage> prior, HttpRequestMessage request)
        {
            var response = prior.Result;

            // Prevent the "found" redirect and return 404 for unauthorized requests
            if (response.StatusCode.Equals(HttpStatusCode.Found))
            {
                response.StatusCode = HttpStatusCode.NotFound;
                return response;
            }

            // Handle the OPTIONS request here
            if (request.Method.Equals(HttpMethod.Options) &&
              (response.StatusCode.Equals(HttpStatusCode.MethodNotAllowed) || response.StatusCode.Equals(HttpStatusCode.Unauthorized)))
            {
                response.StatusCode = HttpStatusCode.OK;
            }

            if (!_corsEnabled)
                return response;

            // Respond only if the client sent an origin header
            if (request.Headers.Any(header => header.Key.Equals("Origin")))
            {
                var originValue = request.Headers.FirstOrDefault(header => header.Key.Equals("Origin")).Value.FirstOrDefault();
                if (!string.IsNullOrWhiteSpace(originValue))
                {
                    var originUri = new Uri(originValue);
                    var origin = string.Format("{0}://{1}", originUri.Scheme, originUri.Authority);
                    if (_allowedOrigins.Contains(origin) || _allowedOrigins.Equals("*"))
                    {
                        response.Headers.Add("Access-Control-Allow-Origin", origin);
                        response.Headers.Add("Access-Control-Allow-Methods", Methods);
                        response.Headers.Add("Access-Control-Allow-Headers", _allowedHeaders);
                        if (_allowCredentials)
                            response.Headers.Add("Access-Control-Allow-Credentials", new[] { "true" });
                    }
                }
            }
            return response;
        }
    }

    public class HttpMessageHandler : DelegatingHandler
    {
        private readonly Handler _handler;

        public HttpMessageHandler(Handler h)
        {
            _handler = h;
        }

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request,
                                                                        CancellationToken cancellationToken)
        {
            return _handler.Apply(base.SendAsync(request, cancellationToken), request);
        }
    }
}