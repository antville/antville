/**
 * permission check (called by hopobject.onRequest())
 * @param String name of action
 * @param Obj User object
 * @param Int Membership level
 * @return Obj Exception object or null
 */
function checkAccess(action, usr, level) {
   try {
      switch (action) {
         case "edit" :
            checkIfLoggedIn(this.href(req.action));
            this.checkEdit(usr, level);
            break;
         case "delete" :
            checkIfLoggedIn();
            this.checkDelete(usr, level);
            break;
      }
   } catch (deny) {
      res.message = deny.toString();
      res.redirect(this.site.files.href());
   }
   return;
}

/**
 * check if user is allowed to edit a file
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
function checkEdit(usr, level) {
   if (this.creator != usr && (level & MAY_EDIT_ANYFILE) == 0)
      throw new DenyException("fileEdit");
   return;
}


/**
 * check if user is allowed to delete a file
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
function checkDelete(usr, level) {
   if (this.creator != usr && (level & MAY_DELETE_ANYIMAGE) == 0)
      throw new DenyException("fileDelete");
   return;
}
