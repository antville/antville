/**
 * check if user is allowed to edit this image
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */

function isEditDenied(usr,level) {
   if (this.creator != usr && (level & MAY_EDIT_ANYIMAGE) == 0)
      return ("imageEditDenied");
   return null;
}