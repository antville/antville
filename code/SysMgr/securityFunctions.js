/**
 * function is called at each request
 * and checks if user is logged in and is sysadmin
 */

function onRequest() {
   autoLogin();
   checkIfLoggedIn(this.href(req.action));
   
   var deny = this.isDenied(session.user);
   if (deny) {
      res.message = deny;
      res.redirect(root.href());
   }
   // need a sysmgr-object in session for searching
   if (!session.data.mgr)
      session.data.mgr = new sysmgr();
}

/**
 * function checks if user has the right to access
 * system manager
 */

function isDenied(usr) {
   if (!usr.isSysAdmin())
      return (getMsg("error","userNoSysAdmin"));
   return null;
}
