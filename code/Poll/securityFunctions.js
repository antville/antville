/**
 * check if user is allowed to view poll
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isViewDenied(usr) {
   if (this.site.isNotPublic(usr))
      return (getMsg("error","siteNotPublic"));
   return null;
}


function isVoteDenied(usr) {
   if (this.site.isNotPublic(usr))
      return (getMsg("error","siteNotPublic"));
	if (!usr)
		return (getMsg("error","loginBefore"));
   if (this.closed)
      return (getMsg("error","pollClosed"));
   return null;
}


function isPostDenied(usr) {
   if (!this.site.isOnline() && !this.site.isUserMember(usr))
      return (getMsg("error","siteNotPublic"));
   else if (!this.site.hasDiscussions())
      return (getMsg("error","siteNoDiscussion"));
   return null;
}


function isEditDenied(usr) {
	 if (this.votes.size() > 0)
	 		return (getMsg("error","pollEditDenied"));
   if (this.creator != usr) {
      var membership = this.site.isUserMember(usr);
      if (!membership)
         return (getMsg("error","userNoMember"));
      else if (this.editableby == null && (membership.level & MAY_EDIT_ANYSTORY) == 0)
         return (getMsg("error","storyEditDenied"));
      else if (this.editableby == 1 && (membership.level & MAY_ADD_STORY) == 0)
         return (getMsg("error","storyEditDenied"));
   }
   return null;
}


function isDeleteDenied(usr) {
   if (this.creator != usr) {
      var membership = this.site.isUserMember(usr);
      if (!membership)
         return (getMsg("error","userNoMember"));
      else if ((membership.level & MAY_DELETE_ANYSTORY) == 0)
         return (getMsg("error","storyDeleteDenied"));
   }
   return null;
}

