//namespace Citizens.Migrations
//{
//    using System;
//    using System.Data.Entity.Migrations;

//    public partial class _2 : DbMigration
//    {
//        public override void Up()
//        {
//            DropTable(name: "dbo.IdentityUserClaims");
//            DropTable(name: "dbo.IdentityUserLogins");
//            DropTable(name: "dbo.IdentityUserRoles");
//            DropTable(name: "dbo.IdentityRoles");
//            DropForeignKey("dbo.UserPrecincts", "UserId", "dbo.Users");            
//            DropTable(name: "dbo.Users");

//            CreateTable(
//                "dbo.AspNetRoles",
//                c => new
//                {
//                    Id = c.String(nullable: false, maxLength: 128),
//                    Name = c.String(nullable: false, maxLength: 256),
//                })
//                .PrimaryKey(t => t.Id)
//                .Index(t => t.Name, unique: true, name: "RoleNameIndex");

//            CreateTable(
//                "dbo.AspNetUserRoles",
//                c => new
//                {
//                    UserId = c.String(nullable: false, maxLength: 128),
//                    RoleId = c.String(nullable: false, maxLength: 128),
//                })
//                .PrimaryKey(t => new { t.UserId, t.RoleId })
//                .ForeignKey("dbo.AspNetRoles", t => t.RoleId, cascadeDelete: true)
//                .ForeignKey("dbo.AspNetUsers", t => t.UserId, cascadeDelete: true)
//                .Index(t => t.UserId)
//                .Index(t => t.RoleId);

//            CreateTable(
//                "dbo.AspNetUsers",
//                c => new
//                {
//                    Id = c.String(nullable: false, maxLength: 128),
//                    Hometown = c.String(),
//                    Email = c.String(maxLength: 256),
//                    EmailConfirmed = c.Boolean(nullable: false),
//                    PasswordHash = c.String(),
//                    SecurityStamp = c.String(),
//                    PhoneNumber = c.String(),
//                    PhoneNumberConfirmed = c.Boolean(nullable: false),
//                    TwoFactorEnabled = c.Boolean(nullable: false),
//                    LockoutEndDateUtc = c.DateTime(),
//                    LockoutEnabled = c.Boolean(nullable: false),
//                    AccessFailedCount = c.Int(nullable: false),
//                    UserName = c.String(nullable: false, maxLength: 256),
//                })
//                .PrimaryKey(t => t.Id)
//                .Index(t => t.UserName, unique: true, name: "UserNameIndex");

//            CreateTable(
//                "dbo.AspNetUserClaims",
//                c => new
//                {
//                    Id = c.Int(nullable: false, identity: true),
//                    UserId = c.String(nullable: false, maxLength: 128),
//                    ClaimType = c.String(),
//                    ClaimValue = c.String(),
//                })
//                .PrimaryKey(t => t.Id)
//                .ForeignKey("dbo.AspNetUsers", t => t.UserId, cascadeDelete: true)
//                .Index(t => t.UserId);

//            CreateTable(
//                "dbo.AspNetUserLogins",
//                c => new
//                {
//                    LoginProvider = c.String(nullable: false, maxLength: 128),
//                    ProviderKey = c.String(nullable: false, maxLength: 128),
//                    UserId = c.String(nullable: false, maxLength: 128),
//                })
//                .PrimaryKey(t => new { t.LoginProvider, t.ProviderKey, t.UserId })
//                .ForeignKey("dbo.AspNetUsers", t => t.UserId, cascadeDelete: true)
//                .Index(t => t.UserId);
                        
            
//            //AddForeignKey("dbo.UserPrecincts", "UserId", "dbo.AspNetUsers", "Id", cascadeDelete: true);
                        
//        }

//        public override void Down()
//        {
//            DropForeignKey("dbo.AspNetUserLogins", "UserId", "dbo.AspNetUsers");
//            DropForeignKey("dbo.AspNetUserClaims", "UserId", "dbo.AspNetUsers");
//            DropForeignKey("dbo.AspNetUserRoles", "RoleId", "dbo.AspNetRoles");
//            DropIndex("dbo.AspNetUsers", "UserNameIndex");
//            DropIndex("dbo.AspNetUserRoles", new[] { "RoleId" });
//            DropIndex("dbo.AspNetRoles", "RoleNameIndex");
//            DropIndex("dbo.AspNetUserLogins", new[] { "UserId" });
//            DropIndex("dbo.AspNetUserClaims", new[] { "UserId" });
//            DropPrimaryKey("dbo.AspNetUserRoles");
//            DropPrimaryKey("dbo.AspNetUserLogins");
//            AlterColumn("dbo.AspNetUsers", "UserName", c => c.String());
//            AlterColumn("dbo.AspNetUsers", "Email", c => c.String());
//            AlterColumn("dbo.AspNetUserRoles", "RoleId", c => c.String(maxLength: 128));
//            AlterColumn("dbo.AspNetRoles", "Name", c => c.String());
//            AlterColumn("dbo.AspNetUserLogins", "UserId", c => c.String(maxLength: 128));
//            AlterColumn("dbo.AspNetUserLogins", "ProviderKey", c => c.String());
//            AlterColumn("dbo.AspNetUserLogins", "LoginProvider", c => c.String());
//            AlterColumn("dbo.AspNetUserClaims", "UserId", c => c.String(maxLength: 128));
//            AddPrimaryKey("dbo.AspNetUserRoles", new[] { "RoleId", "UserId" });
//            AddPrimaryKey("dbo.AspNetUserLogins", "UserId");
//            RenameColumn(table: "dbo.AspNetUserLogins", name: "UserId", newName: "User_Id");
//            RenameColumn(table: "dbo.AspNetUserRoles", name: "RoleId", newName: "IdentityRole_Id");
//            AddColumn("dbo.AspNetUserRoles", "RoleId", c => c.String(nullable: false, maxLength: 128));
//            AddColumn("dbo.AspNetUserLogins", "UserId", c => c.String(nullable: false, maxLength: 128));
//            CreateIndex("dbo.AspNetUserRoles", "IdentityRole_Id");
//            CreateIndex("dbo.AspNetUserLogins", "User_Id");
//            CreateIndex("dbo.AspNetUserClaims", "UserId");
//            AddForeignKey("dbo.IdentityUserLogins", "User_Id", "dbo.Users", "Id");
//            AddForeignKey("dbo.IdentityUserClaims", "UserId", "dbo.Users", "Id");
//            AddForeignKey("dbo.IdentityUserRoles", "IdentityRole_Id", "dbo.IdentityRoles", "Id");
//            RenameTable(name: "dbo.AspNetUsers", newName: "Users");
//            RenameTable(name: "dbo.AspNetUserRoles", newName: "IdentityUserRoles");
//            RenameTable(name: "dbo.AspNetRoles", newName: "IdentityRoles");
//            RenameTable(name: "dbo.AspNetUserLogins", newName: "IdentityUserLogins");
//            RenameTable(name: "dbo.AspNetUserClaims", newName: "IdentityUserClaims");
//        }
//    }
//}
