/**
 * permission check (called by hopobject.onRequest())
 * @param String name of action
 * @param Obj User object
 * @param Int Membership level
 * @return Obj Exception object or null
 */
function checkAccess(action, usr, level) {
   var deny = this._parent.isAccessDenied(usr, level);
   if (deny)
      deny.redirectTo = this._parent.members.href("login");
   return deny;
}
