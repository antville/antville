/**
 * check if user is allowed to edit the memberlist of this site
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */

function isEditMembersDenied(usr,level) {
   if ((level & MAY_EDIT_MEMBERS) == 0)
      return ("memberEditDenied");
   return null;
}

