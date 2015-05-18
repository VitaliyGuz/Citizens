using System;
using System.Globalization;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin.Security;
using Citizens.Models;
using Microsoft.AspNet.Identity.EntityFramework;

namespace Test.Controllers
{
    
    public class AccountController : Controller
    {
        IRepository repo;

        //private StoreSignInManager _signInManager;
        //private StoreUserManager _userManager;

        public AccountController()
        {
            repo = new CitizenRepository();
        }

        //public AccountController(StoreUserManager userManager, StoreSignInManager signInManager)
        //{
        //    UserManager = userManager;
        //    SignInManager = signInManager;
        //}

        //public StoreSignInManager SignInManager
        //{
        //    get
        //    {
        //        return _signInManager ?? HttpContext.GetOwinContext().Get<StoreSignInManager>();
        //    }
        //    private set
        //    {
        //        _signInManager = value;
        //    }
        //}

        //public StoreUserManager UserManager
        //{
        //    get
        //    {
        //        return _userManager ?? HttpContext.GetOwinContext().GetUserManager<StoreUserManager>();
        //    }
        //    private set
        //    {
        //        _userManager = value;
        //    }
        //}
      
        //public ActionResult Index()
        //{
        //    return View(repo.Products);
        //}
        public async Task<ActionResult> SignIn()
        {
            IAuthenticationManager authMgr = HttpContext.GetOwinContext().Authentication;
            StoreUserManager userMgr = HttpContext.GetOwinContext().GetUserManager<StoreUserManager>();

            User user = await userMgr.FindAsync("Admin", "secret");
            authMgr.SignIn(await userMgr.CreateIdentityAsync(user, DefaultAuthenticationTypes.ApplicationCookie));
            return RedirectToAction("Index", "Home");
        }

        public ActionResult SignOut()
        {
            HttpContext.GetOwinContext().Authentication.SignOut();
            return RedirectToAction("Index", "Home");
        }





        private ActionResult RedirectToLocal(string returnUrl)
        {
            if (Url.IsLocalUrl(returnUrl))
            {
                return Redirect(returnUrl);
            }
            return RedirectToAction("Index", "Home");
        }

        [AllowAnonymous]
        public ActionResult Login(string returnUrl)
        {
            ViewBag.ReturnUrl = returnUrl;
            return View();
        }

        //
        // POST: /Account/Login
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> Login(User model, string returnUrl)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            StoreSignInManager singinMgr = HttpContext.GetOwinContext().Get<StoreSignInManager>();
            
            // This doesn't count login failures towards account lockout
            // To enable password failures to trigger account lockout, change to shouldLockout: true
            var result = await singinMgr.PasswordSignInAsync(model.Email, model.Password, model.RememberMe, shouldLockout: false);
            switch (result)
            {
                case SignInStatus.Success:
                    return RedirectToLocal(returnUrl);
                case SignInStatus.LockedOut:
                    //return View("Lockout");
                case SignInStatus.RequiresVerification:
                    //return RedirectToAction("SendCode", new { ReturnUrl = returnUrl, RememberMe = model.RememberMe });
                case SignInStatus.Failure:
                default:
                    ModelState.AddModelError("", "Invalid login attempt.");
                    return View(model);
            }
        }

        [AllowAnonymous]
        public ActionResult Register()
        {
            return View();
        }


        private void AddErrors(IdentityResult result)
        {
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError("", error);
            }
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult LogOff()
        {
            HttpContext.GetOwinContext().Authentication.SignOut();
            return RedirectToAction("Index", "Home");
        }

        //
        // POST: /Account/Register
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> Register(User model)
        {
            var context = new CitizenDbContext();

            if (ModelState.IsValid)
            {
                StoreUserManager userMgr = new StoreUserManager(new UserStore<User>(context));
                //StoreRoleManager roleMgr = new StoreRoleManager(new RoleStore<StoreRole>(context));
                //StoreSignInManager singinMgr = new StoreSignInManager(HttpContext.GetOwinContext().Get<StoreSignInManager>());
                StoreSignInManager singinMgr = HttpContext.GetOwinContext().Get<StoreSignInManager>();



                var appUser = new User { UserName = model.Email, Email = model.Email};
                var result = await userMgr.CreateAsync(appUser, model.Password);

                if (result.Succeeded)
                {
                    User user = userMgr.FindByName(appUser.Email);
                    userMgr.AddToRole(user.Id, "Users");
                    await singinMgr.SignInAsync(appUser, isPersistent: false, rememberBrowser: false);                     
                    //await SignInManager.SignInAsync(storeUser, isPersistent: false, rememberBrowser: false);

                    // For more information on how to enable account confirmation and password reset please visit http://go.microsoft.com/fwlink/?LinkID=320771
                    // Send an email with this link
                    // string code = await UserManager.GenerateEmailConfirmationTokenAsync(user.Id);
                    // var callbackUrl = Url.Action("ConfirmEmail", "Account", new { userId = user.Id, code = code }, protocol: Request.Url.Scheme);
                    // await UserManager.SendEmailAsync(user.Id, "Confirm your account", "Please confirm your account by clicking <a href=\"" + callbackUrl + "\">here</a>");

                    return RedirectToAction("Index", "Home");
                }
                AddErrors(result);
            }

            // If we got this far, something failed, redisplay form
            return View(model);

            


        }


    }
}
