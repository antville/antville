/**
 * function checks if user is allowed to view the storylist
 * of this weblog
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isDenied(usr) {
   if (!usr.uid) {
      usr.cache.referer = this.href();
      return ("Please login before!");
   } else if (usr.isBlocked())
      return ("Sorry, your account was disabled!");
   else if (!this._parent.isUserAdmin(usr) && !this._parent.isUserContributor(usr))
      return ("You're not allowed to edit stories!");
   return null;
}

/**
 * check if user is allowed to add a story to this weblog
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isAddDenied(usr) {
   if (!usr.uid) {
      usr.cache.referer = this.href("create");
      return ("Please login before adding a story!");
   } else if (usr.isBlocked())
      return ("Sorry, your account was disabled!");
   else if (!path.weblog.isUserAdmin(usr) && !path.weblog.isUserContributor(usr) && !path.weblog.userMayContrib())
      return ("You're not allowed to add a story to a foreign weblog!");
   return null;
}

