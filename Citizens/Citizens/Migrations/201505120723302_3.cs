//namespace Citizens.Migrations
//{
//    using Citizens.Models;
//    using Microsoft.AspNet.Identity;
//    using Microsoft.AspNet.Identity.EntityFramework;
//    using System;
//    using System.Data.Entity.Migrations;

//    public partial class _3 : DbMigration
//    {
//        public override void Up()
//        {
//            AddColumn("dbo.AspNetRoles", "Discriminator", c => c.String(nullable: false, maxLength: 128));
//            AddColumn("dbo.AspNetUserRoles", "Discriminator", c => c.String(nullable: false, maxLength: 128));

//            var context = new CitizenDbContext();


//            StoreUserManager userMgr = new StoreUserManager(new UserStore<User>(context));
//            StoreRoleManager roleMgr = new StoreRoleManager(new RoleStore<Role>(context));
//            string roleName = "Administrators";
//            string userName = "Admin";
//            string password = "secret";
//            string email = "admin@example.com";

//            if (!roleMgr.RoleExists(roleName))
//            {
//                roleMgr.Create(new Role(roleName));
//            }
//            User userAdmin = userMgr.FindByName(userName);
//            if (userAdmin == null)
//            {
//                userMgr.Create(new User
//                {
//                    UserName = userName,
//                    Email = email
//                }, password);
//                userAdmin = userMgr.FindByName(userName);
//            }
//            if (!userMgr.IsInRole(userAdmin.Id, roleName))
//            {
//                userMgr.AddToRole(userAdmin.Id, roleName);
//            }
//            //base.Seed(context);

//            roleName = "Operators";
//            userName = "Operator";
//            password = "secret";
//            email = "operator@example.com";

//            if (!roleMgr.RoleExists(roleName))
//            {
//                roleMgr.Create(new Role(roleName));
//            }
//            User userOperator = userMgr.FindByName(userName);
//            if (userOperator == null)
//            {
//                userMgr.Create(new User
//                {
//                    UserName = userName,
//                    Email = email
//                }, password);
//                userOperator = userMgr.FindByName(userName);
//            }
//            if (!userMgr.IsInRole(userOperator.Id, roleName))
//            {
//                userMgr.AddToRole(userOperator.Id, roleName);
//            }
//        }

//        public override void Down()
//        {
//        }
//    }
//}
