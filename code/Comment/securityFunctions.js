/**
 * check if user is allowed to delete a comment
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isDeleteDenied(usr) {
   if (!this.weblog.isUserAdmin(usr))
      return ("You're not admin of this weblog, so you can't delete any postings!");
   return null;
}

/**
 * check if user is allowed to edit a comment
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isEditDenied(usr) {
   if (this.author != usr && !this.weblog.isUserAdmin(usr))
      return ("Sorry, you're not allowed to edit a posting of somebody else!");
   else if (!this.weblog.hasDiscussions())
      return ("Sorry, discussions were disabled for this weblog!");
   return null;
}

/**
 * check if user is allowed to reply to a comment
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isReplyDenied(usr) {
   if (!this.weblog.hasDiscussions())
      return ("Sorry, discussions were disabled for this weblog!");
   else if (!usr.uid) {
      usr.cache.referer = this.href("reply");
      return ("Please login first!");
   } else if (usr.isBlocked())
      return ("Sorry, your account was disabled!");
   return null;
}

/**
 * function explicitly allowes some macros for use in the text of a story
 * @param Obj Skin-object to allow macros for
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