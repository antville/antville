/**
 * function checks if there's a site in path
 * if true it checks if the site or the user is blocked
 */

function onRequest() {
   autoLogin();
   // defining skinpath
   if (path.site)
      res.skinpath = new Array(path.site.skins);
   if (path.site && path.site.isBlocked())
      res.redirect(root.href("blocked"));
   if (isUserBlocked()) {
      // user was blocked recently, so log out
      session.logout();
      res.message = getMsg("error","accountBlocked");
      res.redirect(path.site ? path.site.href() : root.href());
   }
}
