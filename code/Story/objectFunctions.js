/**
 * check if story is ok; if true, save changed story
 * @param Obj Object containing the properties needed for creating a new story
 * @param Obj User-Object modifying this story
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */

function evalStory(param,modifier) {
   var result;
   // assign those properties that can be stored anyway
   if (modifier == this.creator)
      this.editableby = !isNaN(param.editableby) ? parseInt(param.editableby,10) : null;
   this.discussions = (param.discussions_array || param.discussions == null ? 1 : 0);
   // loop through param and collect content properties
   var majorUpdate = false;
   var contentIsCool = false;
   var cont = this.getContent();
   for (var i in param) {
      if (i.indexOf ("content_") == 0) {
         var part = i.substring(8);
         // check if there's a difference between old and
         // new text of more than 50 characters:
         if (!majorUpdate) {
            var len1 = cont[part] ? cont[part].length : 0;
            var len2 = 0;
            if (param[i])
               var len2 = param[i].length;
            majorUpdate = Math.abs(len1 - len2) >= 50;
         }
         cont[part] = param[i];
         if (!contentIsCool && param[i])
            contentIsCool = true;
      }
   }
   // if all story parts are null, return with error-message
   if (!contentIsCool)
      return (getError("textMissing"));
   this.setContent (cont);
   // let's keep the title property
   this.title = param.content_title;
   this.modifier = modifier;
   this.ipaddress = param.http_remotehost;
   // check if the createtime is set in param
   if (param.createtime) {
      var ctime = tryEval ('parseTimestamp(param.createtime, "yyyy-MM-dd HH:mm")');
      if (ctime.error)
          result = getError("timestampParse",param.createtime);
      else if (ctime.value != this.createtime) {
         this.createtime = ctime.value;
         // create day of story with respect to site-timezone
         this.day = formatTimestamp(this.createtime,"yyyyMMdd");
      }
   }
   // check name of topic (if specified)
   if (param.topic)
      var topicName = param.topic;
   else if (!isNaN(parseInt(param.topicidx,10)))
      var topicName = this.site.topics.get(parseInt(param.topicidx,10)).groupname;
   else
      var topicName = null;
   if (!isCleanForURL(topicName)) {
      // name of topic contains forbidden characters, so return immediatly
      return (getError("topicNoSpecialChars"));
   } else if (topicName)
      this.topic = topicName;

   // check new online-status of story
   var newStatus = parseInt(param.online,10);
   if (param.publish || param.submit == "publish")
      newStatus = param.justintopic ? 1 : 2;
   else if ((param.save || param.submit == "save") && isNaN(newStatus))
      newStatus = 0;
   if (isNaN(newStatus))
      return (getError("storyPublish"));
   if (newStatus == 1 && !topicName)
      return (getError("storyTopicMissing"));
   if (newStatus > 0 && (!this.online || majorUpdate))
      this.site.lastupdate = new Date();
   this.online = newStatus;
   if (majorUpdate)
      this.modifytime = new Date();
   this.cache.modifytime = new Date();
   result = getConfirm("storyUpdate");
   result.url = this.online > 0 ? this.href() : this.site.stories.href();
   return (result);
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

function evalComment(param,story,creator) {
   var result = new Object();
   if (!param.content_text) {
      result = getError("textMissing");
   } else {
      var c = new comment();
      var cont = new HopObject ();
      for (var i in param) {
         if (i.indexOf ("content_") == 0)
            cont[i.substring(8)] = param[i];
      }
      c.setContent (cont);
      // let's keep the title property:
      c.title = param.content_title;
      c.site = this.site;
      c.story = story;
      c.createtime = c.modifytime = new Date();
      c.creator = creator;
      c.online = 1;
      c.editableby = null;
      c.ipaddress = param.http_remotehost;
      this.add(c);
      // also add to story.comments since it has 
      // cachemode set to aggressive and wouldn't refetch
      // its child collection index otherwise
      if (this._prototype == "story")
         this.comments.add(c);
      else
         this.story.comments.add(c);
      this.site.lastupdate = new Date();
      result = getConfirm("commentCreate");
   }
   return (result);
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
   if (p.remove(currComment) && this.comments.remove(currComment))
      return(getMessage("confirm","commentDelete"));
   else
      return(getMessage("error","commentDelete"));
}

/**
 * function checks if the text of the story was already cached
 * and if it's still valid
 * if false, it caches it again
 * @return String cached text of story
 */
function getRenderedContentPart (name) {
   var partLastRendered = this.cache["lastRendered_"+name];
   if (partLastRendered <= this.modifytime ||
       partLastRendered <= this.cache.modifytime) {
      // enable caching; some macros (eg. poll, storylist)
      // will set this to false to prevent caching of a contentpart
      // containing them [rg]
      req.data.cachePart = true;
      // cached version of text is too old, so we cache it again
      var part = this.getContentPart (name);
      if (!part)
         return "";
      var s = createSkin(format(part));
      this.allowTextMacros(s);
      this.cache["rendered_"+name] = activateLinks(this.renderSkinAsString(s));
      if (req.data.cachePart)
         this.cache["lastRendered_"+name] = new Date();
   }
   return (this.cache["rendered_"+name]);
}

/**
 *  Get a content part by name.
 */
function getContentPart (name) {
   // check if this is a story with the old property layout. If so, convert to new.
   if (this.text && !this.content) {
      this.convertContentToXML();
   }
   var cnt = this.getContent();
   return cnt[name];
}

/**
 *  Set a content part to a new value.
 */
function setContentPart (name, value) {
   var cnt = this.getContent();
   cnt[name] = value;
   this.setContent (cnt);
}

/**
 *  Return the content parsed into a HopObject.
 */
function getContent () {
  if (!this.content)
     return new HopObject ();
  return Xml.readFromString (this.content);
}

/**
 *  Set the content of this story object.
 */
function setContent (cnt) {
    this.content = Xml.writeToString (cnt);
    var raw = new java.lang.StringBuffer();
    for (var i in cnt) {
       raw.append(cnt[i]);
       raw.append(" ");
    }
    this.rawcontent = raw.toString().toLowerCase();
}

/**
 * function deletes all childobjects of a story (recursive!)
 */

function deleteAll() {
   for (var i=this.comments.size();i>0;i--) {
      var c = this.comments.get(i-1);
      this.comments.remove(c);
   }
   return true;
}

/**
 *   Function to convert old story content to new XML encoded format.
 */
function convertContentToXML () {
    var cnt = new HopObject();
    var raw = "";
    if (this.title) {
       cnt.title = this.title;
       raw += this.title+" ";
    }
    if (this.text) {
       cnt.text = this.text;
       raw += this.text;
    }
    this.content = Xml.writeToString (cnt);
    this.rawcontent = raw;
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
      app.data.readLog.put(String(this._id),logObj);
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

