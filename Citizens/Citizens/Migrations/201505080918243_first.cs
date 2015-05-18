//namespace Citizens.Migrations
//{
//    using System;
//    using System.Data.Entity.Migrations;
    
//    public partial class first : DbMigration
//    {
//        public override void Up()
//        {
//            CreateTable(
//                "dbo.Cities",
//                c => new
//                {
//                    Id = c.Int(nullable: false, identity: true),
//                    Name = c.String(nullable: false, maxLength: 50),
//                    CityTypeId = c.Int(nullable: false),
//                    IncludedToRegionPart = c.Boolean(nullable: false),
//                })
//                .PrimaryKey(t => t.Id)
//                .ForeignKey("dbo.CityTypes", t => t.CityTypeId, cascadeDelete: true)
//                .Index(t => t.CityTypeId);

//            CreateTable(
//                "dbo.CityTypes",
//                c => new
//                {
//                    Id = c.Int(nullable: false, identity: true),
//                    Name = c.String(nullable: false, maxLength: 50),
//                })
//                .PrimaryKey(t => t.Id);

//            CreateTable(
//                "dbo.People",
//                c => new
//                {
//                    CityId = c.Int(nullable: false),
//                    StreetId = c.Int(),
//                    House = c.String(maxLength: 10),
//                    Id = c.Int(nullable: false, identity: true),
//                    FirstName = c.String(maxLength: 20),
//                    MidleName = c.String(maxLength: 20),
//                    LastName = c.String(maxLength: 20),
//                    DateOfBirth = c.DateTime(),
//                    Gender = c.Int(),
//                    Apartment = c.Int(),
//                })
//                .PrimaryKey(t => t.Id)
//                .ForeignKey("dbo.Cities", t => t.CityId, cascadeDelete: true)
//                .ForeignKey("dbo.PrecinctAddresses", t => new { t.CityId, t.StreetId, t.House })
//                .ForeignKey("dbo.Streets", t => t.StreetId)
//                .Index(t => t.CityId)
//                .Index(t => new { t.CityId, t.StreetId, t.House });

//            CreateTable(
//                "dbo.PrecinctAddresses",
//                c => new
//                {
//                    CityId = c.Int(nullable: false),
//                    StreetId = c.Int(nullable: false),
//                    House = c.String(nullable: false, maxLength: 10),
//                    PrecinctId = c.Int(nullable: false),
//                })
//                .PrimaryKey(t => new { t.CityId, t.StreetId, t.House })
//                .ForeignKey("dbo.Cities", t => t.CityId, cascadeDelete: true)
//                .ForeignKey("dbo.Precincts", t => t.PrecinctId, cascadeDelete: true)
//                .ForeignKey("dbo.Streets", t => t.StreetId, cascadeDelete: true)
//                .Index(t => t.CityId)
//                .Index(t => t.StreetId)
//                .Index(t => t.PrecinctId);

//            CreateTable(
//                "dbo.Precincts",
//                c => new
//                {
//                    Id = c.Int(nullable: false),
//                    CityId = c.Int(),
//                    StreetId = c.Int(),
//                    House = c.String(maxLength: 10),
//                    DistrictId = c.Int(nullable: false),
//                })
//                .PrimaryKey(t => t.Id)
//                .ForeignKey("dbo.Cities", t => t.CityId)
//                .ForeignKey("dbo.Districts", t => t.DistrictId, cascadeDelete: true)
//                .ForeignKey("dbo.Streets", t => t.StreetId)
//                .Index(t => t.CityId)
//                .Index(t => t.StreetId)
//                .Index(t => t.DistrictId);

//            CreateTable(
//                "dbo.Districts",
//                c => new
//                {
//                    Id = c.Int(nullable: false),
//                })
//                .PrimaryKey(t => t.Id);

//            CreateTable(
//                "dbo.Streets",
//                c => new
//                {
//                    Id = c.Int(nullable: false, identity: true),
//                    Name = c.String(nullable: false, maxLength: 50),
//                    StreetTypeId = c.Int(nullable: false),
//                })
//                .PrimaryKey(t => t.Id)
//                .ForeignKey("dbo.StreetTypes", t => t.StreetTypeId, cascadeDelete: true)
//                .Index(t => t.StreetTypeId);

//            CreateTable(
//                "dbo.StreetTypes",
//                c => new
//                {
//                    Id = c.Int(nullable: false, identity: true),
//                    Name = c.String(nullable: false, maxLength: 50),
//                })
//                .PrimaryKey(t => t.Id);

//            CreateTable(
//                "dbo.CityRegionParts",
//                c => new
//                {
//                    CityId = c.Int(nullable: false),
//                    RegionPartId = c.Int(nullable: false),
//                })
//                .PrimaryKey(t => new { t.CityId, t.RegionPartId })
//                .ForeignKey("dbo.Cities", t => t.CityId, cascadeDelete: true)
//                .ForeignKey("dbo.RegionParts", t => t.RegionPartId, cascadeDelete: true)
//                .Index(t => t.CityId)
//                .Index(t => t.RegionPartId);

