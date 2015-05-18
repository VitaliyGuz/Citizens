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
    public class StoreRoleManager : RoleManager<Role>
    {
        public StoreRoleManager(RoleStore<Role> store) : base(store) { }
        public static StoreRoleManager Create(IdentityFactoryOptions<StoreRoleManager> options, IOwinContext context)
        {
            return new StoreRoleManager(new RoleStore<Role>(context.Get<CitizenDbContext>()));
        }
    }
}