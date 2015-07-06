namespace Citizens.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class _3 : DbMigration
    {
        public override void Up()
        {
            RenameTable(name: "dbo.New_Precincts", newName: "Precincts");
            RenameTable(name: "dbo.New_Districts", newName: "Districts");

            Sql("UPDATE [dbo].[PrecinctAddresses] SET [PrecinctId] = [Id] From [dbo].[PrecinctAddresses] as [PrecinctAddresses] inner join[dbo].[Precincts] on [PrecinctId]=[Number]");

            CreateIndex("dbo.UserPrecincts", "PrecinctId");
            CreateIndex("dbo.PersonChangeHistory", "StreetId");
            CreateIndex("dbo.PrecinctAddresses", "PrecinctId");
            CreateIndex("dbo.DistrictPrecincts", "PrecinctId");
            CreateIndex("dbo.DistrictPrecincts", "DistrictId");
            
            AddForeignKey("dbo.PrecinctAddresses", "PrecinctId", "dbo.Precincts", "Id", cascadeDelete: false);
            AddForeignKey("dbo.UserPrecincts", "PrecinctId", "dbo.Precincts", "Id", cascadeDelete: false);
            AddForeignKey("dbo.DistrictPrecincts", "PrecinctId", "dbo.Precincts", "Id", cascadeDelete: false);
            AddForeignKey("dbo.DistrictPrecincts", "DistrictId", "dbo.Districts", "Id", cascadeDelete: false);

            CreateIndex("dbo.Precincts", "CityId");
            CreateIndex("dbo.Precincts", "StreetId");
            CreateIndex("dbo.Precincts", "RegionPartId");
            AddForeignKey("dbo.Precincts", "CityId", "dbo.Cities", "Id", cascadeDelete: false);
            AddForeignKey("dbo.Precincts", "RegionPartId", "dbo.RegionParts", "Id", cascadeDelete: false);
            AddForeignKey("dbo.Precincts", "StreetId", "dbo.Streets", "Id", cascadeDelete: false);

            CreateIndex("dbo.Districts", "DistrictTypeId");
            AddForeignKey("dbo.Districts", "DistrictTypeId", "dbo.DistrictTypes", "Id", cascadeDelete: false);
                            
        }
        
        public override void Down()
        {

        }
    }
}
