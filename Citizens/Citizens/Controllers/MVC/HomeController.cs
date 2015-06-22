using Citizens.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.OleDb;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;
using System.Data.SqlClient;

namespace Citizens.Controllers
{
    public class HomeController : Controller
    {
        // GET: Home
        [AllowAnonymous]
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult StreetTypes()
        {
            return View();
        }

        [AllowAnonymous]
        public ActionResult Upload()
        {
            return View();
        }


        [AllowAnonymous]
        [AcceptVerbs(HttpVerbs.Post)]
        public string Upload(HttpPostedFileBase uploadFile)
        {
            StringBuilder strValidations = new StringBuilder(string.Empty);
            //try
            //{
                if (uploadFile.ContentLength > 0)
                {
                    string filePath = Path.Combine(HttpContext.Server.MapPath("../Uploads"), Path.GetFileName(uploadFile.FileName));
                    uploadFile.SaveAs(filePath);
                    DataSet ds = new DataSet();


                    //var FilePath = filePath;
                    //FileInfo existingFile = new FileInfo(FilePath);
                    //using (ExcelPackage package = new ExcelPackage(existingFile))
                    //{
                    //    // get the first worksheet in the workbook
                    //    ExcelWorksheet worksheet = package.Workbook.Worksheets[1];
                    //    int col = 1; //The item description
                    //                 // output the data in column 2
                    //    var context = new CitizenDbContext();
                    //    for (int row = 2; row < 5; row++)

                    //    {
                    //        context.StreetTypes.Add(new StreetType()
                    //        {
                    //            Name = worksheet.Cells[row, col].Value.ToString()
                    //        });
                    //    };
                    //    context.SaveChanges();
                    //    //    Console.WriteLine("\tCell({0},{1}).Value={2}", row, col, worksheet.Cells[row, col].Value);

                    //    //// output the formula in row 5
                    //    //Console.WriteLine("\tCell({0},{1}).Formula={2}", 3, 5, worksheet.Cells[3, 5].Formula);
                    //    //Console.WriteLine("\tCell({0},{1}).FormulaR1C1={2}", 3, 5, worksheet.Cells[3, 5].FormulaR1C1);

                    //    //// output the formula in row 5
                    //    //Console.WriteLine("\tCell({0},{1}).Formula={2}", 5, 3, worksheet.Cells[5, 3].Formula);
                    //    //Console.WriteLine("\tCell({0},{1}).FormulaR1C1={2}", 5, 3, worksheet.Cells[5, 3].FormulaR1C1);

                    //} // the using statement automatically calls Dispose() which closes the package.



                    //string ConnectionString = "Provider=Microsoft.ACE.OLEDB.12.0;Data Source=" + filePath + ";Extended Properties=Excel 8.0;";
                    string ConnectionString = "Provider=Microsoft.Jet.OLEDB.4.0; Data Source=" + filePath + "; Extended Properties='Excel 8.0;'";
                    using (OleDbConnection conn = new System.Data.OleDb.OleDbConnection(ConnectionString))
                    {
                        conn.Open();
                        using (DataTable dtExcelSchema = conn.GetSchema("Tables"))
                        {
                            string sheetName = dtExcelSchema.Rows[0]["TABLE_NAME"].ToString();

                            var context = new CitizenDbContext();

                            string query = "SELECT DISTINCT StreetType FROM [" + sheetName + "]";
                            OleDbDataAdapter adapter = new OleDbDataAdapter(query, conn);
                            //DataSet ds = new DataSet();
                            adapter.Fill(ds, "Items");
                            if (ds.Tables.Count > 0)
                            {
                                if (ds.Tables[0].Rows.Count > 0)
                                {
                                    //var streets = new List<Street> { };
                                    //var context = new CitizenDbContext();

                                    for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                                    {
                                        //streets.Add(new Street()
                                        string name = ds.Tables[0].Rows[i][0].ToString();
                                        var findStreetType = context.StreetTypes.FirstOrDefault(u => u.Name == name);
                                        if (findStreetType == null && name != "")
                                        {
                                            context.StreetTypes.Add(new StreetType()
                                            {
                                                Name = name
                                            });
                                        }
                                    }
                                    //streets.ForEach(street => context.Streets.Add(street));
                                    context.SaveChanges();
                                }
                            }

                            query = "SELECT DISTINCT Street, StreetType FROM [" + sheetName + "]";
                            adapter = new OleDbDataAdapter(query, conn);
                            ds = new DataSet();
                            adapter.Fill(ds, "Items");
                            if (ds.Tables.Count > 0)
                            {
                                if (ds.Tables[0].Rows.Count > 0)
                                {
                                    //var streets = new List<Street> { };
                                    //var context = new CitizenDbContext();

                                    for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                                    {
                                        //streets.Add(new Street()
                                        string name = ds.Tables[0].Rows[i][0].ToString();
                                        string type = ds.Tables[0].Rows[i][1].ToString();
                                        var findStreetType = context.StreetTypes.FirstOrDefault(u => u.Name == type);
                                        var findStreet = context.Streets.FirstOrDefault(u => u.Name == name && u.StreetType.Name == type);
                                        if (findStreet == null && name != "")
                                        {
                                            context.Streets.Add(new Street()
                                            {
                                                Name = ds.Tables[0].Rows[i][0].ToString(),
                                                StreetType = findStreetType
                                                //StreetTypeId = context.Database.SqlQuery<int>("select top 1 Id from StreetTypes where Name = { 0 }", type)
                                            });
                                        }


                                    }
                                    //streets.ForEach(street => context.Streets.Add(street));
                                    context.SaveChanges();
                                }
                            }

                            query = "SELECT DISTINCT CityType FROM [" + sheetName + "]";
                            adapter = new OleDbDataAdapter(query, conn);
                            ds = new DataSet();
                            adapter.Fill(ds, "Items");
                            if (ds.Tables.Count > 0)
                            {
                                if (ds.Tables[0].Rows.Count > 0)
                                {
                                    //var context = new CitizenDbContext();

                                    for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                                    {
                                        string name = ds.Tables[0].Rows[i][0].ToString();
                                        var findCityType = context.CityTypes.FirstOrDefault(u => u.Name == name);
                                        if (findCityType == null && name != "")
                                        {
                                            context.CityTypes.Add(new CityType()
                                            {
                                                Name = ds.Tables[0].Rows[i][0].ToString()
                                            });
                                        }
                                    }
                                    context.SaveChanges();
                                }
                            }

                            query = "SELECT DISTINCT RegionPart FROM [" + sheetName + "]";
                            adapter = new OleDbDataAdapter(query, conn);
                            ds = new DataSet();
                            adapter.Fill(ds, "Items");
                            if (ds.Tables.Count > 0)
                            {
                                if (ds.Tables[0].Rows.Count > 0)
                                {
                                    //var context = new CitizenDbContext();

                                    for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                                    {
                                        string name = ds.Tables[0].Rows[i][0].ToString();
                                        var findRegionPart = context.RegionParts.FirstOrDefault(u => u.Name == name);
                                        if (findRegionPart == null && name != "")
                                        {
                                            context.RegionParts.Add(new RegionPart()
                                            {
                                                Name = name,
                                                RegionPartType = RegionPartType.область,
                                                RegionId = 1
                                            });
                                        }
                                    }
                                    context.SaveChanges();
                                }
                            }

                            query = "SELECT DISTINCT City, CityType, RegionPart FROM [" + sheetName + "]";
                            adapter = new OleDbDataAdapter(query, conn);
                            ds = new DataSet();
                            adapter.Fill(ds, "Items");
                            if (ds.Tables.Count > 0)
                            {
                                if (ds.Tables[0].Rows.Count > 0)
                                {

                                    //var context = new CitizenDbContext();

                                    for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                                    {

                                        string name = ds.Tables[0].Rows[i][0].ToString();
                                        string type = ds.Tables[0].Rows[i][1].ToString();
                                        string regionPart = ds.Tables[0].Rows[i][2].ToString();
                                        var findCityType = context.CityTypes.FirstOrDefault(u => u.Name == type);
                                        var findRegionPart = context.RegionParts.FirstOrDefault(u => u.Name == regionPart);
                                        var findCity = context.Cities.FirstOrDefault(u => u.Name == name && u.CityType.Name == type);
                                        if (findCity == null && name != "")
                                        {
                                            context.Cities.Add(new City()
                                            {
                                                Name = name,
                                                CityType = findCityType,
                                                RegionPart = findRegionPart
                                            });
                                        }


                                    }
                                    context.SaveChanges();
                                }
                            }

                            query = "SELECT DISTINCT FirstName, MidleName, LastName, Street, StreetType, City, CityType, House, Apartment, Gender FROM [" + sheetName + "] WHERE FirstName<>'' & FirstName<>'*' & LastName<>'' & LastName<>'*'";
                            //query = "SELECT DISTINCT Street, StreetType FROM [" + sheetName + "] WHERE FirstName<>'' & FirstName<>'*'";
                            adapter = new OleDbDataAdapter(query, conn);
                            ds = new DataSet();
                            //ds.Tables.Add("Items");
                            //ds.Tables[0].Columns.Add("Street", typeof(string));
                            //ds.Tables[0].Columns.Add("StreetType", typeof(string));
                            //ds.Tables[0].Columns.Add("City", typeof(string));
                            //ds.Tables[0].Columns.Add("CityType", typeof(string));
                            adapter.Fill(ds, "Items");

                            //var citizens = from ExcelTable in ds.Tables[0].AsEnumerable()
                            //               from streetsNames in context.Streets.AsEnumerable().Where(x => ExcelTable.Field<string>("Street") == x.Name && ExcelTable.Field<string>("StreetType") == x.StreetType.Name)
                            //               from cityNames in context.Cities.AsEnumerable().Where(x => ExcelTable.Field<string>("City") == x.Name && ExcelTable.Field<string>("CityType") == x.CityType.Name)
                            //               select new { StreetId = streetsNames.Id, CityId = cityNames.Id };

                            DataTable ExcelTable = ds.Tables[0];
                            //var citizens = from table in ExcelTable.AsEnumerable()
                            //               join streetNames in context.Streets
                            //               on table.Field<string>("Street") equals streetNames.Name
                            //               join streetTypesNames in context.StreetTypes
                            //               on table.Field<string>("StreetType") equals streetTypesNames.Name
                            //               join cityNames in context.Cities
                            //               on table.Field<string>("City") equals cityNames.Name
                            //               join cityTypesNames in context.CityTypes
                            //               on table.Field<string>("CityType") equals cityTypesNames.Name
                            //               where streetNames.StreetTypeId == streetTypesNames.Id && cityNames.CityTypeId == cityTypesNames.Id
                            //               select new { table, StreetId = streetNames.Id, CityId = cityNames.Id };

                            /////////////////////////////////////////////////////////////////////
                            //string connectionString = "Data Source=.; Initial Catalog=CitizensDb;Integrated Security=True; Connect Timeout=15;Encrypt=False;TrustServerCertificate=False";
                            string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["CitizensDb"].ConnectionString;
                            //
                            // In a using statement, acquire the SqlConnection as a resource.
                            //
                            using (SqlConnection connection = new SqlConnection(connectionString))
                            {
                                // Create a DataTable with the modified rows.


                                // Define the INSERT-SELECT statement.
                                string sqlInsert =
                                    //"CREATE TYPE dbo.PersonsTable AS TABLE"
                                    //+ "("
                                    //+ "FirstName nvarchar(20),"
                                    //+ "MidleName nvarchar(20),"
                                    //+ "LastName nvarchar(20),"
                                    //+ "Gender int,"
                                    //+ "Street nvarchar(50),"
                                    //+ "StreetType nvarchar(50),"
                                    //+ "City nvarchar(50),"
                                    //+ "CityType nvarchar(50),"
                                    //+ "House nvarchar(50),"
                                    //+ "Apartment int"
                                    //+ ")"
                                    //+ "GO "

                                //" INSERT INTO dbo.People (FirstName, LastName, MidleName, Gender, CityId, StreetId, House, Apartment) "
                                    //+ " SELECT ExcelTable.FirstName, ExcelTable.LastName, ExcelTable.MidleName, ExcelTable.Gender, cityNames.Id, streetNames.Id, ExcelTable.House, ExcelTable.Apartment "
                                    //+ " FROM @ExcelTable AS ExcelTable "
                                    //+ " Inner join dbo.Streets as streetNames "
                                    //+ " on ExcelTable.Street = streetNames.Name "
                                    //+ " Inner join dbo.StreetTypes as streetTypeNames "
                                    //+ " on ExcelTable.StreetType = streetTypeNames.Name "
                                    //+ " and streetNames.StreetTypeId = streetTypeNames.Id "
                                    //+ " Inner join dbo.Cities as cityNames "
                                    //+ " on ExcelTable.City = cityNames.Name "
                                    //+ " Inner join dbo.CityTypes as cityTypeNames "
                                    //+ " on ExcelTable.CityType = cityTypeNames.Name "
                                    //+ " and cityNames.CityTypeId = cityTypeNames.Id "
                                    //;

                                " INSERT INTO dbo.PrecinctAddresses (CityId, StreetId, House, PrecinctId) "
                                + " SELECT Distinct cityNames.Id, streetNames.Id, ExcelTable.House, PrecinctId = case when precinctAddressesWholeStreet.PrecinctId is null then 531188 else precinctAddressesWholeStreet.PrecinctId end "
                                + " FROM @ExcelTable AS ExcelTable "
                                + " Inner join dbo.Streets as streetNames "
                                + " on ExcelTable.Street = streetNames.Name "
                                + " Inner join dbo.StreetTypes as streetTypeNames "
                                + " on ExcelTable.StreetType = streetTypeNames.Name "
                                + " and streetNames.StreetTypeId = streetTypeNames.Id "
                                + " Inner join dbo.Cities as cityNames "
                                + " on ExcelTable.City = cityNames.Name "
                                + " Inner join dbo.CityTypes as cityTypeNames "
                                + " on ExcelTable.CityType = cityTypeNames.Name "
                                + " and cityNames.CityTypeId = cityTypeNames.Id "
                                + " left join dbo.PrecinctAddresses as precinctAddresses "
                                + " on cityNames.Id = precinctAddresses.CityId "
                                + " and streetNames.Id = precinctAddresses.StreetId "
                                + " and ExcelTable.House = precinctAddresses.House "
                                + " left join dbo.PrecinctAddresses as precinctAddressesWholeStreet "
                                + " on cityNames.Id = precinctAddressesWholeStreet.CityId "
                                + " and streetNames.Id = precinctAddressesWholeStreet.StreetId "
                                + " and precinctAddressesWholeStreet.House = '' "
                                + " where precinctAddresses.CityId is null "
                                + " INSERT INTO dbo.People (FirstName, LastName, MidleName, Gender, CityId, StreetId, House, Apartment) "
                                + " SELECT ExcelTable.FirstName, ExcelTable.LastName, ExcelTable.MidleName, ExcelTable.Gender, cityNames.Id, streetNames.Id, ExcelTable.House, ExcelTable.Apartment "
                                + " FROM @ExcelTable AS ExcelTable "
                                + " Inner join dbo.Streets as streetNames "
                                + " on ExcelTable.Street = streetNames.Name "
                                + " Inner join dbo.StreetTypes as streetTypeNames "
                                + " on ExcelTable.StreetType = streetTypeNames.Name "
                                + " and streetNames.StreetTypeId = streetTypeNames.Id "
                                + " Inner join dbo.Cities as cityNames "
                                + " on ExcelTable.City = cityNames.Name "
                                + " Inner join dbo.CityTypes as cityTypeNames "
                                + " on ExcelTable.CityType = cityTypeNames.Name "
                                + " and cityNames.CityTypeId = cityTypeNames.Id "
                                ;
                                // Configure the command and parameter.
                                string path1 = HttpContext.Server.MapPath("~/Scripts/Sql/insertAddresses.sql");
                                FileInfo file = new FileInfo(path1);
                                sqlInsert = file.OpenText().ReadToEnd();
                                SqlCommand insertCommand = new SqlCommand(sqlInsert, connection);
                                //SqlCommand insertCommand = new SqlCommand(sqlInsert, connection);
                                SqlParameter tvpParam = insertCommand.Parameters.AddWithValue("@ExcelTable", ExcelTable);
                                tvpParam.SqlDbType = SqlDbType.Structured;
                                tvpParam.TypeName = "dbo.PersonsTable";



                                // Execute the command.
                                connection.Open();
                                insertCommand.CommandTimeout = 0;
                                insertCommand.ExecuteNonQuery();
                            }


                            /////////////////////////////////////////////                        
                            //var citizens = context.Database.SqlQuery(typeof(Person), "Select Streets.Id as StreetId from Streets inner join {0} as Exceltable on Street.Name = Exceltable.Street", ExcelTable);

                            //from streetsNames in context.Streets.Where(x => ExcelTable.ItemArray[3] == x.Name && ExcelTable.ItemArray[4] == x.StreetType.Name)
                            //from cityNames in context.Cities.AsQueryable().Where(x => ExcelTable.ItemArray[5] == x.Name && ExcelTable.ItemArray[6] == x.CityType.Name)
                            //select new { StreetId = streetsNames.Id, CityId = cityNames.Id };


                            //var citizens = context.Database.SqlQuery<string>("Select StreetId from ");

                            //////////////////////////////////////////////////////////////
                            //foreach (var citizen in citizens)
                            //{
                            //    Gender? GenderValue;
                            //    if (citizen.table.Field<string>("Gender") == null)
                            //    {
                            //        GenderValue = null;
                            //    }
                            //    else
                            //    {
                            //        GenderValue = (Gender)Enum.Parse(typeof(Gender), citizen.table.Field<string>("Gender"));
                            //    };
                            //    int tempVal;
                            //    int? apartment = Int32.TryParse(citizen.table.Field<string>("Apartment"), out tempVal) ? tempVal : (int?)null;

                            //    context.People.Add(new Person()
                            //    {

                            //        FirstName = citizen.table.Field<string>("FirstName"),
                            //        MidleName = citizen.table.Field<string>("MidleName"),
                            //        LastName = citizen.table.Field<string>("LastName"),
                            //        Gender = GenderValue,
                            //        House = citizen.table.Field<string>("House"),
                            //        Apartment = apartment,
                            //        StreetId = citizen.StreetId,
                            //        CityId = citizen.CityId

                            //    });
                            //}

                            ////////////////////////////////////////////////////////////////


                            //if (ds.Tables.Count > 0)
                            //{
                            //    if (ds.Tables[0].Rows.Count > 0)
                            //    {



                            //        for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                            //        {

                            //            string firstName = ds.Tables[0].Rows[i][0].ToString();
                            //            string midleName = ds.Tables[0].Rows[i][1].ToString();
                            //            string lastName = ds.Tables[0].Rows[i][2].ToString();
                            //            string streetName = ds.Tables[0].Rows[i][3].ToString();
                            //            string streetType = ds.Tables[0].Rows[i][4].ToString();
                            //            var street = context.Streets.Where(u => u.Name == streetName && u.StreetType.Name == streetType).FirstOrDefault();
                            //            string cityName = ds.Tables[0].Rows[i][5].ToString();
                            //            string cityType = ds.Tables[0].Rows[i][6].ToString();
                            //            var city = context.Cities.Where(u => u.Name == cityName && u.CityType.Name == cityType).FirstOrDefault();
                            //            string house = ds.Tables[0].Rows[i][7].ToString();
                            //            int tempVal;
                            //            int? apartment = Int32.TryParse(ds.Tables[0].Rows[i][8].ToString(), out tempVal) ? tempVal : (int?)null;
                            //            string lastchar = midleName.Substring(midleName.Length - Math.Min(2, midleName.Length)).ToUpper();
                            //            Gender gender = default(Gender);

                            //            if (lastchar == "ИЧ" || lastchar == "ІЧ")
                            //            {
                            //                gender = Gender.ч;
                            //            }
                            //            else
                            //            {
                            //                gender = Gender.ж;
                            //            }

                            //            if (lastName != "" && lastName != "*")
                            //            {
                            //                context.People.Add(new Person()
                            //                {
                            //                    FirstName = firstName,
                            //                    MidleName = midleName,
                            //                    LastName = lastName,
                            //                    DateOfBirth = new DateTime(1900, 1, 1),
                            //                    Gender = gender,
                            //                    City = city,
                            //                    Street = street,
                            //                    House = house,
                            //                    Apartment = apartment
                            //                });

                            //            }



                            //        }
                            //context.SaveChanges();

                            //    }
                            //}



                        }
                    }


                }
            //}
            //catch (Exception ex) { }
            return "";
        }
        public ActionResult Streets()
        {
            return View();
        }
        //public ActionResult Importexcel()
        //public ActionResult Import()
        //{
        //    return View();
        //}

