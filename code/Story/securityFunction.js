/**
 * check if user is allowed to post a comment to this story   
 * @param Obj Userobject   
 * @return String Reason for denial (or null if allowed)   
 */   
 
function isPostDenied(usr) {
   if (usr.isSysAdmin())
      return null;
   if (!this.site.isOnline() && !this.site.isUserMember(usr))
      return (getMsg("error","siteNotPublic"));
   else if (!this.site.hasDiscussions())
      return (getMsg("error","siteNoDiscussion"));
   else if (!this.hasDiscussions())
      return (getMsg("error","storyNoDiscussions"));
   return null;   
}   
    
 /** 
 * check if user is allowed to delete this story
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isDeleteDenied(usr) {
   if (this.creator != usr) {
      var membership = this.site.isUserMember(usr);
      if (!membership)
         return (getMsg("error","userNoMember"));
      else if ((membership.level & MAY_DELETE_ANYSTORY) == 0)
         return (getMsg("error","storyDeleteDenied"));
   }
   return null;
}

/**
 * check if user is allowed to edit this story
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isEditDenied(usr) {
   if (this.creator != usr) {
      var membership = this.site.isUserMember(usr);
      if (!membership)
         return (getMsg("error","userNoMember"));
      else if (this.editableby == null && (membership.level & MAY_EDIT_ANYSTORY) == 0)
         return (getMsg("error","storyEditDenied"));
      else if (this.editableby == 1 && (membership.level & MAY_ADD_STORY) == 0)
         return (getMsg("error","storyEditDenied"));
   }
   return null;
}


/**
 * check if user is allowed to view story
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isViewDenied(usr) {
   if (this.site.isNotPublic(usr))
      return (getMsg("error","siteNotPublic"));
   else if (!this.isOnline() && this.creator != usr) {
      var membership = this.site.isUserMember(usr);
      if (!membership)
         return (getMsg("error","userNoMember"));
      else if (this.editableby == null && (membership.level & MAY_EDIT_ANYSTORY) == 0)
         return (getMsg("error","storyViewDenied"));
      else if (this.editableby == 1 && (membership.level & MAY_ADD_STORY) == 0)
         return (getMsg("error","storyViewDenied"));
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
   s.allowMacro("site.image");
   s.allowMacro("story.image");
   s.allowMacro("thumbnail");
   s.allowMacro("this.thumbnail");
   s.allowMacro("site.thumbnail");
   s.allowMacro("story.thumbnail");
   s.allowMacro("link");
   s.allowMacro("this.link");
   s.allowMacro("site.link");
   s.allowMacro("story.link");
   s.allowMacro("file");
   s.allowMacro("poll");
   s.allowMacro("logo");
   s.allowMacro("shortcut");
   s.allowMacro("storylist");
   return;
}