/**
 * permission check (called by hopobject.onRequest())
 * @param String name of action
 * @param Obj User object
 * @param Int Membership level
 * @return Obj Exception object or null
 */
function checkAccess(action, usr, level) {
   checkIfLoggedIn(this.href(req.action));
   var deny = this._parent.isEditMembersDenied(usr, level);
   if (deny)
      deny.redirectTo = this.site.href();
   return deny;
}

