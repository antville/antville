/**
 * check if user is allowed to delete this skin
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isDeleteDenied(usr) {
   if (usr.isBlocked())
      return ("Sorry, your account was disabled!");
   else if (!this.weblog.isUserAdmin(usr))
      return ("Only admins of this weblog can delete skins!");
   return null;
}

