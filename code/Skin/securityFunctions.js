/**
 * check if user is allowed to delete this skin
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */

function isDeleteDenied(usr,level) {
   if ((level & MAY_EDIT_SKINS) == 0)
      return "skinDeleteDenied";
   return null;
}

