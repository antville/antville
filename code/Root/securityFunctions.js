/**
 * check if user is allowed to create a new weblog
 */

function isAddAllowed() {
   if (!user.uid) {
      res.message = "Please login first!";
      user.cache.referer = root.href("new");
      res.redirect(root.members.href("login"));
   } else if (user.isBlocked()) {
      res.message = "Sorry, your account was disabled!";
      return false;
   } else if (user.getWeblog()) {
      res.message = "You already own a Weblog! You'll need a new account to create another one.";
      res.redirect(root.members.href("register"));
   }
   return true;
}