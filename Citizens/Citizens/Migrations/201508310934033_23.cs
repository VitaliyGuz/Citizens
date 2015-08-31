namespace Citizens.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class _23 : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.PersonChangeHistory", "MajorId", c => c.Int(nullable: false, defaultValueSql: "1677599"));
            AddColumn("dbo.People", "MajorId", c => c.Int(nullable: false, defaultValueSql: "1677599"));
            CreateIndex("dbo.PersonChangeHistory", "MajorId");
            CreateIndex("dbo.People", "MajorId");
            AddForeignKey("dbo.People", "MajorId", "dbo.People", "Id");
            AddForeignKey("dbo.PersonChangeHistory", "MajorId", "dbo.People", "Id", cascadeDelete: false);
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.PersonChangeHistory", "MajorId", "dbo.People");
            DropForeignKey("dbo.People", "MajorId", "dbo.People");
            DropIndex("dbo.People", new[] { "MajorId" });
            DropIndex("dbo.PersonChangeHistory", new[] { "MajorId" });
            DropColumn("dbo.People", "MajorId");
            DropColumn("dbo.PersonChangeHistory", "MajorId");
        }
    }
}
