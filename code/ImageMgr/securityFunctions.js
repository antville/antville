/**
 * permission check (called by hopobject.onRequest())
 * @param String name of action
 * @param Obj User object
 * @param Int Membership level
 * @return Obj Exception object or null
 */
function checkAccess(action, usr, level) {
   checkIfLoggedIn(this.href(req.action));
   var deny = this.isDenied(session.user, req.data.memberlevel);
   if (deny)
      deny.redirectTo = getParent().href();
   return deny;
}

/**
 * check if user is allowed to edit images
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
function isDenied(usr, level) {
   if (!this._parent.preferences.getProperty("usercontrib") && (level & MAY_ADD_IMAGE) == 0)
      return new Exception("imageAddDenied");
   return null;
}
