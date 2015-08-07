namespace Citizens.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class _12 : DbMigration
    {
        public override void Up()
        {
            DropForeignKey("dbo.Cities", "RegionPartId", "dbo.RegionParts");
            DropIndex("dbo.Cities", new[] { "RegionPartId" });
            AlterColumn("dbo.Cities", "RegionPartId", c => c.Int(nullable: false));
            CreateIndex("dbo.Cities", "RegionPartId");
            AddForeignKey("dbo.Cities", "RegionPartId", "dbo.RegionParts", "Id", cascadeDelete: false);
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.Cities", "RegionPartId", "dbo.RegionParts");
            DropIndex("dbo.Cities", new[] { "RegionPartId" });
            AlterColumn("dbo.Cities", "RegionPartId", c => c.Int());
            CreateIndex("dbo.Cities", "RegionPartId");
            AddForeignKey("dbo.Cities", "RegionPartId", "dbo.RegionParts", "Id");
        }
    }
}
