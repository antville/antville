/**
 * check if user is allowed to post a comment to this story
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isPostDenied(usr) {
   if (!this.weblog.isOnline() && !this.weblog.isUserMember(usr))
      return ("This weblog is not public!");
   else if (!this.weblog.hasDiscussions())
      return ("Sorry, discussions were disabled for this weblog!");
   else if (!usr.uid) {
      usr.cache.referer = this.href("comment");
      return ("Please login before adding a comment!");
   } else if (usr.isBlocked())
      return ("Sorry, your account was disabled!");
   return null;
}

/**
 * check if user is allowed to delete this story
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isDeleteDenied(usr) {
   if (usr.isBlocked())
      return ("Sorry, your account was disabled!");
   else if (!this.weblog.isUserAdmin(usr) && this.author != usr)
      return ("You cannot delete the story of somebody else!");
   return null;
}

/**
 * check if user is allowed to edit this story
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isEditDenied(usr) {
   if (usr.isBlocked())
      return ("Sorry, your accout was disabled!");
   if (this.author == usr || this.weblog.isUserAdmin(usr))
      return null;
   if (!this.weblog.isUserMember(usr) || this.editableby > this.weblog.members.get(usr.name).level)
      return ("You're not allowed to edit this story!");
   return null;
}


/**
 * check if user is allowed to view story
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isViewDenied(usr) {
   if (usr.isBlocked())
      return ("Sorry, your account was disabled!");
   if (!this.isOnline() && this.author != usr) {
      if (!this.weblog.isUserAdmin(usr))
         return ("You're not allowed to see this story!");
      else if (!this.weblog.isUserMember(usr))
         return ("You're not allowed to see this story!");
      else if (this.editableby < this.weblog.members.get(usr.name).level)
         return ("You're not allowed to see this story!");
   } else if (this.weblog.isNotPublic(usr))
      return ("Sorry, this weblog is not public!");
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