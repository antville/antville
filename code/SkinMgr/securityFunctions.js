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
      this.checkEdit(usr, level);
   } catch (deny) {
      res.message = deny.toString();
      res.redirect(this._parent.href());
   }
   return;
}


/**
 * check if user is allowed to edit skins
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
function checkEdit(usr, level) {
   if ((level & MAY_EDIT_SKINS) == 0 && !session.user.sysadmin)
      throw new DenyException("skinEdit");
   return;
}
