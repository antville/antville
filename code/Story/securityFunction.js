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
   return null;   
}   
    
 /** 
 * check if user is allowed to delete this story
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isDeleteDenied(usr) {
   if (this.author != usr) {
      var membership = this.weblog.isUserMember(usr);
      if (!membership)
         return ("You're not a member of this weblog!");
      else if ((membership.level & MAY_DELETE_ANYSTORY) == 0)
         return ("You cannot delete the story of somebody else!");
   }
   return null;
}

/**
 * check if user is allowed to edit this story
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isEditDenied(usr) {
   if (this.author != usr) {
      var membership = this.weblog.isUserMember(usr);
      if (!membership)
         return ("You're not a member of this weblog!");
      else if (this.editableby == null && (membership.level & MAY_EDIT_ANYSTORY) == 0)
         return ("You're not allowed to edit this story!");
      else if (this.editableby == 1 && (membership.level & MAY_ADD_STORY) == 0)
         return ("You're not allowed to edit this story!");
   }
   return null;
}


/**
 * check if user is allowed to view story
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isViewDenied(usr) {
   if (this.weblog.isNotPublic(usr))
      return ("Sorry, this weblog is not public!");
   else if (!this.isOnline() && this.author != usr) {
      var membership = this.weblog.isUserMember(usr);
      if (!membership)
         return ("You're not a a member of this weblog!");
      else if (this.editableby == null && (membership.level & MAY_EDIT_ANYSTORY) == 0)
         return ("You're not allowed to see this story!");
      else if (this.editableby == 1 && (membership.level & MAY_ADD_STORY) == 0)
         return ("Only Contributors are allowed to see this story!");
   }
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
   s.allowMacro("poll");
   s.allowMacro("logo");
   return;
}