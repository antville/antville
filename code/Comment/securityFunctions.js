/**
 * permission check (called by hopobject.onRequest())
 * @param String name of action
 * @param Obj User object
 * @param Int Membership level
 * @return Obj Exception object or null
 */
function checkAccess(action, usr, level) {
   var deny = null;
   var url = this.story.href();
   switch (action) {
      case "edit" :
         if (!usr && req.data.save)
            rescueText(req.data);
         checkIfLoggedIn(this.href(req.action));
         deny = this.isEditDenied(usr, level);
         break;
      case "delete" :
         checkIfLoggedIn();
         deny = this.isDeleteDenied(usr, level);
         break;
      case "comment" :
         if (!usr && req.data.save)
            rescueText(req.data);
         checkIfLoggedIn(this.href(req.action));
         deny = this.story.isPostDenied(usr, level);
         break;
   }
   if (deny != null)
      deny.redirectTo = url;
   return deny;
}

/**
 * check if user is allowed to edit a comment
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
function isEditDenied(usr, level) {
   if (this.creator != usr && (level & MAY_EDIT_ANYCOMMENT) == 0)
      return new Exception("commentEditDenied");
   return null;
}
