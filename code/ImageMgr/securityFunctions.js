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
 * check if user is allowed to add images
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
function checkAdd(usr, level) {
   if (path.site) {
      if (!path.site.preferences.getProperty("usercontrib") && (level & MAY_ADD_IMAGE) == 0)
         throw new DenyException("imageAdd");
   } else {
      if (!session.user || !session.user.sysadmin)
         throw new DenyException("imageAdd");
   }
   return;
}
