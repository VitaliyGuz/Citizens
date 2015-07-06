namespace Citizens.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class _2 : DbMigration
    {
        public override void Up()
        {
            DropForeignKey("dbo.DistrictPrecincts", "DistrictId", "dbo.Districts");
            DropForeignKey("dbo.DistrictPrecincts", "PrecinctId", "dbo.Precincts");
            DropForeignKey("dbo.Precincts", "DistrictId", "dbo.Districts");
            DropForeignKey("dbo.UserPrecincts", "PrecinctId", "dbo.Precincts");
            DropForeignKey("dbo.PrecinctAddresses", "PrecinctId", "dbo.Precincts");
            DropIndex("dbo.Precincts", new[] { "DistrictId" });
            DropIndex("dbo.DistrictPrecincts", new[] { "DistrictId" });
            DropIndex("dbo.DistrictPrecincts", new[] { "PrecinctId" });
            DropIndex("dbo.PrecinctAddresses", new[] { "PrecinctId" });
            DropIndex("dbo.PersonChangeHistory", new[] { "StreetId" });
            DropIndex("dbo.UserPrecincts", new[] { "PrecinctId" });

            CreateTable(
               "dbo.New_Precincts",
               c => new
               {
                   Id = c.Int(nullable: false, identity: true),
                   Number = c.Int(nullable: false),
                   CityId = c.Int(),
                   StreetId = c.Int(),
                   House = c.String(maxLength: 10),                   
                   RegionPartId = c.Int(),
                   lat = c.Double(),
                   lng = c.Double(),
                   location_type = c.String(),
               })
               .PrimaryKey(t => t.Id);
            Sql("INSERT INTO [dbo].[New_Precincts] ([Number],[CityId],[StreetId],[House],[RegionPartId],[lat],[lng],[location_type]) SELECT [Id],[CityId],[StreetId],[House],[RegionPartId],[lat],[lng],[location_type] FROM [dbo].[Precincts]");

            CreateTable(
                "dbo.New_Districts",
                c => new
                {
                    Id = c.Int(nullable: false, identity: true),
                    Number = c.Int(nullable: false),
                    DistrictTypeId = c.Int(nullable: true)
                })
                .PrimaryKey(t => t.Id);
                
            Sql("INSERT INTO [dbo].[New_Districts] ([Number],[DistrictTypeId]) SELECT [Id],[DistrictTypeId] FROM [dbo].[Districts]");

            DropTable("dbo.Precincts");
            DropTable("dbo.Districts");

        }
        
        public override void Down()
        {

        }
    }
}
