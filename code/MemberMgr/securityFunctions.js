/**
 * check if user is allowed to edit the memberlist of this site
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isEditMembersDenied(usr) {
   var membership = this.get(usr.name);
   if (!membership || (membership.level & MAY_EDIT_MEMBERS) == 0)
      return (getMsg("error","memberEditDenied"));
   return null;
}

