/**
 * check if user is allowed to delete a comment
 */

function isDeleteAllowed() {
   if (this.weblog.owner != user) {
      res.message = "This is not your weblog, so you can't delete any postings!";
      return false;
   }
   return true;
}

/**
 * check if user is allowed to edit a comment
 */

function isEditAllowed() {
   if (this.author != user) {
      res.message = "Sorry, you're not allowed to edit a posting of somebody else!";
      return false;
   } else if (!this.weblog.hasDiscussions()) {
      res.message = "Sorry, discussions were disabled for this weblog!";
      return false;
   }
   return true;
}

/**
 * check if user is allowed to reply to a comment
 */

function isReplyAllowed() {
   if (!this.weblog.hasDiscussions()) {
      res.message = "Sorry, discussions were disabled for this weblog!";
      return false;
   } else if (!user.uid) {
      user.cache.referer = this.href("reply");
      return false;
   } else if (user.isBlocked()) {
      res.message = "Sorry, your account was disabled!";
      return false;
   }
   return true;
}