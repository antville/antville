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
      deny.redirectTo = this._parent.href();
   return deny;
}

/**
 * check if user is allowed to edit files
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return Obj Exception or null
 */
function isDenied(usr, level) {
   if (!this._parent.preferences.getProperty("usercontrib") && (level & MAY_ADD_FILE) == 0)
      return new Exception("fileAddDenied");
   return null;
}
