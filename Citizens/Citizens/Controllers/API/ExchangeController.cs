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
        [Logger(Roles = "SuperAdministrators")]        
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


                        FileInfo fileinfo = new FileInfo(uploadFile.FileName);

                        string strFilePath = HttpContext.Current.Server.MapPath("~/Uploads");

                        string strCsvFilePath = Path.Combine(strFilePath, uploadFile.FileName);

                        uploadFile.SaveAs(strCsvFilePath);

                        

                        using (FileStream filestr = new FileStream(strFilePath + "\\schema.ini",
                            FileMode.Create, FileAccess.Write))
                        {
                            using (StreamWriter writer = new StreamWriter(filestr))
                            {
                                writer.WriteLine("[" + fileinfo.Name + "]");
                                writer.WriteLine("ColNameHeader=True");
                                writer.WriteLine("Format=Delimited(;)");
                                writer.WriteLine("DateTimeFormat=dd.mm.yyyy");
                                writer.WriteLine("Col1=FirstName Text Width 20");
                                writer.WriteLine("Col2=MidleName Text Width 20");
                                writer.WriteLine("Col3=LastName Text Width 25");
                                writer.WriteLine("Col4=Street Text Width 50");
                                writer.WriteLine("Col5=StreetType Text Width 50");
                                writer.WriteLine("Col6=City Text Width 50");
                                writer.WriteLine("Col7=CityType Text Width 50");
                                writer.WriteLine("Col8=RegionPart Text Width 50");
                                writer.WriteLine("Col9=House Text Width 20");
                                writer.WriteLine("Col10=HouseBuilding Text Width 5");
                                writer.WriteLine("Col11=HouseNumber Long");
                                writer.WriteLine("Col12=HouseLetter Text Width 5");
                                writer.WriteLine("Col13=HouseFraction Text Width 10");
                                writer.WriteLine("Col14=Apartment Long");
                                writer.WriteLine("Col15=ApartmentStr Text Width 10");
                                writer.WriteLine("Col16=Gender Long");
                                writer.WriteLine("Col17=PostIndex Long");
                                writer.WriteLine("Col18=Precinct Long");
                                writer.WriteLine("Col19=DateOfBirth DateTime");
                                writer.WriteLine("Col20=Address Text");
                                
                                //writer.WriteLine("Col1=FirstName Text  Width 20");
                                //writer.WriteLine("Col2=MidleName Text  Width 20");
                                //writer.WriteLine("Col3=LastName Text  Width 25");
                                //writer.WriteLine("Col4=Street Text");
                                //writer.WriteLine("Col5=StreetType Text");
                                //writer.WriteLine("Col6=City Text");
                                //writer.WriteLine("Col7=CityType Text");
                                //writer.WriteLine("Col8=RegionPart Text");
                                //writer.WriteLine("Col9=House Text");
                                //writer.WriteLine("Col10=HouseBuilding Text");
                                //writer.WriteLine("Col11=HouseNumber Text");
                                //writer.WriteLine("Col12=HouseLetter Text");
                                //writer.WriteLine("Col13=HouseFraction Text");
                                //writer.WriteLine("Col14=Apartment Text");
                                //writer.WriteLine("Col15=ApartmentStr Text");
                                //writer.WriteLine("Col16=Gender Text");
                                //writer.WriteLine("Col17=PostIndex Text");
                                //writer.WriteLine("Col18=Precinct Text");
                                //writer.WriteLine("Col19=DateOfBirth DateTime");
                                writer.Close();
                                writer.Dispose();
                            }
                            filestr.Close();
                            filestr.Dispose();
                        }


                        string strSql = "SELECT FirstName, MidleName, LastName, Street, StreetType, City, CityType, RegionPart, House," +
                                    "HouseBuilding, HouseNumber, HouseLetter, " +
                                    "HouseFraction, Apartment, ApartmentStr, Gender, PostIndex, Precinct, DateOfBirth, Address " +
                                    "FROM [" + fileinfo.Name + "]";
                        string strCSVConnString = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=" + strFilePath + ";"
                          + "Extended Properties='text;HDR=YES;'";

                        OleDbDataAdapter oleda = new OleDbDataAdapter(strSql, strCSVConnString);
                        DataTable dtbBankStmt = new DataTable();
                        oleda.Fill(dtbBankStmt);


                        DataTable excelTable = dtbBankStmt;


                        //string folderPath = HttpContext.Current.Server.MapPath("~/Uploads");
                        //string filePath = Path.Combine(folderPath,
                        //    uploadFile.FileName);
                        //uploadFile.SaveAs(filePath);
                        //DataSet ds = new DataSet();


                        ////string ConnectionString = "Provider=Microsoft.ACE.OLEDB.12.0;Data Source=" + filePath + ";Extended Properties=Excel 8.0;"; Text;HDR=YES;FMT=Delimited
                        //var ConnectionString = "Provider=Microsoft.Jet.OLEDB.4.0; Data Source=" + folderPath +
                        //                          "; Extended Properties='Text;HDR=YES;FMT=Delimited'";
                        //OleDbConnection conn = new OleDbConnection(ConnectionString);
                        
                        //    conn.Open();
                        //    //using (DataTable dtExcelSchema = conn.GetSchema("Tables"))
                            
                        //        //string sheetName = dtExcelSchema.Rows[0]["TABLE_NAME"].ToString();
                        //        string sheetName = uploadFile.FileName;

                        //        var context = new CitizenDbContext();


                        //        //LTRIM(RTRIM(' a b ')
                        //        string query =
                        //            "SELECT FirstName, MidleName, " +
                        //            "LastName, Street, StreetType, City, CityType, RegionPart, House, " +
                        //            "HouseBuilding, HouseNumber, HouseLetter, " +
                        //            "HouseFraction, Apartment, ApartmentStr, Gender, PostIndex, Precinct, DateOfBirth " +
                        //            "FROM [" + sheetName + "]";
                        //        OleDbDataAdapter adapter = new OleDbDataAdapter(query, conn);
                        //        ds = new DataSet("csv");

                        //        adapter.Fill(ds);


                        //        DataTable excelTable = ds.Tables[0];

                        //        excelTable = ds.Tables[0];


                                /////////////////////////////////////////////////////////////////////
                                //string connectionString = "Data Source=.; Initial Catalog=CitizensDb;Integrated Security=True; Connect Timeout=15;Encrypt=False;TrustServerCertificate=False";
                                string connectionString =
                                    System.Configuration.ConfigurationManager.ConnectionStrings["CitizensDb"]
                                        .ConnectionString;
                                //                                
                                //
                                using (SqlConnection connection = new SqlConnection(connectionString))
                                {                                    
                                    
                                    SqlCommand insertCommand = new SqlCommand("AddPersons", connection);
                                    insertCommand.CommandType = CommandType.StoredProcedure;
                                    insertCommand.Parameters.Add("@ExcelTable", SqlDbType.Structured).Value = excelTable;                                    
                                    

                                    // Execute the command.
                                    connection.Open();
                                    insertCommand.CommandTimeout = 0;
                                    insertCommand.ExecuteNonQuery();
                                    connection.Close();
                                }
                            
                        
                    }
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return Ok();
        }
    }
}
