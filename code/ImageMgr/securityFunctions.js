/**
 * check if user is allowed to edit images
 */

function isEditDenied() {
   if (!user.uid) {
      user.cache.referer = this.href();
      return ("Please login before");
   } else if (user.isBlocked())
      return ("Sorry, your account was disabled!");
   else if (!this._parent.isUserAdmin() && !this._parent.isUserContributor() && !this._parent.userMayContrib())
      return ("Sorry, you're not allowed to edit images!");
   return null;  
}

/**
 * check if user is allowed to add images
 */

function isAddDenied() {
   if (!user.uid) {
      user.cache.referer = this.href("create");
      return ("Please login before");
   } else if (user.isBlocked())
      return ("Sorry, your account was disabled!");
   else if (!this._parent.isUserAdmin() && !this._parent.isUserContributor() && !this._parent.userMayContrib())
      return ("Sorry, you're not allowed to add images!");
   return null;  
}