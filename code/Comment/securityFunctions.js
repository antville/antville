/**
 * check if user is allowed to delete a comment
 */

function isDeleteDenied() {
   if (!this.weblog.isUserAdmin())
      return ("You're not admin of this weblog, so you can't delete any postings!");
   return null;
}

/**
 * check if user is allowed to edit a comment
 */

function isEditDenied() {
   if (this.author != user && !this.weblog.isUserAdmin())
      return ("Sorry, you're not allowed to edit a posting of somebody else!");
   else if (!this.weblog.hasDiscussions())
      return ("Sorry, discussions were disabled for this weblog!");
   return null;
}

/**
 * check if user is allowed to reply to a comment
 */

function isReplyDenied() {
   if (!this.weblog.hasDiscussions())
      return ("Sorry, discussions were disabled for this weblog!");
   else if (!user.uid) {
      user.cache.referer = this.href("reply");
      return ("Please login first!");
   } else if (user.isBlocked())
      return ("Sorry, your account was disabled!");
   return null;
}