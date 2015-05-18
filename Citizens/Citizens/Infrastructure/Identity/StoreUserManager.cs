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
    public class StoreUserManager : UserManager<User>
    {
        public StoreUserManager(IUserStore<User> store) : base(store) {
            PasswordValidator = new MinimumLengthValidator(1);
        }
        public static StoreUserManager Create(
            IdentityFactoryOptions<StoreUserManager> options, IOwinContext context)
        {
            CitizenDbContext dbContext = context.Get<CitizenDbContext>();
            StoreUserManager manager = new StoreUserManager(new UserStore<User>(dbContext));
            return manager;
        }
    }
}