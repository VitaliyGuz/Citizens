﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Citizens.Controllers.MVC
{
    public class PeopleController : Controller
    {
        // GET: People
        public ActionResult Index()
        {
            return View();
        }
    }
}