/**
 * check if user is allowed to edit images
 */

function isEditAllowed() {
   if (!user.uid) {
      user.cache.referer = this.href();
      return false;
   } else if (user.isBlocked()) {
      res.message = "Sorry, your account was disabled!";
      return false;
   } else if (!this.__parent__.isUserAdmin() && !this.__parent__.isUserContributor() && !this.__parent__.userMayContrib()) {
      res.message = "Sorry, you're not allowed to edit images!";
      return false;
   }
   return true;  
}

/**
 * check if user is allowed to add images
 */

function isAddAllowed() {
   if (!user.uid) {
      user.cache.referer = this.href("create");
      return false;
   } else if (user.isBlocked()) {
      res.message = "Sorry, your account was disabled!";
      return false;
   } else if (!this.__parent__.isUserAdmin() && !this.__parent__.isUserContributor() && !this.__parent__.userMayContrib()) {
      res.message = "Sorry, you're not allowed to add images!";
      return false;
   }
   return true;  
}