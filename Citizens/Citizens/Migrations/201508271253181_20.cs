namespace Citizens.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class _20 : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.WorkAreas",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Number = c.Int(nullable: false),
                        PrecinctId = c.Int(nullable: false),
                        TopId = c.Int(nullable: false),
                        PersonChangeHistory_Id = c.Int(),
                        PersonChangeHistory_ChangeTime = c.DateTime(),
                        PersonChangeHistory_UserId = c.String(maxLength: 128),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Precincts", t => t.PrecinctId, cascadeDelete: false)
                .ForeignKey("dbo.People", t => t.TopId, cascadeDelete: false)
                .ForeignKey("dbo.PersonChangeHistory", t => new { t.PersonChangeHistory_Id, t.PersonChangeHistory_ChangeTime, t.PersonChangeHistory_UserId })
                .Index(t => t.PrecinctId)
                .Index(t => t.TopId)
                .Index(t => new { t.PersonChangeHistory_Id, t.PersonChangeHistory_ChangeTime, t.PersonChangeHistory_UserId });
            
            AddColumn("dbo.PrecinctAddresses", "WorkAreaId", c => c.Int());
            CreateIndex("dbo.PrecinctAddresses", "WorkAreaId");
            AddForeignKey("dbo.PrecinctAddresses", "WorkAreaId", "dbo.WorkAreas", "Id");
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.WorkAreas", new[] { "PersonChangeHistory_Id", "PersonChangeHistory_ChangeTime", "PersonChangeHistory_UserId" }, "dbo.PersonChangeHistory");
            DropForeignKey("dbo.WorkAreas", "TopId", "dbo.People");
            DropForeignKey("dbo.PrecinctAddresses", "WorkAreaId", "dbo.WorkAreas");
            DropForeignKey("dbo.WorkAreas", "PrecinctId", "dbo.Precincts");
            DropIndex("dbo.WorkAreas", new[] { "PersonChangeHistory_Id", "PersonChangeHistory_ChangeTime", "PersonChangeHistory_UserId" });
            DropIndex("dbo.WorkAreas", new[] { "TopId" });
            DropIndex("dbo.WorkAreas", new[] { "PrecinctId" });
            DropIndex("dbo.PrecinctAddresses", new[] { "WorkAreaId" });
            DropColumn("dbo.PrecinctAddresses", "WorkAreaId");
            DropTable("dbo.WorkAreas");
        }
    }
}
