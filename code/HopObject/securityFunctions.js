/**
 * function checks if there's a site in path
 * if true it checks if the site or the user is blocked
 */

function onRequest() {
   autoLogin();
   // defining skinpath, membershipLevel
   req.data.memberlevel = 0;
   // if root.sys_frontSite is set and the site is online
   // we put it into res.handlers.site to ensure that the mirrored
   // weblog works as expected
   if (!path.site && root.sys_frontSite) {
      if (root.sys_frontSite.online)
         res.handlers.site = root.sys_frontSite;
   }
   if (res.handlers.site) {
      res.skinpath = new Array(res.handlers.site.skins);
      if (session.user) {
         var m = res.handlers.site.members.get(session.user.name);
         if (m)
            req.data.memberlevel = m.level;
      }
      if (res.handlers.site.blocked)
         res.redirect(root.href("blocked"));
   }
   if (session.user && session.user.blocked) {
      // user was blocked recently, so log out
      session.logout();
      res.message = getMessage("error","accountBlocked");
      res.redirect(res.handlers.site ? res.handlers.site.href() : root.href());
   }
}
