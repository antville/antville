/**
 * function is called at each request
 * and checks if user is logged in and is sysadmin
 */
function onRequest() {
   HopObject.prototype.onRequest.apply(this);
   if (!session.user || !session.user.sysadmin) {
      res.message = new Exception("userNoSysAdmin");
      res.redirect(root.href());
   }
   // initialize sysmgr-object in session
   if (!session.data.mgr)
      session.data.mgr = new sysmgr();
   return;
}