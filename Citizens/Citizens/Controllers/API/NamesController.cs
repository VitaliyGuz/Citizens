using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using Citizens.Models;

namespace Citizens.Controllers.API
{
    public class NamesController : ApiController
    {
        private CitizenDbContext db = new CitizenDbContext();

        public List<string> GetFirstNames(string id="")
        {
            return db.Database.SqlQuery<string>("select distinct FirstName from People where FirstName like {0}", id + "%").ToList();
        }

        public List<string> GetMidleNames(string id = "")
        {
            return db.Database.SqlQuery<string>("select distinct MidleName from People where MidleName like {0}", id + "%").ToList();
        }

        public List<string> GetLastNames(string id = "")
        {
            return db.Database.SqlQuery<string>("select distinct LastName from People where LastName like {0}", id + "%").ToList();
        }

    }
}