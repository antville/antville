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
   if (this.author == user || this.weblog.isUserAdmin())
      return null;
   if (!this.weblog.isUserMember() || this.editableby > this.weblog.members.get(user.name).level)
      return ("You're not allowed to edit this story!");
   return null;
}


/**
 * check if user is allowed to view story
 */

function isViewDenied() {
   if (user.isBlocked())
      return ("Sorry, your account was disabled!");
   if (!this.isOnline() && this.author != user) {
      if (!this.weblog.isUserAdmin())
         return ("You're not allowed to see this story!");
      else if (!this.weblog.isUserMember())
         return ("You're not allowed to see this story!");
      else if (this.editableby <= this.weblog.members.get(user.name).level)
         return ("You're not allowed to see this story!");
   } else if (this.weblog.isNotPublic())
      return ("Sorry, this weblog is not public!");
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