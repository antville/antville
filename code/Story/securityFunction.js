/**
 * check if user is allowed to post a comment to this story   
 * @param Obj Userobject   
 * @return String Reason for denial (or null if allowed)   
 */   
 
function isPostDenied(usr) {
   if (usr.sysadmin)
      return null;
   if (!this.site.online && !req.data.memberlevel)
      return "siteNotPublic";
   else if (!this.site.discussions)
      return "siteNoDiscussion";
   else if (!this.discussions)
      return "storyNoDiscussion";
   return null;
}   
    
 /** 
 * check if user is allowed to delete this story
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isDeleteDenied(usr) {
   if (this.creator != usr && (req.data.memberlevel & MAY_DELETE_ANYSTORY) == 0)
      return "storyDeleteDenied";
   return null;
}

/**
 * check if user is allowed to edit this story
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isEditDenied(usr) {
   if (this.creator != usr) {
      if (this.editableby == null && (req.data.memberlevel & MAY_EDIT_ANYSTORY) == 0)
         return "storyEditDenied";
      else if (this.editableby == 1 && (req.data.memberlevel & MAY_ADD_STORY) == 0)
         return "storyEditDenied";
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
      return "siteNotPublic";
   else if (!this.online && this.creator != usr) {
      if (this.editableby == null && (req.data.memberlevel & MAY_EDIT_ANYSTORY) == 0)
         return "storyViewDenied";
      else if (this.editableby == 1 && (req.data.memberlevel & MAY_ADD_STORY) == 0)
         return "storyViewDenied";
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
   s.allowMacro("fakemail");
   return;
}
