/**
 * check if user is allowed to delete this skin
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isDeleteDenied(usr) {
   var membership = this.site.isUserMember(usr);
   if (!membership)
      return (getMsg("error","userNoMember"));
   else if ((membership.level & MAY_EDIT_SKINS) == 0)
      return (getMsg("error","skinDeleteDenied"));
   return null;
}

