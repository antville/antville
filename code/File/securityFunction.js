/**
 * check if user is allowed to edit this goodie
 */

function isEditDenied(usr) {
   if (!usr.uid) {
      usr.cache.referer = this.href("edit");
      return ("Please login first!");
   } else if (usr.isBlocked())
      return ("Sorry, your account was disabled!");
   else if (this.creator != usr && !this.weblog.isUserAdmin(usr))
      return ("Sorry, this goodie belongs to someone else!");
   return null;
}


/**
 * check if user is allowed to delete this goodie
 */

function isDeleteDenied(usr) {
   if (usr.isBlocked())
      return ("Sorry, your account was disabled!");
   else if (this.creator != usr && !this.weblog.isUserAdmin(usr))
      return ("Sorry, this goodie belongs to someone else!");
   return null;
}
