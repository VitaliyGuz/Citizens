namespace Citizens.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class _13 : DbMigration
    {
        public override void Up()
        {
            DropForeignKey("dbo.PersonChangeHistory", new[] { "CityId", "StreetId", "House" }, "dbo.PrecinctAddresses");
            DropForeignKey("dbo.People", new[] { "CityId", "StreetId", "House" }, "dbo.PrecinctAddresses");
            DropIndex("dbo.PersonChangeHistory", new[] { "CityId", "StreetId", "House" });
            DropIndex("dbo.PersonChangeHistory", new[] { "House" });
            DropIndex("dbo.People", new[] { "CityId", "StreetId", "House" });
            DropIndex("dbo.People", new[] { "House" });
            AlterColumn("dbo.PersonChangeHistory", "House", c => c.String(nullable: false, maxLength: 10));
            AlterColumn("dbo.People", "House", c => c.String(nullable: false, maxLength: 10));
            CreateIndex("dbo.PersonChangeHistory", new[] { "CityId", "StreetId", "House" });
            CreateIndex("dbo.PersonChangeHistory", "House");
            CreateIndex("dbo.People", new[] { "CityId", "StreetId", "House" });
            CreateIndex("dbo.People", "House");
            AddForeignKey("dbo.PersonChangeHistory", new[] { "CityId", "StreetId", "House" }, "dbo.PrecinctAddresses", new[] { "CityId", "StreetId", "House" }, cascadeDelete: false);
            AddForeignKey("dbo.People", new[] { "CityId", "StreetId", "House" }, "dbo.PrecinctAddresses", new[] { "CityId", "StreetId", "House" }, cascadeDelete: false);
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.People", new[] { "CityId", "StreetId", "House" }, "dbo.PrecinctAddresses");
            DropForeignKey("dbo.PersonChangeHistory", new[] { "CityId", "StreetId", "House" }, "dbo.PrecinctAddresses");
            DropIndex("dbo.People", new[] { "House" });
            DropIndex("dbo.People", new[] { "CityId", "StreetId", "House" });
            DropIndex("dbo.PersonChangeHistory", new[] { "House" });
            DropIndex("dbo.PersonChangeHistory", new[] { "CityId", "StreetId", "House" });
            AlterColumn("dbo.People", "House", c => c.String(maxLength: 10));
            AlterColumn("dbo.PersonChangeHistory", "House", c => c.String(maxLength: 10));
            CreateIndex("dbo.People", "House");
            CreateIndex("dbo.People", new[] { "CityId", "StreetId", "House" });
            CreateIndex("dbo.PersonChangeHistory", "House");
            CreateIndex("dbo.PersonChangeHistory", new[] { "CityId", "StreetId", "House" });
            AddForeignKey("dbo.People", new[] { "CityId", "StreetId", "House" }, "dbo.PrecinctAddresses", new[] { "CityId", "StreetId", "House" });
            AddForeignKey("dbo.PersonChangeHistory", new[] { "CityId", "StreetId", "House" }, "dbo.PrecinctAddresses", new[] { "CityId", "StreetId", "House" });
        }
    }
}
