/**
 * check if user is allowed to edit this image
 */

function isEditDenied(usr) {
   if (this.creator != usr && (req.data.memberlevel & MAY_EDIT_ANYIMAGE) == 0)
      return ("imageEditDenied");
   return null;
}