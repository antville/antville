/**
 * function checks if there's a site in path
 * if true it checks if the site or the user is blocked
 */
function onRequest() {
   autoLogin();
   // defining skinpath, membershipLevel
   req.data.memberlevel = null;
   // if root.sys_frontSite is set and the site is online
   // we put it into res.handlers.site to ensure that the mirrored
   // weblog works as expected
   if (!path.site && root.sys_frontSite && root.sys_frontSite.online)
      res.handlers.site = root.sys_frontSite;
   if (res.handlers.site) {
      if (res.handlers.site.blocked)
         res.redirect(root.href("blocked"));
      if (session.user)
         req.data.memberlevel = res.handlers.site.members.getMembershipLevel(session.user);
      // set a handler that contains the context
      res.handlers.context = res.handlers.site;
   } else {
      // set a handler that contains the context
      res.handlers.context = root;
   }

   if (session.data.layout) {
      // test drive a layout
      res.handlers.layout = session.data.layout;
      res.message = session.data.layout.renderSkinAsString("testdrive");
   } else {
      // define layout handler
      res.handlers.layout = res.handlers.context.getLayout();
   }

   // set skinpath
   res.skinpath = res.handlers.layout.getSkinPath();

   if (session.user && session.user.blocked) {
      // user was blocked recently, so log out
      session.logout();
      res.message = new Exception("accountBlocked");
      res.redirect(res.handlers.context.href());
   }
   // check access, but only if user is *not* a sysadmin
   // sysadmins are allowed to to everything
   if (!session.user || !session.user.sysadmin)
      this.checkAccess(req.action, session.user, req.data.memberlevel);
   return;
}

/**
 * basic permission check function
 * this method is overwritten by most of the other prototypes
 */
function checkAccess() {
   return;
}
