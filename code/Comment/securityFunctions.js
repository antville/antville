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

/**
 * function explicitly allowes some macros for use in the text of a story
 */

function allowTextMacros(s) {
   s.allowMacro("image");
   s.allowMacro("this.image");
   s.allowMacro("weblog.image");
   s.allowMacro("story.image");
   s.allowMacro("thumbnail");
   s.allowMacro("this.thumbnail");
   s.allowMacro("weblog.thumbnail");
   s.allowMacro("story.thumbnail");
   s.allowMacro("link");
   s.allowMacro("this.link");
   s.allowMacro("weblog.link");
   s.allowMacro("story.link");
   s.allowMacro("goodie");
   return;
}