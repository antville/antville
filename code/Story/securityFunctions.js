/**
 * permission check (called by hopobject.onRequest())
 * @param String name of action
 * @param Obj User object
 * @param Int Membership level
 * @return Obj Exception object or null
 */
function checkAccess(action, usr, level) {
   var deny = null;
   var url = this.site.href();
   switch (action) {
      case "main" :
         deny = this.isViewDenied(usr, level);
         break;
      case "edit" :
         if (!usr && (req.data.save || req.data.publish))
            rescueText(req.data);
         checkIfLoggedIn(this.href(req.action));
         deny = this.isEditDenied(usr, level);
         break;
      case "delete" :
         checkIfLoggedIn();
         deny = this.isDeleteDenied(usr, level);
         break;
      case "comment" :
         if (!usr && req.data.save)
            rescueText(req.data);
         checkIfLoggedIn(this.href(req.action));
         deny = this.isPostDenied(usr, level);
         url = this.href();
         break;
   }
   if (deny != null)
      deny.redirectTo = url;
   return deny;
}


/**
 * check if user is allowed to post a comment to this story   
 * @param Obj Userobject   
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)   
 */   
function isPostDenied(usr, level) {
   if (!usr.sysadmin && !this.site.online && level == null)
      return new Exception("siteNotPublic");
   else if (!this.site.preferences.getProperty("discussions"))
      return new Exception("siteNoDiscussion");
   else if (!this.discussions)
      return new Exception("storyNoDiscussion");
   return null;
}
    
 /** 
 * check if user is allowed to delete this story
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
function isDeleteDenied(usr, level) {
   if (this.creator != usr && (level & MAY_DELETE_ANYSTORY) == 0)
      return new Exception("storyDeleteDenied");
   return null;
}

/**
 * check if user is allowed to edit this story
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
function isEditDenied(usr, level) {
   if (this.creator != usr) {
      if (level == null)
         return new Exception("storyEditDenied");
      else if (this.editableby == null && (level & MAY_EDIT_ANYSTORY) == 0)
         return new Exception("storyEditDenied");
      else if (this.editableby == 1 && (level & MAY_ADD_STORY) == 0)
         return new Exception("storyEditDenied");
   }
   return null;
}


/**
 * check if user is allowed to view story
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
function isViewDenied(usr, level) {
   if (this.site.isAccessDenied(usr, level))
      return new Exception("siteNotPublic");
   else if (!this.online && this.creator != usr) {
      if (this.editableby == null && (level & MAY_EDIT_ANYSTORY) == 0)
         return new Exception("storyViewDenied");
      else if (this.editableby == 1 && (level & MAY_ADD_STORY) == 0)
         return new Exception("storyViewDenied");
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
   s.allowMacro("this.topic");
   s.allowMacro("story.topic");
   return;
}
