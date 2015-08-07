namespace Citizens.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class _11 : DbMigration
    {
        public override void Up()
        {
            CreateIndex("dbo.PersonChangeHistory", "House");
            CreateIndex("dbo.People", "House");
        }
        
        public override void Down()
        {
            DropIndex("dbo.People", new[] { "House" });
            DropIndex("dbo.PersonChangeHistory", new[] { "House" });
        }
    }
}