        //public ActionResult Importexcel()
        //{


        //    //if (Request.Files[" fileupload1"].contentlength = "" > 0)
        //    //{
        //    //    string extension = System.IO.Path.GetExtension(Request.Files["FileUpload1"].FileName);
        //    //    string path1 = string.Format("{0}/{1}", Server.MapPath("~/Content/UploadedFolder"), Request.Files["FileUpload1"].FileName);
        //    //    if (System.IO.File.Exists(path1))
        //    //        System.IO.File.Delete(path1);

        //    //    Request.Files["FileUpload1"].SaveAs(path1);
        //    //    string sqlConnectionString = @"Data Source=(LocalDb)\MSSQLLocalDB;AttachDbFilename=|DataDirectory|\CitizensDb.mdf; Initial Catalog=CitizensDb;Integrated Security=True; ";


        //    //    //Create connection string to Excel work book
        //    //    string excelConnectionString = @"Provider=Microsoft.ACE.OLEDB.12.0;Data Source=" + path1 + ";Extended Properties=Excel 12.0;Persist Security Info=False";
        //    //    //Create Connection to Excel work book
        //    //    OleDbConnection excelConnection = new OleDbConnection(excelConnectionString);
        //    //    //Create OleDbCommand to fetch data from Excel
        //    //    OleDbCommand cmd = new OleDbCommand("Select [id],[Name],[Marks],[Grade] from [Sheet1$]", excelConnection);

        //    //    excelConnection.Open();
        //    //    OleDbDataReader dReader;
        //    //    dReader = cmd.ExecuteReader();

        //    //    SqlBulkCopy sqlBulk = new SqlBulkCopy(sqlConnectionString);
        //    //    //Give your Destination table name
        //    //    sqlBulk.DestinationTableName = "StudentRecord";
        //    //    sqlBulk.WriteToServer(dReader);
        //    //    excelConnection.Close();

        //    //    // SQL Server Connection String


        //    //}

        //    return RedirectToAction("Import");
        //}



    }
}