//            CreateTable(
//                "dbo.RegionParts",
//                c => new
//                {
//                    Id = c.Int(nullable: false, identity: true),
//                    Name = c.String(nullable: false, maxLength: 50),
//                    RegionId = c.Int(nullable: false),
//                    RegionPartType = c.Int(nullable: false),
//                })
//                .PrimaryKey(t => t.Id)
//                .ForeignKey("dbo.Regions", t => t.RegionId, cascadeDelete: true)
//                .Index(t => t.RegionId);

//            CreateTable(
//                "dbo.Regions",
//                c => new
//                {
//                    Id = c.Int(nullable: false, identity: true),
//                    Name = c.String(nullable: false, maxLength: 50),
//                })
//                .PrimaryKey(t => t.Id);

//            CreateTable(
//                "dbo.IdentityUserClaims",
//                c => new
//                {
//                    Id = c.Int(nullable: false, identity: true),
//                    UserId = c.String(maxLength: 128),
//                    ClaimType = c.String(),
//                    ClaimValue = c.String(),
//                })
//                .PrimaryKey(t => t.Id)
//                .ForeignKey("dbo.Users", t => t.UserId)
//                .Index(t => t.UserId);

//            CreateTable(
//                "dbo.IdentityUserLogins",
//                c => new
//                {
//                    UserId = c.String(nullable: false, maxLength: 128),
//                    LoginProvider = c.String(),
//                    ProviderKey = c.String(),
//                    User_Id = c.String(maxLength: 128),
//                })
//                .PrimaryKey(t => t.UserId)
//                .ForeignKey("dbo.Users", t => t.User_Id)
//                .Index(t => t.User_Id);

//            CreateTable(
//                "dbo.OrderLines",
//                c => new
//                {
//                    Id = c.Int(nullable: false, identity: true),
//                    Count = c.Int(nullable: false),
//                    ProductId = c.Int(nullable: false),
//                    OrderId = c.Int(nullable: false),
//                })
//                .PrimaryKey(t => t.Id)
//                .ForeignKey("dbo.Orders", t => t.OrderId, cascadeDelete: true)
//                .ForeignKey("dbo.Products", t => t.ProductId, cascadeDelete: true)
//                .Index(t => t.ProductId)
//                .Index(t => t.OrderId);

//            CreateTable(
//                "dbo.Orders",
//                c => new
//                {
//                    Id = c.Int(nullable: false, identity: true),
//                    Customer = c.String(nullable: false),
//                    TotalCost = c.Decimal(nullable: false, precision: 18, scale: 2),
//                })
//                .PrimaryKey(t => t.Id);

//            CreateTable(
//                "dbo.Products",
//                c => new
//                {
//                    Id = c.Int(nullable: false, identity: true),
//                    Name = c.String(nullable: false),
//                    Description = c.String(nullable: false),
//                    Price = c.Decimal(nullable: false, precision: 18, scale: 2),
//                    Category = c.String(nullable: false),
//                })
//                .PrimaryKey(t => t.Id);

//            CreateTable(
//                "dbo.IdentityRoles",
//                c => new
//                {
//                    Id = c.String(nullable: false, maxLength: 128),
//                    Name = c.String(),
//                    Discriminator = c.String(nullable: false, maxLength: 128),
//                })
//                .PrimaryKey(t => t.Id);

//            CreateTable(
//                "dbo.IdentityUserRoles",
//                c => new
//                {
//                    RoleId = c.String(nullable: false, maxLength: 128),
//                    UserId = c.String(nullable: false, maxLength: 128),
//                    Discriminator = c.String(nullable: false, maxLength: 128),
//                    IdentityRole_Id = c.String(maxLength: 128),
//                })
//                .PrimaryKey(t => new { t.RoleId, t.UserId })
//                .ForeignKey("dbo.IdentityRoles", t => t.IdentityRole_Id)
//                .ForeignKey("dbo.Users", t => t.UserId, cascadeDelete: true)
//                .Index(t => t.UserId)
//                .Index(t => t.IdentityRole_Id);

//            CreateTable(
//                "dbo.UserPrecincts",
//                c => new
//                {
//                    UserId = c.String(nullable: false, maxLength: 128),
//                    PrecinctId = c.Int(nullable: false),
//                })
//                .PrimaryKey(t => new { t.UserId, t.PrecinctId })
//                .ForeignKey("dbo.Precincts", t => t.PrecinctId, cascadeDelete: true)
//                .ForeignKey("dbo.Users", t => t.UserId, cascadeDelete: true)
//                .Index(t => t.UserId)
//                .Index(t => t.PrecinctId);

//            CreateTable(
//                "dbo.Users",
//                c => new
//                {
//                    Id = c.String(nullable: false, maxLength: 128),
//                    Email = c.String(),
//                    EmailConfirmed = c.Boolean(nullable: false),
//                    PasswordHash = c.String(),
//                    SecurityStamp = c.String(),
//                    PhoneNumber = c.String(),
//                    PhoneNumberConfirmed = c.Boolean(nullable: false),
//                    TwoFactorEnabled = c.Boolean(nullable: false),
//                    LockoutEndDateUtc = c.DateTime(),
//                    LockoutEnabled = c.Boolean(nullable: false),
//                    AccessFailedCount = c.Int(nullable: false),
//                    UserName = c.String(),
//                })
//                .PrimaryKey(t => t.Id);

