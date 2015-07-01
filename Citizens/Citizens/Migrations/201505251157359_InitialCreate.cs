namespace Citizens.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class InitialCreate : DbMigration
    {
        public override void Up()
        {
            //CreateTable(
            //    "dbo.Cities",
            //    c => new
            //        {
            //            Id = c.Int(nullable: false, identity: true),
            //            Name = c.String(nullable: false, maxLength: 50),
            //            CityTypeId = c.Int(nullable: false),
            //            IncludedToRegionPart = c.Boolean(nullable: false),
            //            RegionPartId = c.Int(),
            //        })
            //    .PrimaryKey(t => t.Id)
            //    .ForeignKey("dbo.RegionParts", t => t.RegionPartId)
            //    .ForeignKey("dbo.CityTypes", t => t.CityTypeId, cascadeDelete: true)
            //    .Index(t => t.CityTypeId)
            //    .Index(t => t.RegionPartId);
            
            //CreateTable(
            //    "dbo.CityRegionParts",
            //    c => new
            //        {
            //            CityId = c.Int(nullable: false),
            //            RegionPartId = c.Int(nullable: false),
            //        })
            //    .PrimaryKey(t => new { t.CityId, t.RegionPartId })
            //    .ForeignKey("dbo.Cities", t => t.CityId, cascadeDelete: true)
            //    .ForeignKey("dbo.RegionParts", t => t.RegionPartId, cascadeDelete: true)
            //    .Index(t => t.CityId)
            //    .Index(t => t.RegionPartId);
            
            //CreateTable(
            //    "dbo.RegionParts",
            //    c => new
            //        {
            //            Id = c.Int(nullable: false, identity: true),
            //            Name = c.String(nullable: false, maxLength: 50),
            //            RegionId = c.Int(nullable: false),
            //            RegionPartType = c.Int(nullable: false),
            //        })
            //    .PrimaryKey(t => t.Id)
            //    .ForeignKey("dbo.Regions", t => t.RegionId, cascadeDelete: true)
            //    .Index(t => t.RegionId);
            
            //CreateTable(
            //    "dbo.Regions",
            //    c => new
            //        {
            //            Id = c.Int(nullable: false, identity: true),
            //            Name = c.String(nullable: false, maxLength: 50),
            //        })
            //    .PrimaryKey(t => t.Id);
            
            //CreateTable(
            //    "dbo.CityTypes",
            //    c => new
            //        {
            //            Id = c.Int(nullable: false, identity: true),
            //            Name = c.String(nullable: false, maxLength: 50),
            //        })
            //    .PrimaryKey(t => t.Id);
            
            //CreateTable(
            //    "dbo.People",
            //    c => new
            //        {
            //            Id = c.Int(nullable: false, identity: true),
            //            CityId = c.Int(nullable: false),
            //            StreetId = c.Int(),
            //            House = c.String(maxLength: 10),
            //            FirstName = c.String(maxLength: 20),
            //            MidleName = c.String(maxLength: 20),
            //            LastName = c.String(maxLength: 20),
            //            DateOfBirth = c.DateTime(),
            //            Gender = c.Int(),
            //            Apartment = c.Int(),
            //        })
            //    .PrimaryKey(t => t.Id)
            //    .ForeignKey("dbo.Cities", t => t.CityId, cascadeDelete: true)
            //    .ForeignKey("dbo.PrecinctAddresses", t => new { t.CityId, t.StreetId, t.House })
            //    .ForeignKey("dbo.Streets", t => t.StreetId)
            //    .Index(t => t.CityId)
            //    .Index(t => new { t.CityId, t.StreetId, t.House });
            
            //CreateTable(
            //    "dbo.PersonAdditionalProperties",
            //    c => new
            //        {
            //            PersonId = c.Int(nullable: false),
            //            PropertyKeyId = c.Int(nullable: false),
            //            IntValue = c.Int(),
            //            StringValue = c.String(),
            //            DateTimeValue = c.DateTime(),
            //            PropertyValueId = c.Int(),
            //            PersonChangeHistory_Id = c.Int(),
            //            PersonChangeHistory_ChangeTime = c.DateTime(),
            //            PersonChangeHistory_UserId = c.String(maxLength: 128),
            //        })
            //    .PrimaryKey(t => new { t.PersonId, t.PropertyKeyId })
            //    .ForeignKey("dbo.People", t => t.PersonId, cascadeDelete: true)
            //    .ForeignKey("dbo.PropertyKeys", t => t.PropertyKeyId, cascadeDelete: true)
            //    .ForeignKey("dbo.PropertyValues", t => t.PropertyValueId)
            //    .ForeignKey("dbo.PersonChangeHistory", t => new { t.PersonChangeHistory_Id, t.PersonChangeHistory_ChangeTime, t.PersonChangeHistory_UserId })
            //    .Index(t => t.PersonId)
            //    .Index(t => t.PropertyKeyId)
            //    .Index(t => t.PropertyValueId)
            //    .Index(t => new { t.PersonChangeHistory_Id, t.PersonChangeHistory_ChangeTime, t.PersonChangeHistory_UserId });
            
            //CreateTable(
            //    "dbo.PropertyKeys",
            //    c => new
            //        {
            //            Id = c.Int(nullable: false, identity: true),
            //            Name = c.String(),
            //            PropertyType = c.Int(nullable: false),
            //        })
            //    .PrimaryKey(t => t.Id);
            
            //CreateTable(
            //    "dbo.PropertyValues",
            //    c => new
            //        {
            //            Id = c.Int(nullable: false, identity: true),
            //            PropertyKeyId = c.Int(nullable: false),
            //            Value = c.String(),
            //        })
            //    .PrimaryKey(t => t.Id)
            //    .ForeignKey("dbo.PropertyKeys", t => t.PropertyKeyId, cascadeDelete: true)
            //    .Index(t => t.PropertyKeyId);
            
            //CreateTable(
            //    "dbo.PrecinctAddresses",
            //    c => new
            //        {
            //            CityId = c.Int(nullable: false),
            //            StreetId = c.Int(nullable: false),
            //            House = c.String(nullable: false, maxLength: 10),
            //            PrecinctId = c.Int(nullable: false),
            //        })
            //    .PrimaryKey(t => new { t.CityId, t.StreetId, t.House })
            //    .ForeignKey("dbo.Cities", t => t.CityId, cascadeDelete: true)
            //    .ForeignKey("dbo.Precincts", t => t.PrecinctId, cascadeDelete: true)
            //    .ForeignKey("dbo.Streets", t => t.StreetId, cascadeDelete: true)
            //    .Index(t => t.CityId)
            //    .Index(t => t.StreetId)
            //    .Index(t => t.PrecinctId);
            
            //CreateTable(
            //    "dbo.Precincts",
            //    c => new
            //        {
            //            Id = c.Int(nullable: false),
            //            CityId = c.Int(),
            //            StreetId = c.Int(),
            //            House = c.String(maxLength: 10),
            //            DistrictId = c.Int(nullable: false),
            //            RegionPartId = c.Int(),
            //            lat = c.Double(),
            //            lng = c.Double(),
            //            location_type = c.String(),
            //        })
            //    .PrimaryKey(t => t.Id)
            //    .ForeignKey("dbo.Cities", t => t.CityId)
            //    .ForeignKey("dbo.Districts", t => t.DistrictId, cascadeDelete: true)
            //    .ForeignKey("dbo.RegionParts", t => t.RegionPartId)
            //    .ForeignKey("dbo.Streets", t => t.StreetId)
            //    .Index(t => t.CityId)
            //    .Index(t => t.StreetId)
            //    .Index(t => t.DistrictId)
            //    .Index(t => t.RegionPartId);
            
            //CreateTable(
            //    "dbo.Districts",
            //    c => new
            //        {
            //            Id = c.Int(nullable: false),
            //        })
            //    .PrimaryKey(t => t.Id);
            
            //CreateTable(
            //    "dbo.Streets",
            //    c => new
            //        {
            //            Id = c.Int(nullable: false, identity: true),
            //            Name = c.String(nullable: false, maxLength: 50),
            //            StreetTypeId = c.Int(nullable: false),
            //        })
            //    .PrimaryKey(t => t.Id)
            //    .ForeignKey("dbo.StreetTypes", t => t.StreetTypeId, cascadeDelete: true)
            //    .Index(t => t.StreetTypeId);
            
            //CreateTable(
            //    "dbo.StreetTypes",
            //    c => new
            //        {
            //            Id = c.Int(nullable: false, identity: true),
            //            Name = c.String(nullable: false, maxLength: 50),
            //        })
            //    .PrimaryKey(t => t.Id);
            
            //CreateTable(
            //    "dbo.AspNetUserClaims",
            //    c => new
            //        {
            //            Id = c.Int(nullable: false, identity: true),
            //            UserId = c.String(nullable: false, maxLength: 128),
            //            ClaimType = c.String(),
            //            ClaimValue = c.String(),
            //        })
            //    .PrimaryKey(t => t.Id)
            //    .ForeignKey("dbo.AspNetUsers", t => t.UserId, cascadeDelete: true)
            //    .Index(t => t.UserId);
            
            //CreateTable(
            //    "dbo.AspNetUserLogins",
            //    c => new
            //        {
            //            LoginProvider = c.String(nullable: false, maxLength: 128),
            //            ProviderKey = c.String(nullable: false, maxLength: 128),
            //            UserId = c.String(nullable: false, maxLength: 128),
            //        })
            //    .PrimaryKey(t => new { t.LoginProvider, t.ProviderKey, t.UserId })
            //    .ForeignKey("dbo.AspNetUsers", t => t.UserId, cascadeDelete: true)
            //    .Index(t => t.UserId);
            
            //CreateTable(
            //    "dbo.OrderLines",
            //    c => new
            //        {
            //            Id = c.Int(nullable: false, identity: true),
            //            Count = c.Int(nullable: false),
            //            ProductId = c.Int(nullable: false),
            //            OrderId = c.Int(nullable: false),
            //        })
            //    .PrimaryKey(t => t.Id)
            //    .ForeignKey("dbo.Orders", t => t.OrderId, cascadeDelete: true)
            //    .ForeignKey("dbo.Products", t => t.ProductId, cascadeDelete: true)
            //    .Index(t => t.ProductId)
            //    .Index(t => t.OrderId);
            
            //CreateTable(
            //    "dbo.Orders",
            //    c => new
            //        {
            //            Id = c.Int(nullable: false, identity: true),
            //            Customer = c.String(nullable: false),
            //            TotalCost = c.Decimal(nullable: false, precision: 18, scale: 2),
            //        })
            //    .PrimaryKey(t => t.Id);
            
            //CreateTable(
            //    "dbo.Products",
            //    c => new
            //        {
            //            Id = c.Int(nullable: false, identity: true),
            //            Name = c.String(nullable: false),
            //            Description = c.String(nullable: false),
            //            Price = c.Decimal(nullable: false, precision: 18, scale: 2),
            //            Category = c.String(nullable: false),
            //        })
            //    .PrimaryKey(t => t.Id);
            
            //CreateTable(
            //    "dbo.PersonChangeHistory",
            //    c => new
            //        {
            //            Id = c.Int(nullable: false),
            //            ChangeTime = c.DateTime(nullable: false),
            //            UserId = c.String(nullable: false, maxLength: 128),
            //            CityId = c.Int(nullable: false),
            //            StreetId = c.Int(),
            //            House = c.String(maxLength: 10),
            //            FirstName = c.String(maxLength: 20),
            //            MidleName = c.String(maxLength: 20),
            //            LastName = c.String(maxLength: 20),
            //            DateOfBirth = c.DateTime(),
            //            Gender = c.Int(),
            //            Apartment = c.Int(),
            //        })
            //    .PrimaryKey(t => new { t.Id, t.ChangeTime, t.UserId })
            //    .ForeignKey("dbo.Cities", t => t.CityId, cascadeDelete: true)
            //    .ForeignKey("dbo.PrecinctAddresses", t => new { t.CityId, t.StreetId, t.House })
            //    .ForeignKey("dbo.Streets", t => t.StreetId)
            //    .ForeignKey("dbo.AspNetUsers", t => t.UserId, cascadeDelete: true)
            //    .Index(t => t.UserId)
            //    .Index(t => t.CityId)
            //    .Index(t => new { t.CityId, t.StreetId, t.House });
            
            //CreateTable(
            //    "dbo.AspNetUsers",
            //    c => new
            //        {
            //            Id = c.String(nullable: false, maxLength: 128),
            //            FirstName = c.String(maxLength: 50),
            //            Email = c.String(maxLength: 256),
            //            EmailConfirmed = c.Boolean(nullable: false),
            //            PasswordHash = c.String(),
            //            SecurityStamp = c.String(),
            //            PhoneNumber = c.String(),
            //            PhoneNumberConfirmed = c.Boolean(nullable: false),
            //            TwoFactorEnabled = c.Boolean(nullable: false),
            //            LockoutEndDateUtc = c.DateTime(),
            //            LockoutEnabled = c.Boolean(nullable: false),
            //            AccessFailedCount = c.Int(nullable: false),
            //            UserName = c.String(nullable: false, maxLength: 256),
            //        })
            //    .PrimaryKey(t => t.Id)
            //    .Index(t => t.UserName, unique: true, name: "UserNameIndex");
            
            //CreateTable(
            //    "dbo.AspNetUserRoles",
            //    c => new
            //        {
            //            UserId = c.String(nullable: false, maxLength: 128),
            //            RoleId = c.String(nullable: false, maxLength: 128),
            //            Discriminator = c.String(nullable: false, maxLength: 128),
            //        })
            //    .PrimaryKey(t => new { t.UserId, t.RoleId })
            //    .ForeignKey("dbo.AspNetUsers", t => t.UserId, cascadeDelete: true)
            //    .ForeignKey("dbo.AspNetRoles", t => t.RoleId, cascadeDelete: true)
            //    .Index(t => t.UserId)
            //    .Index(t => t.RoleId);
            
            //CreateTable(
            //    "dbo.UserPrecincts",
            //    c => new
            //        {
            //            UserId = c.String(nullable: false, maxLength: 128),
            //            PrecinctId = c.Int(nullable: false),
            //        })
            //    .PrimaryKey(t => new { t.UserId, t.PrecinctId })
            //    .ForeignKey("dbo.Precincts", t => t.PrecinctId, cascadeDelete: true)
            //    .ForeignKey("dbo.AspNetUsers", t => t.UserId, cascadeDelete: true)
            //    .Index(t => t.UserId)
            //    .Index(t => t.PrecinctId);
            
            //CreateTable(
            //    "dbo.AspNetRoles",
            //    c => new
            //        {
            //            Id = c.String(nullable: false, maxLength: 128),
            //            Name = c.String(nullable: false, maxLength: 256),
            //            Discriminator = c.String(nullable: false, maxLength: 128),
            //        })
            //    .PrimaryKey(t => t.Id)
            //    .Index(t => t.Name, unique: true, name: "RoleNameIndex");
            
        }
        
        public override void Down()
        {
            //DropForeignKey("dbo.AspNetUserRoles", "RoleId", "dbo.AspNetRoles");
            //DropForeignKey("dbo.PersonChangeHistory", "UserId", "dbo.AspNetUsers");
            //DropForeignKey("dbo.UserPrecincts", "UserId", "dbo.AspNetUsers");
            //DropForeignKey("dbo.UserPrecincts", "PrecinctId", "dbo.Precincts");
            //DropForeignKey("dbo.AspNetUserRoles", "UserId", "dbo.AspNetUsers");
            //DropForeignKey("dbo.AspNetUserLogins", "UserId", "dbo.AspNetUsers");
            //DropForeignKey("dbo.AspNetUserClaims", "UserId", "dbo.AspNetUsers");
            //DropForeignKey("dbo.PersonChangeHistory", "StreetId", "dbo.Streets");
            //DropForeignKey("dbo.PersonChangeHistory", new[] { "CityId", "StreetId", "House" }, "dbo.PrecinctAddresses");
            //DropForeignKey("dbo.PersonAdditionalProperties", new[] { "PersonChangeHistory_Id", "PersonChangeHistory_ChangeTime", "PersonChangeHistory_UserId" }, "dbo.PersonChangeHistory");
            //DropForeignKey("dbo.PersonChangeHistory", "CityId", "dbo.Cities");
            //DropForeignKey("dbo.OrderLines", "ProductId", "dbo.Products");
            //DropForeignKey("dbo.OrderLines", "OrderId", "dbo.Orders");
            //DropForeignKey("dbo.People", "StreetId", "dbo.Streets");
            //DropForeignKey("dbo.People", new[] { "CityId", "StreetId", "House" }, "dbo.PrecinctAddresses");
            //DropForeignKey("dbo.PrecinctAddresses", "StreetId", "dbo.Streets");
            //DropForeignKey("dbo.Precincts", "StreetId", "dbo.Streets");
            //DropForeignKey("dbo.Streets", "StreetTypeId", "dbo.StreetTypes");
            //DropForeignKey("dbo.Precincts", "RegionPartId", "dbo.RegionParts");
            //DropForeignKey("dbo.PrecinctAddresses", "PrecinctId", "dbo.Precincts");
            //DropForeignKey("dbo.Precincts", "DistrictId", "dbo.Districts");
            //DropForeignKey("dbo.Precincts", "CityId", "dbo.Cities");
            //DropForeignKey("dbo.PrecinctAddresses", "CityId", "dbo.Cities");
            //DropForeignKey("dbo.PropertyValues", "PropertyKeyId", "dbo.PropertyKeys");
            //DropForeignKey("dbo.PersonAdditionalProperties", "PropertyValueId", "dbo.PropertyValues");
            //DropForeignKey("dbo.PersonAdditionalProperties", "PropertyKeyId", "dbo.PropertyKeys");
            //DropForeignKey("dbo.PersonAdditionalProperties", "PersonId", "dbo.People");
            //DropForeignKey("dbo.People", "CityId", "dbo.Cities");
            //DropForeignKey("dbo.Cities", "CityTypeId", "dbo.CityTypes");
            //DropForeignKey("dbo.CityRegionParts", "RegionPartId", "dbo.RegionParts");
            //DropForeignKey("dbo.RegionParts", "RegionId", "dbo.Regions");
            //DropForeignKey("dbo.Cities", "RegionPartId", "dbo.RegionParts");
            //DropForeignKey("dbo.CityRegionParts", "CityId", "dbo.Cities");
            //DropIndex("dbo.AspNetRoles", "RoleNameIndex");
            //DropIndex("dbo.UserPrecincts", new[] { "PrecinctId" });
            //DropIndex("dbo.UserPrecincts", new[] { "UserId" });
            //DropIndex("dbo.AspNetUserRoles", new[] { "RoleId" });
            //DropIndex("dbo.AspNetUserRoles", new[] { "UserId" });
            //DropIndex("dbo.AspNetUsers", "UserNameIndex");
            //DropIndex("dbo.PersonChangeHistory", new[] { "CityId", "StreetId", "House" });
            //DropIndex("dbo.PersonChangeHistory", new[] { "CityId" });
            //DropIndex("dbo.PersonChangeHistory", new[] { "UserId" });
            //DropIndex("dbo.OrderLines", new[] { "OrderId" });
            //DropIndex("dbo.OrderLines", new[] { "ProductId" });
            //DropIndex("dbo.AspNetUserLogins", new[] { "UserId" });
            //DropIndex("dbo.AspNetUserClaims", new[] { "UserId" });
            //DropIndex("dbo.Streets", new[] { "StreetTypeId" });
            //DropIndex("dbo.Precincts", new[] { "RegionPartId" });
            //DropIndex("dbo.Precincts", new[] { "DistrictId" });
            //DropIndex("dbo.Precincts", new[] { "StreetId" });
            //DropIndex("dbo.Precincts", new[] { "CityId" });
            //DropIndex("dbo.PrecinctAddresses", new[] { "PrecinctId" });
            //DropIndex("dbo.PrecinctAddresses", new[] { "StreetId" });
            //DropIndex("dbo.PrecinctAddresses", new[] { "CityId" });
            //DropIndex("dbo.PropertyValues", new[] { "PropertyKeyId" });
            //DropIndex("dbo.PersonAdditionalProperties", new[] { "PersonChangeHistory_Id", "PersonChangeHistory_ChangeTime", "PersonChangeHistory_UserId" });
            //DropIndex("dbo.PersonAdditionalProperties", new[] { "PropertyValueId" });
            //DropIndex("dbo.PersonAdditionalProperties", new[] { "PropertyKeyId" });
            //DropIndex("dbo.PersonAdditionalProperties", new[] { "PersonId" });
            //DropIndex("dbo.People", new[] { "CityId", "StreetId", "House" });
            //DropIndex("dbo.People", new[] { "CityId" });
            //DropIndex("dbo.RegionParts", new[] { "RegionId" });
            //DropIndex("dbo.CityRegionParts", new[] { "RegionPartId" });
            //DropIndex("dbo.CityRegionParts", new[] { "CityId" });
            //DropIndex("dbo.Cities", new[] { "RegionPartId" });
            //DropIndex("dbo.Cities", new[] { "CityTypeId" });
            //DropTable("dbo.AspNetRoles");
            //DropTable("dbo.UserPrecincts");
            //DropTable("dbo.AspNetUserRoles");
            //DropTable("dbo.AspNetUsers");
            //DropTable("dbo.PersonChangeHistory");
            //DropTable("dbo.Products");
            //DropTable("dbo.Orders");
            //DropTable("dbo.OrderLines");
            //DropTable("dbo.AspNetUserLogins");
            //DropTable("dbo.AspNetUserClaims");
            //DropTable("dbo.StreetTypes");
            //DropTable("dbo.Streets");
            //DropTable("dbo.Districts");
            //DropTable("dbo.Precincts");
            //DropTable("dbo.PrecinctAddresses");
            //DropTable("dbo.PropertyValues");
            //DropTable("dbo.PropertyKeys");
            //DropTable("dbo.PersonAdditionalProperties");
            //DropTable("dbo.People");
            //DropTable("dbo.CityTypes");
            //DropTable("dbo.Regions");
            //DropTable("dbo.RegionParts");
            //DropTable("dbo.CityRegionParts");
            //DropTable("dbo.Cities");
        }
    }
}
