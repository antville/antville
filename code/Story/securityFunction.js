/**
 * check if user is allowed to post a comment to this story
 */

function isPostDenied() {
   if (!this.weblog.isOnline())
      return ("This weblog is not public!");
   else if (!this.weblog.hasDiscussions())
      return ("Sorry, discussions were disabled for this weblog!");
   else if (!user.uid) {
      user.cache.referer = this.href("comment");
      return ("Please login before adding a comment!");
   } else if (user.isBlocked())
      return ("Sorry, your account was disabled!");
   return null;
}

/**
 * check if user is allowed to delete this story
 */

function isDeleteDenied() {
   if (user.isBlocked())
      return ("Sorry, your account was disabled!");
   else if (!this.weblog.isUserAdmin() && this.author != user)
      return ("You cannot delete the story of somebody else!");
   return null;
}

/**
 * check if user is allowed to edit this story
 */

function isEditDenied() {
   if (user.isBlocked())
      return ("Sorry, your accout was disabled!");
   if (this.author == user)
      return null;
   if (!this.weblog.isUserMember() || this.editableby > this.weblog.members.get(user.name).level)
      return ("You're not allowed to edit this story!");
   return null;
}


/**
 * check if this story should appear or not
 */

function isViewAllowed() {
   if (this.author == user || this.weblog.isUserAdmin())
      return true;
   if (this.weblog.isUserMember() && this.editableby <= this.weblog.members.get(user.name).level)
      return true;
   return false;
}