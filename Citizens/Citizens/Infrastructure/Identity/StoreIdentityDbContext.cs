using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.Identity.EntityFramework;
using System.Data.Entity;

namespace Citizens.Models
{
    public class StoreIdentityDbContext : IdentityDbContext<StoreUser>
    {
        public StoreIdentityDbContext() : base("CitizensIdentityDb")
        {
            Database.SetInitializer<StoreIdentityDbContext>(new StoreIdentityDbInitializer());
        }

        public static StoreIdentityDbContext Create()
        {
            return new StoreIdentityDbContext();
        }

    }
}