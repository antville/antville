/**
 * permission check (called by hopobject.onRequest())
 * @param String name of action
 * @param Obj User object
 * @param Int Membership level
 * @return Obj Exception object or null
 */
function checkAccess(action, usr, level) {
   var deny = null;
   switch (action) {
      case "main" :
         checkIfLoggedIn(this.href(action));
         deny = this.isEditMembersDenied(usr, level);
         break;
      case "subscriptions" :
         checkIfLoggedIn(this.href(action));
         break;
   }
   if (deny != null)
      deny.redirectTo = this._parent.href();
   return deny;
}

/**
 * check if user is allowed to edit the memberlist of this site
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
function isEditMembersDenied(usr, level) {
   if ((level & MAY_EDIT_MEMBERS) == 0)
      return new Exception("memberEditDenied");
   return null;
}

