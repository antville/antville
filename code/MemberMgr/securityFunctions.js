/**
 * check if user is allowed to edit the memberlist of this site
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isEditMembersDenied(usr) {
   if ((req.data.memberlevel & MAY_EDIT_MEMBERS) == 0)
      return ("memberEditDenied");
   return null;
}

