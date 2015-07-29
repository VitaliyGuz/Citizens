namespace Citizens.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class _7 : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.Neighborhoods",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Name = c.String(nullable: false, maxLength: 50),
                    })
                .PrimaryKey(t => t.Id);
            
            AddColumn("dbo.Precincts", "NeighborhoodId", c => c.Int());
            AddColumn("dbo.PrecinctAddresses", "HouseType", c => c.Int(nullable: true));
            CreateIndex("dbo.Precincts", "NeighborhoodId");
            AddForeignKey("dbo.Precincts", "NeighborhoodId", "dbo.Neighborhoods", "Id");
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.Precincts", "NeighborhoodId", "dbo.Neighborhoods");
            DropIndex("dbo.Precincts", new[] { "NeighborhoodId" });
            DropColumn("dbo.PrecinctAddresses", "HouseType");
            DropColumn("dbo.Precincts", "NeighborhoodId");
            DropTable("dbo.Neighborhoods");
        }
    }
}
