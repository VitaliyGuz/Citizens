using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Citizens.Controllers.MVC
{
    public class CityController : Controller
    {
        // GET: City
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult ListCities() 
        {
            return PartialView();
        }

        public ActionResult EditCity()
        {
            return PartialView();
        }
    }
}