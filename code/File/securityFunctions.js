/**
 * check if user is allowed to edit this file
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */

function isEditDenied(usr,level) {
   if (this.creator != usr && (level & MAY_EDIT_ANYFILE) == 0)
      return ("fileEditDenied");
   return null;
}
