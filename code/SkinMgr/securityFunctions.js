/**
 * check if user is allowed to edit this image
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isEditDenied(usr) {
   if (!usr.uid) {
      usr.cache.referer = this.href();
      return ("Please login before!");
   } else if (usr.isBlocked())
      return ("Sorry, your account was disabled!");
   else if (!this._parent.isUserAdmin(usr))
      return ("Sorry, your're not allowed to edit skins!");
   return null;
}
