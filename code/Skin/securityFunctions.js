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
      this.checkDelete(usr, level);
   } catch (deny) {
      res.message = deny.toString();
      res.redirect(this.site.skins.href());
   }
   return;
}


/**
 * check if user is allowed to delete this skin
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
function checkDelete(usr, level) {
   if ((level & MAY_EDIT_LAYOUTS) == 0)
      throw new DenyException("skinDelete");
   return;
}

