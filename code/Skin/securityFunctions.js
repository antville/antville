/**
 * check if user is allowed to delete this skin
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isDeleteDenied(usr) {
   if ((req.data.memberlevel & MAY_EDIT_SKINS) == 0)
      return "skinDeleteDenied";
   return null;
}

