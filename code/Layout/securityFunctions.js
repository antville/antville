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
      switch (action) {
         case "main" :
            this.checkEdit(usr, level);
            break;
         case "edit" :
            this.checkEdit(usr, level);
            break;
         case "delete" :
            this.checkEdit(usr, level);
            break;
      }
   } catch (deny) {
      res.message = deny.toString();
      res.redirect(this._parent.href());
   }
   return;
}

/**
 * check if user is allowed to edit this layout
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
function checkEdit(usr, level) {
   if ((level & MAY_EDIT_LAYOUTS) == 0 && !session.user.sysadmin)
      throw new DenyException("skinEditDenied");
   return null;
}
