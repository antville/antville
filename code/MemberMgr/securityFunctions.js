/**
 * check if user is allowed to edit this image
 */

function isEditDenied() {
   if (!user.uid) {
      user.cache.referer = this.href("edit");
      return ("Please login before!");
   } else if (user.isBlocked())
      return ("Sorry, your account was disabled!");
   return null;
}
