/**
 * function checks if user is allowed to view the storylist
 * of this weblog
 */

function isDenied() {
   if (!user.uid) {
      user.cache.referer = this.href();
      return ("Please login before!");
   } else if (user.isBlocked())
      return ("Sorry, your account was disabled!");
   else if (!this._parent.isUserAdmin() && !this._parent.isUserContributor())
      return ("You're not allowed to edit stories!");
   return null;
}

/**
 * check if user is allowed to add a story to this weblog
 */

function isAddDenied() {
   if (!user.uid) {
      user.cache.referer = this.href("create");
      return ("Please login before adding a story!");
   } else if (user.isBlocked())
      return ("Sorry, your account was disabled!");
   else if (!path.weblog.isUserAdmin() && !path.weblog.isUserContributor() && !path.weblog.userMayContrib())
      return ("You're not allowed to add a story to a foreign weblog!");
   return null;
}

