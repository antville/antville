/**
 * check if user is allowed to view poll
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */

function isViewDenied(usr,level) {
   return (this.site.isNotPublic(usr,level));
}


/**
 * check if user is allowed to vote in a poll
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */

function isVoteDenied(usr,level) {
   if (this.site.isNotPublic(usr,level))
      return ("siteNotPublic");
	if (!usr)
		return ("loginBefore");
   if (this.closed)
      return ("pollClosed");
   return null;
}


/**
 * check if user is allowed to edit a poll
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */

function isEditDenied(usr,level) {
   if (this.votes.size() > 0)
      return ("pollEditDenied");
   if (this.creator != usr) {
      if (this.editableby == null && (level & MAY_EDIT_ANYSTORY) == 0)
         return ("storyEditDenied");
      else if (this.editableby == 1 && (level & MAY_ADD_STORY) == 0)
         return ("storyEditDenied");
   }
   return null;
}


/**
 * check if user is allowed to delete a poll
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */

function isDeleteDenied(usr,level) {
   if (this.creator != usr && (level & MAY_DELETE_ANYSTORY) == 0)
      return ("pollDeleteDenied");
   return null;
}