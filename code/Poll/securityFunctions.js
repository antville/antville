/**
 * check if user is allowed to view poll
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isViewDenied(usr) {
   if (this.weblog.isNotPublic(usr))
      return ("Sorry, this weblog is not public!");
   return null;
}


function isVoteDenied(usr) {
   if (this.weblog.isNotPublic(usr))
      return ("Sorry, this weblog is not public!");
	if (!usr)
		return ("Please login before");
   if (this.closed)
      return("This poll is closed.");
   return null;
}


function isPostDenied(usr) {
   if (!this.weblog.isOnline() && !this.weblog.isUserMember(usr))
      return ("This weblog is not public!");
   else if (!this.weblog.hasDiscussions())
      return ("Sorry, discussions were disabled for this weblog!");
   return null;
}


function isEditDenied(usr) {
	 if (this.votes.size() > 0)
	 		return("Sorry, but modifying a running poll is prohibited.");
   if (this.creator != usr) {
      var membership = this.weblog.isUserMember(usr);
      if (!membership)
         return ("You're not a member of this weblog!");
      else if (this.editableby == null && (membership.level & MAY_EDIT_ANYSTORY) == 0)
         return ("You're not allowed to edit this story!");
      else if (this.editableby == 1 && (membership.level & MAY_ADD_STORY) == 0)
         return ("You're not allowed to edit this story!");
   }
   return null;
}


function isDeleteDenied(usr) {
   if (this.creator != usr) {
      var membership = this.weblog.isUserMember(usr);
      if (!membership)
         return ("You're not a member of this weblog!");
      else if ((membership.level & MAY_DELETE_ANYSTORY) == 0)
         return ("You cannot delete the story of somebody else!");
   }
   return null;
}

