namespace Citizens.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class _1 : DbMigration
    {
        public override void Up()
        {
            DropForeignKey("dbo.OrderLines", "OrderId", "dbo.Orders");
            DropForeignKey("dbo.OrderLines", "ProductId", "dbo.Products");
            DropIndex("dbo.OrderLines", new[] { "ProductId" });
            DropIndex("dbo.OrderLines", new[] { "OrderId" });
            CreateTable(
                "dbo.DistrictTypes",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Name = c.String(nullable: false, maxLength: 50),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.DistrictPrecincts",
                c => new
                    {
                        DistrictId = c.Int(nullable: false),
                        PrecinctId = c.Int(nullable: false),
                    })
                .PrimaryKey(t => new { t.DistrictId, t.PrecinctId })
                .ForeignKey("dbo.Districts", t => t.DistrictId, cascadeDelete: false)
                .ForeignKey("dbo.Precincts", t => t.PrecinctId, cascadeDelete: false)
                .Index(t => t.DistrictId)
                .Index(t => t.PrecinctId);
            
            CreateTable(
                "dbo.Elections",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Name = c.String(nullable: false, maxLength: 50),
                        Date = c.DateTime(),
                    })
                .PrimaryKey(t => t.Id);
            
            AddColumn("dbo.Districts", "DistrictTypeId", c => c.Int(nullable: true));
            CreateIndex("dbo.Districts", "DistrictTypeId");
            AddForeignKey("dbo.Districts", "DistrictTypeId", "dbo.DistrictTypes", "Id", cascadeDelete: false);
            DropTable("dbo.OrderLines");
            DropTable("dbo.Orders");
            DropTable("dbo.Products");
        }
        
        public override void Down()
        {
            CreateTable(
                "dbo.Products",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Name = c.String(nullable: false),
                        Description = c.String(nullable: false),
                        Price = c.Decimal(nullable: false, precision: 18, scale: 2),
                        Category = c.String(nullable: false),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.Orders",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Customer = c.String(nullable: false),
                        TotalCost = c.Decimal(nullable: false, precision: 18, scale: 2),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.OrderLines",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Count = c.Int(nullable: false),
                        ProductId = c.Int(nullable: false),
                        OrderId = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.Id);
            
            DropForeignKey("dbo.DistrictPrecincts", "PrecinctId", "dbo.Precincts");
            DropForeignKey("dbo.DistrictPrecincts", "DistrictId", "dbo.Districts");
            DropForeignKey("dbo.Districts", "DistrictTypeId", "dbo.DistrictTypes");
            DropIndex("dbo.DistrictPrecincts", new[] { "PrecinctId" });
            DropIndex("dbo.DistrictPrecincts", new[] { "DistrictId" });
            DropIndex("dbo.Districts", new[] { "DistrictTypeId" });
            DropColumn("dbo.Districts", "DistrictTypeId");
            DropTable("dbo.Elections");
            DropTable("dbo.DistrictPrecincts");
            DropTable("dbo.DistrictTypes");
            CreateIndex("dbo.OrderLines", "OrderId");
            CreateIndex("dbo.OrderLines", "ProductId");
            AddForeignKey("dbo.OrderLines", "ProductId", "dbo.Products", "Id", cascadeDelete: true);
            AddForeignKey("dbo.OrderLines", "OrderId", "dbo.Orders", "Id", cascadeDelete: true);
        }
    }
}
