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
      this._parent.checkEditMembers(usr, level);
   } catch (deny) {
      res.message = deny.toString();
      res.redirect(this.site.href());
   }
   return;
}

