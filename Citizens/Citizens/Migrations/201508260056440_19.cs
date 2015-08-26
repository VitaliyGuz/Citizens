namespace Citizens.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class _19 : DbMigration
    {
        public override void Up()
        {
            AlterColumn("dbo.PersonChangeHistory", "LastName", c => c.String(nullable: true, maxLength: 25));
            AlterColumn("dbo.People", "LastName", c => c.String(nullable: true, maxLength: 25));
        }
        
        public override void Down()
        {
        }
    }
}
