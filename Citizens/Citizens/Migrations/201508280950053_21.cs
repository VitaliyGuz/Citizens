namespace Citizens.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class _21 : DbMigration
    {
        public override void Up()
        {
            AlterColumn("dbo.PersonChangeHistory", "FirstName", c => c.String(nullable: false, maxLength: 20));
            AlterColumn("dbo.PersonChangeHistory", "MidleName", c => c.String(nullable: false, maxLength: 20));
            AlterColumn("dbo.PersonChangeHistory", "LastName", c => c.String(nullable: false, maxLength: 25));
            AlterColumn("dbo.People", "FirstName", c => c.String(nullable: false, maxLength: 20));
            AlterColumn("dbo.People", "MidleName", c => c.String(nullable: false, maxLength: 20));
            AlterColumn("dbo.People", "LastName", c => c.String(nullable: false, maxLength: 25));
        }
        
        public override void Down()
        {
            AlterColumn("dbo.People", "LastName", c => c.String(maxLength: 25));
            AlterColumn("dbo.People", "MidleName", c => c.String(maxLength: 20));
            AlterColumn("dbo.People", "FirstName", c => c.String(maxLength: 20));
            AlterColumn("dbo.PersonChangeHistory", "LastName", c => c.String(maxLength: 25));
            AlterColumn("dbo.PersonChangeHistory", "MidleName", c => c.String(maxLength: 20));
            AlterColumn("dbo.PersonChangeHistory", "FirstName", c => c.String(maxLength: 20));
        }
    }
}
