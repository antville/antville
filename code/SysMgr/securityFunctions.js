/**
 * function is called at each request
 * and checks if user is logged in and is sysadmin
 */
function onRequest() {
   autoLogin();
   checkIfLoggedIn(this.href(req.action));

   if (!session.user || !session.user.sysadmin) {
      res.message = new Exception("userNoSysAdmin");
      res.redirect(root.href());
   }
   // define res.handlers.layout
   res.handlers.layout = root.getLayout();
   res.skinpath = [res.handlers.layout.skins];
   // initialize sysmgr-object in session
   if (!session.data.mgr)
      session.data.mgr = new sysmgr();
   return;
}