namespace Citizens.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class _5 : DbMigration
    {
        public override void Up()
        {
            //DropForeignKey("dbo.Precincts", "DistrictId", "dbo.Districts");
            //DropIndex("dbo.Precincts", new[] { "DistrictId" });
            //DropColumn("dbo.Precincts", "DistrictId");
        }
        
        public override void Down()
        {
            AddColumn("dbo.Precincts", "DistrictId", c => c.Int(nullable: false));
            CreateIndex("dbo.Precincts", "DistrictId");
            AddForeignKey("dbo.Precincts", "DistrictId", "dbo.Districts", "Id", cascadeDelete: true);
        }
    }
}
