namespace Citizens.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class _17 : DbMigration
    {
        public override void Up()
        {
            DropForeignKey("dbo.People", new[] { "CityId", "StreetId", "House" }, "dbo.PrecinctAddresses");
            DropForeignKey("dbo.PersonChangeHistory", new[] { "CityId", "StreetId", "House" }, "dbo.PrecinctAddresses");
            DropIndex("dbo.PersonChangeHistory", new[] { "CityId", "StreetId", "House" });
            DropIndex("dbo.PersonChangeHistory", new[] { "House" });
            DropIndex("dbo.People", new[] { "CityId", "StreetId", "House" });
            DropIndex("dbo.People", new[] { "House" });
            DropPrimaryKey("dbo.PrecinctAddresses");
            AlterColumn("dbo.PrecinctAddresses", "House", c => c.String(nullable: false, maxLength: 20));
            AlterColumn("dbo.PrecinctAddresses", "HouseLetter", c => c.String(maxLength: 5));
            AlterColumn("dbo.PrecinctAddresses", "HouseFraction", c => c.String(maxLength: 10));
            AlterColumn("dbo.PrecinctAddresses", "HouseBuilding", c => c.String(maxLength: 5));
            AlterColumn("dbo.PersonChangeHistory", "House", c => c.String(nullable: false, maxLength: 20));
            AlterColumn("dbo.People", "House", c => c.String(nullable: false, maxLength: 20));
            AddPrimaryKey("dbo.PrecinctAddresses", new[] { "CityId", "StreetId", "House" });
            CreateIndex("dbo.PersonChangeHistory", new[] { "CityId", "StreetId", "House" });
            CreateIndex("dbo.PersonChangeHistory", "House");
            CreateIndex("dbo.People", new[] { "CityId", "StreetId", "House" });
            CreateIndex("dbo.People", "House");
            AddForeignKey("dbo.People", new[] { "CityId", "StreetId", "House" }, "dbo.PrecinctAddresses", new[] { "CityId", "StreetId", "House" }, cascadeDelete: true);
            AddForeignKey("dbo.PersonChangeHistory", new[] { "CityId", "StreetId", "House" }, "dbo.PrecinctAddresses", new[] { "CityId", "StreetId", "House" }, cascadeDelete: true);
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.PersonChangeHistory", new[] { "CityId", "StreetId", "House" }, "dbo.PrecinctAddresses");
            DropForeignKey("dbo.People", new[] { "CityId", "StreetId", "House" }, "dbo.PrecinctAddresses");
            DropIndex("dbo.People", new[] { "House" });
            DropIndex("dbo.People", new[] { "CityId", "StreetId", "House" });
            DropIndex("dbo.PersonChangeHistory", new[] { "House" });
            DropIndex("dbo.PersonChangeHistory", new[] { "CityId", "StreetId", "House" });
            DropPrimaryKey("dbo.PrecinctAddresses");
            AlterColumn("dbo.People", "House", c => c.String(nullable: false, maxLength: 10));
            AlterColumn("dbo.PersonChangeHistory", "House", c => c.String(nullable: false, maxLength: 10));
            AlterColumn("dbo.PrecinctAddresses", "HouseBuilding", c => c.String());
            AlterColumn("dbo.PrecinctAddresses", "HouseFraction", c => c.String());
            AlterColumn("dbo.PrecinctAddresses", "HouseLetter", c => c.String());
            AlterColumn("dbo.PrecinctAddresses", "House", c => c.String(nullable: false, maxLength: 10));
            AddPrimaryKey("dbo.PrecinctAddresses", new[] { "CityId", "StreetId", "House" });
            CreateIndex("dbo.People", "House");
            CreateIndex("dbo.People", new[] { "CityId", "StreetId", "House" });
            CreateIndex("dbo.PersonChangeHistory", "House");
            CreateIndex("dbo.PersonChangeHistory", new[] { "CityId", "StreetId", "House" });
            AddForeignKey("dbo.PersonChangeHistory", new[] { "CityId", "StreetId", "House" }, "dbo.PrecinctAddresses", new[] { "CityId", "StreetId", "House" }, cascadeDelete: true);
            AddForeignKey("dbo.People", new[] { "CityId", "StreetId", "House" }, "dbo.PrecinctAddresses", new[] { "CityId", "StreetId", "House" }, cascadeDelete: true);
        }
    }
}
