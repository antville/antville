/**
 * permission check (called by hopobject.onRequest())
 * @param String name of action
 * @param Obj User object
 * @param Int Membership level
 * @return Obj Exception object or null
 */
function checkAccess(action, usr, level) {
   var deny = null;
   try {
      switch (action) {
         case "main" :
            checkIfLoggedIn(this.href(action));
            this.checkEditMembers(usr, level);
            break;
         case "subscriptions" :
            checkIfLoggedIn(this.href(action));
            break;
      }
   } catch (deny) {
      res.message = deny.toString();
      res.redirect(this._parent.href());
   }
   return;
}

/**
 * check if user is allowed to edit the memberlist of this site
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
function checkEditMembers(usr, level) {
   if ((level & MAY_EDIT_MEMBERS) == 0)
      throw new DenyException("memberEdit");
   return;
}

