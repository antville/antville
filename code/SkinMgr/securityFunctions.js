/**
 * check if user is allowed to edit this image
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isDenied(usr) {
   if ((req.data.memberlevel & MAY_EDIT_SKINS) == 0)
      return "skinEditDenied";
   return null;
}