//        }
        
//        public override void Down()
//        {
//            DropForeignKey("dbo.UserPrecincts", "UserId", "dbo.Users");
//            DropForeignKey("dbo.IdentityUserRoles", "UserId", "dbo.Users");
//            DropForeignKey("dbo.IdentityUserLogins", "User_Id", "dbo.Users");
//            DropForeignKey("dbo.IdentityUserClaims", "UserId", "dbo.Users");
//            DropForeignKey("dbo.UserPrecincts", "PrecinctId", "dbo.Precincts");
//            DropForeignKey("dbo.IdentityUserRoles", "IdentityRole_Id", "dbo.IdentityRoles");
//            DropForeignKey("dbo.OrderLines", "ProductId", "dbo.Products");
//            DropForeignKey("dbo.OrderLines", "OrderId", "dbo.Orders");
//            DropForeignKey("dbo.CityRegionParts", "RegionPartId", "dbo.RegionParts");
//            DropForeignKey("dbo.RegionParts", "RegionId", "dbo.Regions");
//            DropForeignKey("dbo.CityRegionParts", "CityId", "dbo.Cities");
//            DropForeignKey("dbo.People", "StreetId", "dbo.Streets");
//            DropForeignKey("dbo.People", new[] { "CityId", "StreetId", "House" }, "dbo.PrecinctAddresses");
//            DropForeignKey("dbo.PrecinctAddresses", "StreetId", "dbo.Streets");
//            DropForeignKey("dbo.Precincts", "StreetId", "dbo.Streets");
//            DropForeignKey("dbo.Streets", "StreetTypeId", "dbo.StreetTypes");
//            DropForeignKey("dbo.PrecinctAddresses", "PrecinctId", "dbo.Precincts");
//            DropForeignKey("dbo.Precincts", "DistrictId", "dbo.Districts");
//            DropForeignKey("dbo.Precincts", "CityId", "dbo.Cities");
//            DropForeignKey("dbo.PrecinctAddresses", "CityId", "dbo.Cities");
//            DropForeignKey("dbo.People", "CityId", "dbo.Cities");
//            DropForeignKey("dbo.Cities", "CityTypeId", "dbo.CityTypes");
//            DropIndex("dbo.UserPrecincts", new[] { "PrecinctId" });
//            DropIndex("dbo.UserPrecincts", new[] { "UserId" });
//            DropIndex("dbo.IdentityUserRoles", new[] { "IdentityRole_Id" });
//            DropIndex("dbo.IdentityUserRoles", new[] { "UserId" });
//            DropIndex("dbo.OrderLines", new[] { "OrderId" });
//            DropIndex("dbo.OrderLines", new[] { "ProductId" });
//            DropIndex("dbo.IdentityUserLogins", new[] { "User_Id" });
//            DropIndex("dbo.IdentityUserClaims", new[] { "UserId" });
//            DropIndex("dbo.RegionParts", new[] { "RegionId" });
//            DropIndex("dbo.CityRegionParts", new[] { "RegionPartId" });
//            DropIndex("dbo.CityRegionParts", new[] { "CityId" });
//            DropIndex("dbo.Streets", new[] { "StreetTypeId" });
//            DropIndex("dbo.Precincts", new[] { "DistrictId" });
//            DropIndex("dbo.Precincts", new[] { "StreetId" });
//            DropIndex("dbo.Precincts", new[] { "CityId" });
//            DropIndex("dbo.PrecinctAddresses", new[] { "PrecinctId" });
//            DropIndex("dbo.PrecinctAddresses", new[] { "StreetId" });
//            DropIndex("dbo.PrecinctAddresses", new[] { "CityId" });
//            DropIndex("dbo.People", new[] { "CityId", "StreetId", "House" });
//            DropIndex("dbo.People", new[] { "CityId" });
//            DropIndex("dbo.Cities", new[] { "CityTypeId" });
//            DropTable("dbo.Users");
//            DropTable("dbo.UserPrecincts");
//            DropTable("dbo.IdentityUserRoles");
//            DropTable("dbo.IdentityRoles");
//            DropTable("dbo.Products");
//            DropTable("dbo.Orders");
//            DropTable("dbo.OrderLines");
//            DropTable("dbo.IdentityUserLogins");
//            DropTable("dbo.IdentityUserClaims");
//            DropTable("dbo.Regions");
//            DropTable("dbo.RegionParts");
//            DropTable("dbo.CityRegionParts");
//            DropTable("dbo.StreetTypes");
//            DropTable("dbo.Streets");
//            DropTable("dbo.Districts");
//            DropTable("dbo.Precincts");
//            DropTable("dbo.PrecinctAddresses");
//            DropTable("dbo.People");
//            DropTable("dbo.CityTypes");
//            DropTable("dbo.Cities");
//        }
//    }
//}
