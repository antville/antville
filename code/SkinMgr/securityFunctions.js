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
   } else if (this.__parent__.owner != user) {
      res.message = "Sorry, your're not allowed to edit skins!";
      return false;
   }
   return true;
}
