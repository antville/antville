/**
 * check if user is allowed to post a comment to this story
 */

function isPostAllowed() {
   if (!this.weblog.hasDiscussions()) {
      res.message = "Sorry, discussions were disabled for this weblog!";
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
   } else if (this.author != user) {
      res.message = "You cannot edit the story of somebody else!";
      return false;
   }
   return true;
}