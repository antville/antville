/**
 * permission check (called by hopobject.onRequest())
 * @param String name of action
 * @param Obj User object
 * @param Int Membership level
 * @return Obj Exception object or null
 */
function checkAccess(action, usr, level) {
   checkIfLoggedIn(this.href(req.action));
   try {
      this.checkAdd(session.user, req.data.memberlevel);
   } catch (deny) {
      res.message = deny.toString();
      res.redirect(this._parent.href());
   }
   return;
}

/**
 * check if user is allowed to add files
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return Obj Exception or null
 */
function checkAdd(usr, level) {
   if (!this._parent.preferences.getProperty("usercontrib") && (level & MAY_ADD_FILE) == 0)
      throw new DenyException("fileAdd");
   return;
}
