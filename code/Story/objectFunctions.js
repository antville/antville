/**
 * constructor function for story objects
 */
function constructor(creator, ipaddress) {
   this.reads = 0;
   this.ipaddress = ipaddress;
   this.creator = creator;
   this.createtime = new Date();
   this.modifytime = new Date();
}


/**
 * check if story is ok; if true, save changed story
 * @param Obj Object containing the properties needed for creating a new story
 * @param Obj User-Object modifying this story
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */
function evalStory(param, modifier) {
   // collect content
   var content = extractContent(param, this.content.getAll());
   // if all story parts are null, return with error-message
   if (!content.exists)
      throw new Exception("textMissing");
   // check if the createtime is set in param
   if (param.createtime) {
      try {
         var ctime = param.createtime.toDate("yyyy-MM-dd HH:mm");
      } catch (err) {
         throw new Exception("timestampParse", param.createtime);
      }
   }
   // check name of topic (if specified)
   var topicName = null;
   if (param.topic) {
      if (!param.topic.isURL())
         throw new Exception("topicNoSpecialChars");
      topicName = param.topic;
   } else if (param.addToTopic)
      topicName = param.addToTopic;

   // store the new values of the story
   if (param.publish) {
      var newStatus = param.addToFront ? 2 : 1;
      if (!this.online || content.isMajorUpdate)
         this.site.lastupdate = new Date();
      this.online = newStatus;
   } else
      this.online = 0;
   if (content.isMajorUpdate)
      this.modifytime = new Date();
   this.content.setAll(content.value);
   this.topic = topicName;
   // let's keep the title property
   this.title = content.value.title;
   // re-create day of story with respect to site-timezone
   if (ctime && ctime != this.createtime) {
      this.createtime = ctime;
      this.day = ctime.format("yyyyMMdd", this.site.getLocale(), this.site.getTimeZone());
   }
   if (modifier == this.creator)
      this.editableby = !isNaN(param.editableby) ? parseInt(param.editableby, 10) : null;
   this.discussions = param.discussions ? 1 : 0;
   this.modifier = modifier;
   this.ipaddress = param.http_remotehost;

   // send e-mail notification
   if (this.site.isNotificationEnabled() && newStatus != 0) {
      // status changes from offline to online
      // (this is bad because somebody could send a bunch
      // of e-mails simply by toggling the online status.)
      //if (this.online == 0)
      //   this.sendNotification("story", "create");
      // major update of an already online story
      if (this.online != 0 && content.isMajorUpdate)
         this.site.sendNotification("update", this);
   }

   this.cache.modifytime = new Date();
   var result = new Message("storyUpdate");
   result.url = this.online > 0 ? this.href() : this.site.stories.href();
   result.id = this.id;
   return result;
}


/**
 * function sets story either online or offline
 */
function toggleOnline(newStatus) {
   if (newStatus == "online") {
      this.online = 2;
      this.site.lastupdate = new Date();
   } else if (newStatus == "offline")
      this.online = 0;
   return true;
}

/**
 * function evaluates comment and adds it if ok
 * @param Obj Object containing properties needed for creation of comment
 * @param Obj Story-Object
 * @param Obj User-Object (creator of comment)
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */

function evalComment(param, creator) {
   // collect content
   var content = extractContent(param);
   if (!content.exists)
      throw new Exception("textMissing");
   var c = new comment(this.site, creator, param.http_remotehost);
   c.content.setAll(content.value);
   // let's keep the title property:
   c.title = content.value.title;
   this.add(c);
   // also add to story.comments since it has 
   // cachemode set to aggressive and wouldn't refetch
   // its child collection index otherwise
   if (this._prototype == "story")
      this.comments.add(c);
   else
      this.story.comments.add(c);
   this.site.lastupdate = new Date();
   // send e-mail notification
   if (this.site.isNotificationEnabled()) 
      this.site.sendNotification("create", c);
   var result = new Message("commentCreate");
   result.id = c._id;
   return result;
}

/**
 * function deletes a whole thread
 * @param Obj Comment-Object that should be deleted
 * @return String Message indicating success/failure
 */

function deleteComment(currComment) {
   for (var i=currComment.size();i>0;i--)
      this.deleteComment(currComment.get(i-1));
   // also remove from comment's parent since it has 
   // cachemode set to aggressive and wouldn't refetch
   // its child collection index otherwise
   var p = currComment.parent;
   if (p == null)
      p = currComment.story;
   try {
      p.remove(currComment);
      this.comments.remove(currComment);
   } catch (err) {
      throw new Exception("commentDelete");
   }
   return new Message("commentDelete");
}

/**
 * function checks if the text of the story was already cached
 * and if it's still valid
 * if false, it caches it again
 * @return String cached text of story
 */
function getRenderedContentPart(name) {
   var partLastRendered = this.cache["lastRendered_" + name];
   if (!partLastRendered || partLastRendered <= this.modifytime ||
       partLastRendered <= this.cache.modifytime) {
      // enable caching; some macros (eg. poll, storylist)
      // will set this to false to prevent caching of a contentpart
      // containing them [rg]
      req.data.cachePart = true;
      // cached version of text is too old, so we cache it again
      var part = this.content.getProperty(name);
      if (!part)
         return "";
      var s = createSkin(format(part));
      this.allowTextMacros(s);
      this.cache["rendered_" + name] = this.renderSkinAsString(s).activateURLs();
      if (req.data.cachePart == true)
         this.cache["lastRendered_" + name] = new Date();
   }
   return (this.cache["rendered_" + name]);
}

/**
 * function deletes all childobjects of a story (recursive!)
 */
function deleteAll() {
   for (var i=this.comments.size();i>0;i--) {
      var c = this.comments.get(i-1);
      if (!this.comments.remove(c))
         throw new Exception("storyDeleteComments");
   }
   return true;
}

/**
 * function records the access to a story-object
 * by incrementing the counter of the Object representing
 * this story in app.data.readLog which will be stored
 * in database by scheduler
 */
function incrementReadCounter() {
   // check if app.data.readLog already contains
   // an Object representing this story
   if (!app.data.readLog.containsKey(String(this._id))) {
      var logObj = new Object();
      logObj.site = this.site.alias;
      logObj.story = this._id;
      logObj.reads = this.reads + 1;
      app.data.readLog.put(String(this._id), logObj);
   } else
      app.data.readLog.get(String(this._id)).reads++;
   return;
}

/**
 * Return either the title of the story or
 * the id prefixed with standard display name
 * to be used in the global linkedpath macro
 * @see hopobject.getNavigationName()
 */
function getNavigationName () {
   if (this.title)
      return this.title;
   return (DISPLAY["story"] + " " + this._id);
}
