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
   } else if (!this.weblog.isUserAdmin() && this.author != user) {
      res.message = "You cannot delete the story of somebody else!";
      return false;
   }
   return true;
}

/**
 * check if user is allowed to edit this story
 */

function isEditAllowed() {
   if (user.isBlocked())
      return false;
   if (this.author == user)
      return true;
   if (this.weblog.isUserMember() && this.editableby <= this.weblog.members.get(user.name).level)
      return true;
   return false;
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