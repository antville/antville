/**
 * check if user is allowed to edit images
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isEditDenied(usr) {
   if (!usr.uid) {
      usr.cache.referer = this.href();
      return ("Please login before");
   } else if (usr.isBlocked())
      return ("Sorry, your account was disabled!");
   else if (!this._parent.isUserAdmin(usr) && !this._parent.isUserContributor(usr) && !this._parent.userMayContrib())
      return ("Sorry, you're not allowed to edit images!");
   return null;  
}

/**
 * check if user is allowed to add images
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isAddDenied(usr) {
   if (!usr.uid) {
      usr.cache.referer = this.href("create");
      return ("Please login before");
   } else if (usr.isBlocked())
      return ("Sorry, your account was disabled!");
   else if (!this._parent.isUserAdmin(usr) && !this._parent.isUserContributor(usr) && !this._parent.userMayContrib())
      return ("Sorry, you're not allowed to add images!");
   return null;  
}