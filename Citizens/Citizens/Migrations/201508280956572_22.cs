namespace Citizens.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class _22 : DbMigration
    {
        public override void Up()
        {
            DropIndex("dbo.PersonChangeHistory", new[] { "CityId" });
            DropIndex("dbo.PersonChangeHistory", new[] { "StreetId" });
            DropIndex("dbo.People", new[] { "CityId" });
            CreateIndex("dbo.PersonChangeHistory", "CityId");
            CreateIndex("dbo.PersonChangeHistory", "StreetId");
            CreateIndex("dbo.PersonChangeHistory", "FirstName");
            CreateIndex("dbo.PersonChangeHistory", "MidleName");
            CreateIndex("dbo.PersonChangeHistory", "LastName");
            CreateIndex("dbo.People", "CityId");
            CreateIndex("dbo.People", "StreetId");
            CreateIndex("dbo.People", "FirstName");
            CreateIndex("dbo.People", "MidleName");
            CreateIndex("dbo.People", "LastName");
        }
        
        public override void Down()
        {
            DropIndex("dbo.People", new[] { "LastName" });
            DropIndex("dbo.People", new[] { "MidleName" });
            DropIndex("dbo.People", new[] { "FirstName" });
            DropIndex("dbo.People", new[] { "StreetId" });
            DropIndex("dbo.People", new[] { "CityId" });
            DropIndex("dbo.PersonChangeHistory", new[] { "LastName" });
            DropIndex("dbo.PersonChangeHistory", new[] { "MidleName" });
            DropIndex("dbo.PersonChangeHistory", new[] { "FirstName" });
            DropIndex("dbo.PersonChangeHistory", new[] { "StreetId" });
            DropIndex("dbo.PersonChangeHistory", new[] { "CityId" });
            CreateIndex("dbo.People", "CityId");
            CreateIndex("dbo.PersonChangeHistory", "StreetId");
            CreateIndex("dbo.PersonChangeHistory", "CityId");
        }
    }
}
