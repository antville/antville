/**
 * function is called at each request
 * and checks if user is logged in and is sysadmin
 */

function onRequest() {
   autoLogin();
   checkIfLoggedIn(this.href(req.action));
   
   var deny = this.isDenied(user);
   if (deny) {
      res.message = deny;
      res.redirect(root.href());
   }
   // need a sysmgr-object in user-cache for searching
   if (!user.cache.mgr)
      user.cache.mgr = new sysmgr();
}

/**
 * function checks if user has the right to access
 * system manager
 */

function isDenied(usr) {
   if (!usr.isSysAdmin())
      return ("You're not allowed to do this!");
   return null;
}
