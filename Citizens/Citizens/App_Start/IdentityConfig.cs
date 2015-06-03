using System;
using System.Threading.Tasks;
using Microsoft.Owin;
using Owin;
using Microsoft.AspNet.Identity;
using Microsoft.Owin.Security.Cookies;
using Microsoft.Owin.Security.OAuth;
using Citizens.Models;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin.Security.Google;

[assembly: OwinStartup(typeof(Citizens.IdentityConfig))]

namespace Citizens
{
    public class IdentityConfig
    {
        static IdentityConfig()
        {
            PublicClientId = "web";

            OAuthOptions = new OAuthAuthorizationServerOptions
            {
                TokenEndpointPath = new PathString("/Token"),
                AuthorizeEndpointPath = new PathString("/Account/Authorize"),
                Provider = new ApplicationOAuthProvider(PublicClientId),
                AccessTokenExpireTimeSpan = TimeSpan.FromDays(14),
                AllowInsecureHttp = true
            };
        }
        public static OAuthAuthorizationServerOptions OAuthOptions { get; private set; }

        public static string PublicClientId { get; private set; }

        public void Configuration(IAppBuilder app)
        {
            app.CreatePerOwinContext(CitizenDbContext.Create);
            app.CreatePerOwinContext<StoreUserManager>(StoreUserManager.Create);
            app.CreatePerOwinContext<StoreRoleManager>(StoreRoleManager.Create);
            app.CreatePerOwinContext<StoreSignInManager>(StoreSignInManager.Create);

            // Enable the application to use a cookie to store information for the signed in user
            app.UseCookieAuthentication(new CookieAuthenticationOptions
            {
                AuthenticationType = DefaultAuthenticationTypes.ApplicationCookie,
                LoginPath = new PathString("/Account/Login"),
                Provider = new CookieAuthenticationProvider
                {
                    // Enables the application to validate the security stamp when the user logs in.
                    // This is a security feature which is used when you change a password or add an external login to your account.  
                    OnValidateIdentity = SecurityStampValidator.OnValidateIdentity<StoreUserManager, User>(
                        validateInterval: TimeSpan.FromMinutes(20),
                        regenerateIdentity: (manager, user) => user.GenerateUserIdentityAsync(manager))
                }
            });
            // Use a cookie to temporarily store information about a user logging in with a third party login provider
            app.UseExternalSignInCookie(DefaultAuthenticationTypes.ExternalCookie);

            // Enables the application to temporarily store user information when they are verifying the second factor in the two-factor authentication process.
            app.UseTwoFactorSignInCookie(DefaultAuthenticationTypes.TwoFactorCookie, TimeSpan.FromMinutes(5));

            // Enables the application to remember the second login verification factor such as phone or email.
            // Once you check this option, your second step of verification during the login process will be remembered on the device where you logged in from.
            // This is similar to the RememberMe option when you log in.
            app.UseTwoFactorRememberBrowserCookie(DefaultAuthenticationTypes.TwoFactorRememberBrowserCookie);

            // Enable the application to use bearer tokens to authenticate users
            app.UseOAuthBearerTokens(OAuthOptions);

            // Uncomment the following lines to enable logging in with third party login providers
            //app.UseMicrosoftAccountAuthentication(
            //    clientId: "",
            //    clientSecret: "");

            //app.UseTwitterAuthentication(
            //    consumerKey: "",
            //    consumerSecret: "");

            //app.UseFacebookAuthentication(
            //    appId: "1447548322205658",
            //    appSecret: "a188ff5ebe61508899ea32b370ba1b61");

            app.UseGoogleAuthentication(new GoogleOAuth2AuthenticationOptions()
            {
                //Citizens2015
                //ClientId = "1076913514687-663079cikh0er8u8p1cef2q97jsmno9n.apps.googleusercontent.com",
                //ClientSecret = "Sr99XlRX3bvadt3NXab7oly1"

                //Poltava2015
                //ClientId = "1076913514687-i5j7lt2a7jjbqvv8akpiv2db5jt92hf1.apps.googleusercontent.com",
                //ClientSecret = "nPR9zOwLqXxVVa9ZmfUXeJP6"

                //LocalHost
                ClientId = "1076913514687-bj5f9emeg981lv3tnimqtkr17imhkgff.apps.googleusercontent.com",
                ClientSecret = "vIbSmTS0oheIUHFt7WTBp4Ww"
            });

            
            ////app.UseCookieAuthentication(new CookieAuthenticationOptions
            ////{
            ////    AuthenticationType = DefaultAuthenticationTypes.ApplicationCookie
            ////});
			// For more information on how to configure your application, visit http://go.microsoft.com/fwlink/?LinkID=316888
			app.UseOAuthBearerTokens(new OAuthAuthorizationServerOptions
			{
			    Provider = new StoreAuthProvider(),
			    AllowInsecureHttp = true,
			    TokenEndpointPath = new PathString("/Authenticate")
			});            
		}
    }
}
