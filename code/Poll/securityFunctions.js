/**
 * permission check (called by hopobject.onRequest())
 * @param String name of action
 * @param Obj User object
 * @param Int Membership level
 * @return Obj Exception object or null
 */
function checkAccess(action, usr, level) {
   var deny = null;
   var url = this.site.polls.href();
   switch (action) {
      case "edit" :
         checkIfLoggedIn();
         deny = this.isEditDenied(usr, level);
         break;
      case "delete" :
         checkIfLoggedIn();
         deny = this.isDeleteDenied(usr, level);
         break;
      case "results" :
         deny = this.isViewDenied(usr, level);
         break;
      case "toggle" :
         checkIfLoggedIn();
         deny = this.isDeleteDenied(usr, level);
         break;
   }
   if (deny != null)
      deny.redirectTo = url;
   return deny;
}

/**
 * check if user is allowed to view poll
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
function isViewDenied(usr, level) {
   return this.site.isAccessDenied(usr, level);
}

/**
 * check if user is allowed to vote in a poll
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
function isVoteDenied(usr, level) {
   if (this.site.isAccessDenied(usr, level))
      return new Exception("siteNotPublic");
	if (!usr)
		return new Exception("loginBefore");
   if (this.closed)
      return new Exception("pollClosed");
   return null;
}


/**
 * check if user is allowed to edit a poll
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
function isEditDenied(usr, level) {
   if (this.votes.size() > 0)
      return new Exception("pollEditDenied");
   if (this.creator != usr) {
      if (this.editableby == null && (level & MAY_EDIT_ANYSTORY) == 0)
         return new Exception("storyEditDenied");
      else if (this.editableby == 1 && (level & MAY_ADD_STORY) == 0)
         return new Exception("storyEditDenied");
   }
   return null;
}


/**
 * check if user is allowed to delete a poll
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
function isDeleteDenied(usr, level) {
   if (this.creator != usr && (level & MAY_DELETE_ANYSTORY) == 0)
      return new Exception("pollDeleteDenied");
   return null;
}