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
   // initialize sysmgr-object in session
   if (!session.data.mgr) {
      session.data.mgr = new sysmgr();
      session.data.mgr.searchSites();
      session.data.mgr.searchUsers();
      session.data.mgr.searchSyslog();
   }
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
