using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.Owin;
using Microsoft.Owin.Security.Cookies;
using Microsoft.Owin.Security.Google;
using Microsoft.Owin.Security.OAuth;
using Owin;
using Citizens.Models;
using Citizens.Providers;
using Microsoft.Owin.Security;


[assembly: OwinStartup(typeof(Citizens.IdentityConfig))]

namespace Citizens
{
    public class IdentityConfig
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }

        public static OAuthAuthorizationServerOptions OAuthOptions { get; private set; }        
        public static GoogleOAuth2AuthenticationOptions GoogleAuthOptions { get; private set; }
        //public static FacebookAuthenticationOptions facebookAuthOptions { get; private set; }

        public static string PublicClientId { get; private set; }

        // For more information on configuring authentication, please visit http://go.microsoft.com/fwlink/?LinkId=301864
        public void ConfigureAuth(IAppBuilder app)
        {
            // Configure the db context and user manager to use a single instance per request
            app.CreatePerOwinContext(CitizenDbContext.Create);
            app.CreatePerOwinContext<StoreUserManager>(StoreUserManager.Create);
            app.CreatePerOwinContext<StoreRoleManager>(StoreRoleManager.Create);
            


            // Enable the application to use a cookie to store information for the signed in user
            // and to use a cookie to temporarily store information about a user logging in with a third party login provider
            //app.SetDefaultSignInAsAuthenticationType(DefaultAuthenticationTypes.ExternalCookie);
            //app.UseCookieAuthentication(new CookieAuthenticationOptions());
            app.UseExternalSignInCookie(DefaultAuthenticationTypes.ExternalCookie);

            // Configure the application for OAuth based flow
            PublicClientId = "Citizens";
            OAuthOptions = new OAuthAuthorizationServerOptions
            {
                TokenEndpointPath = new PathString("/Token"),
                Provider = new ApplicationOAuthProvider(PublicClientId),                
                AccessTokenExpireTimeSpan = TimeSpan.FromDays(1),
                AllowInsecureHttp = true
            };

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
            //    appId: "",
            //    appSecret: "");


            GoogleAuthOptions = new GoogleOAuth2AuthenticationOptions()
            {
                //ClientId = "1076913514687-bhrksa4k05elvb08uecoeul1s92q2t2m.apps.googleusercontent.com",
                //ClientSecret = "G0aPsqu7qqcqBwyT9xFMV3X2",
                //ClientId = "1076913514687-90t2mcv9atf6o4eukhsqa0e4kntkegr4.apps.googleusercontent.com",
                //ClientSecret = "3N3QraNkWYWgIzE_Aof9fqy1",
                ClientId = "1076913514687-l4pfivi8annt8suev3mrvlploi9lk9mv.apps.googleusercontent.com",
                ClientSecret = "yZgcBl5tts_diM_CHlERRTuZ",
                Provider = new GoogleAuthProvider()
            };
            app.UseGoogleAuthentication(GoogleAuthOptions);
        }
    }
}
