namespace Citizens.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class _18 : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.PersonChangeHistory", "ApartmentStr", c => c.String(maxLength: 20));
            AddColumn("dbo.People", "ApartmentStr", c => c.String(maxLength: 20));
        }
        
        public override void Down()
        {
            DropColumn("dbo.People", "ApartmentStr");
            DropColumn("dbo.PersonChangeHistory", "ApartmentStr");
        }
    }
}
