/**
 * check if user is allowed to edit this image
 */

function isEditDenied() {
   if (!user.uid) {
      user.cache.referer = this.href();
      return ("Please login before!");
   } else if (user.isBlocked())
      return ("Sorry, your account was disabled!");
   else if (!this._parent.isUserAdmin())
      return ("Sorry, your're not allowed to edit skins!");
   return null;
}
