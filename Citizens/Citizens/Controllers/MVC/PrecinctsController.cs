using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web;
using System.Web.Mvc;


namespace Citizens.Controllers.MVC
{
    public class PrecinctsController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }
    }
}
