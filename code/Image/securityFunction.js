/**
 * check if user is allowed to edit this image
 */

function isEditDenied() {
   if (!user.uid) {
      user.cache.referer = this.href("edit");
      return ("Please login first!");
   } else if (user.isBlocked())
      return ("Sorry, your account was disabled!");
   else if (this.creator != user && !this.weblog.isUserAdmin())
      return ("Sorry, this image belongs to someone else!");
   return null;
}


/**
 * check if user is allowed to delete this image
 */

function isDeleteDenied() {
   if (user.isBlocked())
      return ("Sorry, your account was disabled!");
   else if (this.creator != user && !this.weblog.isUserAdmin())
      return ("Sorry, this image belongs to someone else!");
   return null;
}
