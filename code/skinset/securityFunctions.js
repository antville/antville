/**
 * permission check (called by hopobject.onRequest())
 * @param String name of action
 * @param Obj User object
 * @param Int Membership level
 * @return Obj Exception object or null
 */
function checkAccess(action, usr, level) {
   checkIfLoggedIn(this.href(req.action));
   var deny = this.isDenied(usr, level);
   if (deny)
      deny.redirectTo = this._parent.href();
   return deny;
}

/**
 * check if user is allowed to edit this skinset
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */

function isDenied(usr,level) {
   if ((level & MAY_EDIT_SKINS) == 0 && !session.user.sysadmin)
      return new Exception("skinEditDenied");
   return null;
}

/**
 *  Check if user is allowed to delete this skinset.
 */
function isDeleteDenied(usr,level) {
   if ((level & MAY_EDIT_SKINS) == 0 && !session.user.sysadmin)
      return new Exception("skinDeleteDenied");
   return null;
}

