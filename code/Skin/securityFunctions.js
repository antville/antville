/**
 * check if user is allowed to delete this skin
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isDeleteDenied(usr) {
   var membership = this.weblog.isUserMember(usr);
   if (!membership)
      return ("You're not a member of this weblog");
   else if ((membership.level & MAY_EDIT_SKINS) == 0)
      return ("Only admins of this weblog can delete skins!");
   return null;
}

