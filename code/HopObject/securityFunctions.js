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
      // check if the site has a skinset
      var skinsetId = res.handlers.site.preferences.getProperty("skinset");
      if (skinsetId) {
         var skinset = res.handlers.site.skins.get(skinsetId);
         var skinpath = [];
         // loop through skinset parent chain, adding each skinset to the skinpath
         while (skinset) {
            skinpath[skinpath.length] = skinset;
            skinset = skinset.parent;
         }
         res.skinpath = skinpath;
      }
      // set a context handler that contains the context title
      res.handlers.context = {
         title: "site "+res.handlers.site.title
      };
   } else {
      // set a context handler that contains the context title
      res.handlers.context = {
         title: root.sys_title 
      };
   }
   if (session.data.skinset) {
      // test drive a skinset
      session.data.skinset.testdrive();
   }
   if (session.user && session.user.blocked) {
      // user was blocked recently, so log out
      session.logout();
      res.message = new Exception("accountBlocked");
      res.redirect(res.handlers.site ? res.handlers.site.href() : root.href());
   }
   // check access
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
