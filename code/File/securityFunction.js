/**
 * check if user is allowed to edit this file
 */

function isEditDenied(usr) {
   if (this.creator != usr && (req.data.memberlevel & MAY_EDIT_ANYFILE) == 0)
      return ("fileEditDenied");
   return null;
}
