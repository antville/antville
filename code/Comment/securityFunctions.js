/**
 * check if user is allowed to edit a comment
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */

function isEditDenied(usr,level) {
   if (this.creator != usr && (level & MAY_EDIT_ANYCOMMENT) == 0)
      return "commentEditDenied";
   return null;
}
