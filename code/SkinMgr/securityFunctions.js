/**
 * check if user is allowed to edit this image
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */

function isDenied(usr,level) {
   if ((level & MAY_EDIT_SKINS) == 0)
      return "skinEditDenied";
   return null;
}
