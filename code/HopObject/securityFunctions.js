/**
 * function checks if there's a site in path
 * if true it checks if the site or the user is blocked
 */

function onRequest() {
   autoLogin();
   // defining skinpath, membershipLevel
   req.data.memberlevel = 0;
   // if root.sys_frontSite is set and the site is online
   // we put it into path.site to ensure that the mirrored
   // weblog works as expected
   if (!path.site && root.sys_frontSite) {
      var s = root.get(root.sys_frontSite);
      if (s && s.online)
         path.site = root.get(root.sys_frontSite);
   }
   if (path.site) {
      res.skinpath = new Array(path.site.skins);
      if (session.user) {
         var m = path.site.members.get(session.user.name);
         if (m)
            req.data.memberlevel = m.level;
      }
      if (path.site.blocked)
         res.redirect(root.href("blocked"));
   }
   if (session.user && session.user.blocked) {
      // user was blocked recently, so log out
      session.logout();
      res.message = getMessage("error","accountBlocked");
      res.redirect(path.site ? path.site.href() : root.href());
   }
}
