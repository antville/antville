/**
 * check if user is allowed to post a comment to this story
 */

function isPostAllowed() {
   if (!this.weblog.hasDiscussions()) {
      res.message = "Sorry, discussions were disabled for this weblog!";
      return false;
   } else if (!user.uid) {
      user.cache.referer = this.href("comment");
      return false;
   } else if (user.isBlocked()) {
      res.message = "Sorry, your account was disabled!";
      return false;
   }
   return true;
}

/**
 * check if user is allowed to delete this story
 */

function isDeleteAllowed() {
   if (user.isBlocked()) {
      res.message = "Sorry, your account was disabled!";
      return false;
   } else if (this.author != user) {
      res.message = "You cannot delete the story of somebody else!";
      return false;
   }
   return true;
}

/**
 * check if user is allowed to edit this story
 */

function isEditAllowed() {
   if (user.isBlocked()) {
      res.message = "Sorry, your account was disabled!";
      return false;
   } else if (!this.weblog.isUserMember()) {
      res.message = "Sorry, editing is only allowed for registered Users!";
      return false;
   } else if (this.author != user && this.editableby > this.weblog.members.get(user.name).level) {
      res.message = "Sorry, you're not allowed to edit this story!";
      return false;
   }
   return true;
}
