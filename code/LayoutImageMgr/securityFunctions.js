/**
 * check if user is allowed to add pictures
 * (overwrites ImageMgr.checkAdd())
 * @see ImageMgr/securityFunctions.js
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
function checkAdd(usr, level) {
   if (this._parent.site) {
      if ((level & MAY_EDIT_LAYOUTS) == 0)
         throw new DenyException("layoutEdit");
   } else if (!usr.sysadmin)
      throw new DenyException("imageAdd");
   return;
}
