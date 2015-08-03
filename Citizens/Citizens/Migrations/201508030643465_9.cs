namespace Citizens.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class _9 : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.UserRegionParts",
                c => new
                    {
                        UserId = c.String(nullable: false, maxLength: 128),
                        RegionPartId = c.Int(nullable: false),
                    })
                .PrimaryKey(t => new { t.UserId, t.RegionPartId })
                .ForeignKey("dbo.RegionParts", t => t.RegionPartId, cascadeDelete: false)
                .ForeignKey("dbo.AspNetUsers", t => t.UserId, cascadeDelete: false)
                .Index(t => t.UserId)
                .Index(t => t.RegionPartId);
            
            CreateTable(
                "dbo.UserRegions",
                c => new
                    {
                        UserId = c.String(nullable: false, maxLength: 128),
                        RegionId = c.Int(nullable: false),
                    })
                .PrimaryKey(t => new { t.UserId, t.RegionId })
                .ForeignKey("dbo.Regions", t => t.RegionId, cascadeDelete: false)
                .ForeignKey("dbo.AspNetUsers", t => t.UserId, cascadeDelete: false)
                .Index(t => t.UserId)
                .Index(t => t.RegionId);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.UserRegions", "UserId", "dbo.AspNetUsers");
            DropForeignKey("dbo.UserRegions", "RegionId", "dbo.Regions");
            DropForeignKey("dbo.UserRegionParts", "UserId", "dbo.AspNetUsers");
            DropForeignKey("dbo.UserRegionParts", "RegionPartId", "dbo.RegionParts");
            DropIndex("dbo.UserRegions", new[] { "RegionId" });
            DropIndex("dbo.UserRegions", new[] { "UserId" });
            DropIndex("dbo.UserRegionParts", new[] { "RegionPartId" });
            DropIndex("dbo.UserRegionParts", new[] { "UserId" });
            DropTable("dbo.UserRegions");
            DropTable("dbo.UserRegionParts");
        }
    }
}
