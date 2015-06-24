using System;
using System.Web;
using System.Web.Http;

namespace Citizens
{
    public class Global : HttpApplication
    {
        void Application_Start(object sender, EventArgs e)
        {            
            GlobalConfiguration.Configure(WebApiConfig.Register);            
        }

        protected void Application_BeginRequest(object sender, EventArgs e)
        {
            HttpContext.Current.Response.AddHeader("Access-Control-Allow-Origin", "http://localhost:36561");// http://poltava2015client.azurewebsites.net http://localhost:36561 http://citizens2015.azurewebsites.net #Deploy
            HttpContext.Current.Response.AddHeader("Access-Control-Allow-Credentials", "true");

            if (HttpContext.Current.Request.HttpMethod == "OPTIONS")
            {
                //These headers are handling the "pre-flight" OPTIONS call sent by the browser
                HttpContext.Current.Response.AddHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
                HttpContext.Current.Response.AddHeader("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization");
                HttpContext.Current.Response.AddHeader("Access-Control-Max-Age", "1728000");
                HttpContext.Current.Response.End();
            }

        }
    }
}