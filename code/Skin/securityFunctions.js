/**
 * permission check (called by hopobject.onRequest())
 * @param String name of action
 * @param Obj User object
 * @param Int Membership level
 * @return Obj Exception object or null
 */
function checkAccess(action, usr, level) {
   checkIfLoggedIn(this.href(req.action));
   var deny = this.isDeleteDenied(usr, level);
   if (deny)
      deny.redirectTo = this.site.skins.href();
   return deny;
}


/**
 * check if user is allowed to delete this skin
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
function isDeleteDenied(usr, level) {
   if ((level & MAY_EDIT_SKINS) == 0)
      return new Exception("skinDeleteDenied");
   return null;
}

