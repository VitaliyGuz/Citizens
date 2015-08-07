namespace Citizens.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class _10 : DbMigration
    {
        public override void Up()
        {
            DropForeignKey("dbo.PersonChangeHistory", "StreetId", "dbo.Streets");
            DropForeignKey("dbo.People", "StreetId", "dbo.Streets");
            DropIndex("dbo.PersonChangeHistory", new[] { "CityId", "StreetId", "House" });
            DropIndex("dbo.PersonChangeHistory", new[] { "StreetId" });
            DropIndex("dbo.People", new[] { "CityId", "StreetId", "House" });
            AlterColumn("dbo.PersonChangeHistory", "StreetId", c => c.Int(nullable: false));
            AlterColumn("dbo.People", "StreetId", c => c.Int(nullable: false));
            CreateIndex("dbo.PersonChangeHistory", new[] { "CityId", "StreetId", "House" });
            CreateIndex("dbo.PersonChangeHistory", "StreetId");
            CreateIndex("dbo.People", new[] { "CityId", "StreetId", "House" });
            AddForeignKey("dbo.PersonChangeHistory", "StreetId", "dbo.Streets", "Id", cascadeDelete: false);
            AddForeignKey("dbo.People", "StreetId", "dbo.Streets", "Id", cascadeDelete: false);
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.People", "StreetId", "dbo.Streets");
            DropForeignKey("dbo.PersonChangeHistory", "StreetId", "dbo.Streets");
            DropIndex("dbo.People", new[] { "CityId", "StreetId", "House" });
            DropIndex("dbo.PersonChangeHistory", new[] { "StreetId" });
            DropIndex("dbo.PersonChangeHistory", new[] { "CityId", "StreetId", "House" });
            AlterColumn("dbo.People", "StreetId", c => c.Int());
            AlterColumn("dbo.PersonChangeHistory", "StreetId", c => c.Int());
            CreateIndex("dbo.People", new[] { "CityId", "StreetId", "House" });
            CreateIndex("dbo.PersonChangeHistory", "StreetId");
            CreateIndex("dbo.PersonChangeHistory", new[] { "CityId", "StreetId", "House" });
            AddForeignKey("dbo.People", "StreetId", "dbo.Streets", "Id");
            AddForeignKey("dbo.PersonChangeHistory", "StreetId", "dbo.Streets", "Id");
        }
    }
}
