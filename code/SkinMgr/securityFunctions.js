/**
 * check if user is allowed to edit this image
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isDenied(usr) {
   var membership = this._parent.isUserMember(usr);
   if (!membership)
      return ("You're not a member of this weblog!");
   else if ((membership.level & MAY_EDIT_SKINS) == 0)
      return ("You're not allowed to edit skins!");
   return null;
}
