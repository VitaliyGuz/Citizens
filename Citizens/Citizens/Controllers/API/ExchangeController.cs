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
                        string filePath = Path.Combine(HttpContext.Current.Server.MapPath("~/Uploads"),
                            uploadFile.FileName);
                        uploadFile.SaveAs(filePath);
                        DataSet ds = new DataSet();


                        //string ConnectionString = "Provider=Microsoft.ACE.OLEDB.12.0;Data Source=" + filePath + ";Extended Properties=Excel 8.0;";
                        var ConnectionString = "Provider=Microsoft.Jet.OLEDB.4.0; Data Source=" + filePath +
                                                  "; Extended Properties='Excel 8.0;'";
                        using (OleDbConnection conn = new OleDbConnection(ConnectionString))
                        {
                            conn.Open();
                            using (DataTable dtExcelSchema = conn.GetSchema("Tables"))
                            {
                                string sheetName = dtExcelSchema.Rows[0]["TABLE_NAME"].ToString();

                                var context = new CitizenDbContext();

                                

                                string query =
                                    "SELECT DISTINCT FirstName, MidleName, LastName, Street, StreetType, City, CityType, RegionPart, IIF(House IS NULL, 0, House) as House, Apartment, Gender FROM [" +
                                    sheetName + "] WHERE FirstName<>'' & FirstName<>'*' & LastName<>'' & LastName<>'*'";
                                OleDbDataAdapter adapter = new OleDbDataAdapter(query, conn);
                                ds = new DataSet();

                                adapter.Fill(ds, "Items");


                                DataTable excelTable = ds.Tables[0];


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
