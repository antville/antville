/**
 * check if user is allowed to edit this image
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isEditDenied(usr) {
   if (!usr.uid) {
      usr.cache.referer = this.href("edit");
      return ("Please login before!");
   } else if (usr.isBlocked())
      return ("Sorry, your account was disabled!");
   return null;
}
