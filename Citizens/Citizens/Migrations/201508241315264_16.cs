namespace Citizens.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class _16 : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.PrecinctAddresses", "HouseNumber", c => c.Int());
            AddColumn("dbo.PrecinctAddresses", "HouseLetter", c => c.String());
            AddColumn("dbo.PrecinctAddresses", "HouseFraction", c => c.String());
            AddColumn("dbo.PrecinctAddresses", "HouseBuilding", c => c.String());
            AddColumn("dbo.PrecinctAddresses", "PostIndex", c => c.Int());
        }
        
        public override void Down()
        {
            DropColumn("dbo.PrecinctAddresses", "PostIndex");
            DropColumn("dbo.PrecinctAddresses", "HouseBuilding");
            DropColumn("dbo.PrecinctAddresses", "HouseFraction");
            DropColumn("dbo.PrecinctAddresses", "HouseLetter");
            DropColumn("dbo.PrecinctAddresses", "HouseNumber");
        }
    }
}
