/**
 * check if user is allowed to create a new weblog
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isAddDenied(usr) {
   if (!usr.uid) {
      usr.cache.referer = root.href("new");
      return ("Please login first!");
   } else if (usr.isBlocked())
      return ("Sorry, your account was disabled!");
   return null;
}