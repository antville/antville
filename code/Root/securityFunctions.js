/**
 * check if user is allowed to create a new weblog
 */

function isAddDenied() {
   if (!user.uid) {
      user.cache.referer = root.href("new");
      return ("Please login first!");
   } else if (user.isBlocked())
      return ("Sorry, your account was disabled!");
   return null;
}