/**
 * permission check (called by hopobject.onRequest())
 * @param String name of action
 * @param Obj User object
 * @param Int Membership level
 * @return Obj Exception object or null
 */
function checkAccess(action, usr, level) {
   var deny = null;
   var url = this.site.files.href();
   switch (action) {
      case "edit" :
         checkIfLoggedIn(this.href(req.action));
         deny = this.isEditDenied(usr, level);
         break;
      case "delete" :
         checkIfLoggedIn();
         deny = this.isDeleteDenied(usr, level);
         break;
   }
   if (deny != null)
      deny.redirectTo = url;
   return deny;
}

/**
 * check if user is allowed to edit this file
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
function isEditDenied(usr, level) {
   if (this.creator != usr && (level & MAY_EDIT_ANYFILE) == 0)
      return new Exception("fileEditDenied");
   return null;
}


/**
 * check if user is allowed to delete this file
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
function isDeleteDenied(usr, level) {
   if (this.creator != usr && (level & MAY_DELELTE_ANYIMAGE) == 0)
      return new Exception("fileDeleteDenied");
   return null;
}