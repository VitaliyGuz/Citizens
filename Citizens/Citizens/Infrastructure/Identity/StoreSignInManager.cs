using Citizens.Models;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin;
using Microsoft.Owin.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;

namespace Citizens.Models
{
    public class StoreSignInManager : SignInManager<User, string>
    {
        public StoreSignInManager(StoreUserManager userManager, IAuthenticationManager authenticationManager) :
            base(userManager, authenticationManager)
        { }

        public override Task<ClaimsIdentity> CreateUserIdentityAsync(User user)
        {
            return user.GenerateUserIdentityAsync((StoreUserManager)UserManager);
        }

        public static StoreSignInManager Create(IdentityFactoryOptions<StoreSignInManager> options, IOwinContext context)
        {
            return new StoreSignInManager(context.GetUserManager<StoreUserManager>(), context.Authentication);
        }
    }
}