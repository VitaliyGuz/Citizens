using System;
using System.Threading.Tasks;
using Microsoft.Owin;
using Owin;
using Microsoft.AspNet.Identity;
using Microsoft.Owin.Security.Cookies;
using Microsoft.Owin.Security.OAuth;
using Citizens.Models;

[assembly: OwinStartup(typeof(Citizens.IdentityConfig))]

namespace Citizens
{
    public class IdentityConfig
    {
        public void Configuration(IAppBuilder app)
        {
            app.CreatePerOwinContext<CitizenDbContext>(CitizenDbContext.Create);
            app.CreatePerOwinContext<StoreUserManager>(StoreUserManager.Create);
            app.CreatePerOwinContext<StoreRoleManager>(StoreRoleManager.Create);
            app.CreatePerOwinContext<StoreSignInManager>(StoreSignInManager.Create);
            app.UseCookieAuthentication(new CookieAuthenticationOptions
			{
				AuthenticationType = DefaultAuthenticationTypes.ApplicationCookie
			});
			// For more information on how to configure your application, visit http://go.microsoft.com/fwlink/?LinkID=316888
			//app.UseOAuthBearerTokens(new OAuthAuthorizationServerOptions
			//{
			//    Provider = new StoreAuthProvider(),
			//    AllowInsecureHttp = true,
			//    TokenEndpointPath = new PathString("/Authenticate")
			//});
		}
    }
}
