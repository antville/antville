/**
 * check if user is allowed to edit this image
 */

function isEditAllowed() {
   if (!user.uid) {
      user.cache.referer = this.href("edit");
      return false;
   } else if (user.isBlocked()) {
      res.message = "Sorry, your account was disabled!";
      return false;
   } else if (this.creator != user) {
      res.message = "Sorry, this image belongs to someone else!";
      return false;
   }
   return true;
}


/**
 * check if user is allowed to delete this image
 */

function isDeleteAllowed() {
   if (user.isBlocked()) {
      res.message = "Sorry, your account was disabled!";
      return false;
   } else if (this.creator != user && !this.weblog.isUserAdmin()) {
      res.message = "Sorry, this image belongs to someone else!";
      return false;
   }
   return true;
}
