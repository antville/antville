/**
 * check if user is allowed to delete this skin
 */

function isDeleteDenied() {
   if (user.isBlocked())
      return ("Sorry, your account was disabled!");
   else if (!this.weblog.isUserAdmin())
      return ("Only admins of this weblog can delete skins!");
   return null;
}

