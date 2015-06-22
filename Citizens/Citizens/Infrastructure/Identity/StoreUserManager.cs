using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin;

namespace Citizens.Models
{
    public class StoreUserManager : UserManager<ApplicationUser>
    {
        public StoreUserManager(IUserStore<ApplicationUser> store) : base(store) {
        }
        public static StoreUserManager Create(
            IdentityFactoryOptions<StoreUserManager> options, IOwinContext context)
        {
            CitizenDbContext dbContext = context.Get<CitizenDbContext>();
            StoreUserManager manager = new StoreUserManager(new UserStore<ApplicationUser>(dbContext));
            manager.UserValidator = new UserValidator<ApplicationUser>(manager)
            {
                AllowOnlyAlphanumericUserNames = false,
                RequireUniqueEmail = true
            };
            
            manager.PasswordValidator = new PasswordValidator
            {
                RequiredLength = 1,
                RequireNonLetterOrDigit = false,
                RequireDigit = false,
                RequireLowercase = false,
                RequireUppercase = false,
            };
            var dataProtectionProvider = options.DataProtectionProvider;
            if (dataProtectionProvider != null)
            {
                manager.UserTokenProvider = new DataProtectorTokenProvider<ApplicationUser>(dataProtectionProvider.Create("ASP.NET Identity"));
            }
            return manager;
        }
    }
}