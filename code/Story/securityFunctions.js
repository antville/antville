/**
 * permission check (called by hopobject.onRequest())
 * @param String name of action
 * @param Obj User object
 * @param Int Membership level
 * @return Obj Exception object or null
 */
function checkAccess(action, usr, level) {
   var url = this.site.href();
   try {
      switch (action) {
         case "main" :
            this.checkView(usr, level);
            break;
         case "edit" :
            if (!usr && (req.data.save || req.data.publish))
               rescueText(req.data);
            checkIfLoggedIn(this.href(req.action));
            this.checkEdit(usr, level);
            break;
         case "delete" :
            checkIfLoggedIn();
            this.checkDelete(usr, level);
            break;
         case "comment" :
            if (!usr && req.data.save)
               rescueText(req.data);
            checkIfLoggedIn(this.href(req.action));
            url = this.href();
            this.checkPost(usr, level);
            break;
      }
   } catch (deny) {
      res.message = deny.toString();
      res.redirect(url);
   }
   return;
}


/**
 * check if user is allowed to post a comment to this story   
 * @param Obj Userobject   
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)   
 */   
function checkPost(usr, level) {
   if (!usr.sysadmin && !this.site.online && level == null)
      throw new DenyException("siteView");
   else if (!this.site.preferences.getProperty("discussions"))
      throw new DenyException("siteNoDiscussion");
   else if (!this.discussions)
      throw new DenyException("storyNoDiscussion");
   return;
}
    
 /** 
 * check if user is allowed to delete a story
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
function checkDelete(usr, level) {
   if (this.creator != usr && (level & MAY_DELETE_ANYSTORY) == 0)
      throw new DenyException("storyDelete");
   return;
}

/**
 * check if user is allowed to edit a story
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
function checkEdit(usr, level) {
   if (this.creator != usr) {
      if (level == null)
         throw new DenyException("storyEdit");
      else if (this.editableby == null && (level & MAY_EDIT_ANYSTORY) == 0)
         throw new DenyException("storyEdit");
      else if (this.editableby == 1 && (level & MAY_ADD_STORY) == 0)
         throw new DenyException("storyEdit");
   }
   return;
}


/**
 * check if user is allowed to view story
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
function checkView(usr, level) {
   this.site.checkView(usr, level);
   if (!this.online && this.creator != usr) {
      if (this.editableby == null && (level & MAY_EDIT_ANYSTORY) == 0)
         throw new DenyException("storyView");
      else if (this.editableby == 1 && (level & MAY_ADD_STORY) == 0)
         throw new DenyException("storyView");
   }
   return;
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
