/**
 * check if user is allowed to edit this goodie
 */

function isEditDenied() {
   if (!user.uid) {
      user.cache.referer = this.href("edit");
      return ("Please login first!");
   } else if (user.isBlocked())
      return ("Sorry, your account was disabled!");
   else if (this.creator != user && !this.weblog.isUserAdmin())
      return ("Sorry, this goodie belongs to someone else!");
   return null;
}


/**
 * check if user is allowed to delete this goodie
 */

function isDeleteDenied() {
   if (user.isBlocked())
      return ("Sorry, your account was disabled!");
   else if (this.creator != user && !this.weblog.isUserAdmin())
      return ("Sorry, this goodie belongs to someone else!");
   return null;
}
