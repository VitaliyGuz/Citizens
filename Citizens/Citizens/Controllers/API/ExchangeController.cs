using System;
using System.Collections.Generic;
using System.Data;
using System.Data.OleDb;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using Citizens.Models;

namespace Citizens.Controllers.API
{
    public class ExchangeController : ApiController
    {
        [AllowAnonymous]
        [HttpPost]
        public IHttpActionResult Upload()
        {
            //StringBuilder strValidations = new StringBuilder(string.Empty);
            try
            {
                if (HttpContext.Current.Request.Files.AllKeys.Any())
                {
                    // Get the uploaded image from the Files collection
                    var uploadFile = HttpContext.Current.Request.Files[0];

                    if (uploadFile.ContentLength > 0)
                    {
                        string filePath = Path.Combine(HttpContext.Current.Server.MapPath("~/Uploads"),
                            uploadFile.FileName);
                        uploadFile.SaveAs(filePath);
                        DataSet ds = new DataSet();


                        //string ConnectionString = "Provider=Microsoft.ACE.OLEDB.12.0;Data Source=" + filePath + ";Extended Properties=Excel 8.0;";
                        string ConnectionString = "Provider=Microsoft.Jet.OLEDB.4.0; Data Source=" + filePath +
                                                  "; Extended Properties='Excel 8.0;'";
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
                                            var findStreet =
                                                context.Streets.FirstOrDefault(
                                                    u => u.Name == name && u.StreetType.Name == type);
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
                                            var findRegionPart =
                                                context.RegionParts.FirstOrDefault(u => u.Name == regionPart);
                                            var findCity =
                                                context.Cities.FirstOrDefault(
                                                    u => u.Name == name && u.CityType.Name == type);
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

                                query =
                                    "SELECT DISTINCT FirstName, MidleName, LastName, Street, StreetType, City, CityType, House, Apartment, Gender FROM [" +
                                    sheetName + "] WHERE FirstName<>'' & FirstName<>'*' & LastName<>'' & LastName<>'*'";
                                adapter = new OleDbDataAdapter(query, conn);
                                ds = new DataSet();

                                adapter.Fill(ds, "Items");


                                DataTable ExcelTable = ds.Tables[0];


                                /////////////////////////////////////////////////////////////////////
                                //string connectionString = "Data Source=.; Initial Catalog=CitizensDb;Integrated Security=True; Connect Timeout=15;Encrypt=False;TrustServerCertificate=False";
                                string connectionString =
                                    System.Configuration.ConfigurationManager.ConnectionStrings["CitizensDb"]
                                        .ConnectionString;
                                //
                                // In a using statement, acquire the SqlConnection as a resource.
                                //
                                using (SqlConnection connection = new SqlConnection(connectionString))
                                {
                                    // Create a DataTable with the modified rows.


                                    // Define the INSERT-SELECT statement.


                                    // Configure the command and parameter.
                                    string path1 =
                                        HttpContext.Current.Server.MapPath("~/Scripts/Sql/insertAddresses.sql");
                                    FileInfo file = new FileInfo(path1);
                                    string sqlInsert = file.OpenText().ReadToEnd();
                                    SqlCommand insertCommand = new SqlCommand(sqlInsert, connection);
                                    SqlParameter tvpParam = insertCommand.Parameters.AddWithValue("@ExcelTable",
                                        ExcelTable);
                                    tvpParam.SqlDbType = SqlDbType.Structured;
                                    tvpParam.TypeName = "dbo.PersonsTable";



                                    // Execute the command.
                                    connection.Open();
                                    insertCommand.CommandTimeout = 0;
                                    insertCommand.ExecuteNonQuery();
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception)
            {
                throw;
            }
            return Ok();
        }
    }
}
