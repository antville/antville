/**
 * function checks if there's a weblog in path
 * if true it checks if the weblog or the user is blocked
 */

function onRequest() {
   autoLogin();
   // defining skinpath
   if (path.weblog)
      res.skinpath = new Array(path.weblog.skins);
   if (path.weblog && path.weblog.isBlocked())
      res.redirect(root.href("blocked"));
   if (user.isBlocked()) {
      // user was blocked recently, so log out
      user.logout();
      res.message = "Your account was blocked!";
      res.redirect(path.weblog ? path.weblog.href() : root.href());
   }
}
