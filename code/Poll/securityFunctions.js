/**
 * check if user is allowed to view poll
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isViewDenied(usr) {
   return (this.site.isNotPublic(usr));
}


/**
 * check if user is allowed to vote in a poll
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isVoteDenied(usr) {
   if (this.site.isNotPublic(usr))
      return ("siteNotPublic");
	if (!usr)
		return ("loginBefore");
   if (this.closed)
      return ("pollClosed");
   return null;
}


/**
 * check if user is allowed to create a poll
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isPostDenied(usr) {
   if (!this.site.online && !req.data.memberlevel)
      return ("siteNotPublic");
   else if (!this.site.discussions)
      return ("siteNoDiscussion");
   return null;
}


/**
 * check if user is allowed to edit a poll
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isEditDenied(usr) {
   if (this.votes.size() > 0)
      return ("pollEditDenied");
   if (this.creator != usr) {
      if (this.editableby == null && (req.data.memberlevel & MAY_EDIT_ANYSTORY) == 0)
         return ("storyEditDenied");
      else if (this.editableby == 1 && (req.data.memberlevel & MAY_ADD_STORY) == 0)
         return ("storyEditDenied");
   }
   return null;
}


/**
 * check if user is allowed to delete a poll
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isDeleteDenied(usr) {
   if (this.creator != usr) {
      if (!req.data.memberlevel || (membership.level & MAY_DELETE_ANYSTORY) == 0)
         return ("storyDeleteDenied");
   }
   return null;
}