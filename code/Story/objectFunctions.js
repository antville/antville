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
   // if user deleted the text of the story, return with error-message
   if (!param.content_text)
      return (getError("textMissing"));

   // check if there's a difference between old and
   // new text of more than 50 characters:
   var oldtext = this.getContentPart("text");
   var majorUpdate = Math.abs(oldtext.length - param.content_text.length) > 50;

   // assign those properties that can be stored anyway
   var editableby = parseInt(param.editableby,10);
   this.editableby = (modifier == this.creator && !isNaN(editableby) ? editableby : null);
   this.discussions = !isNaN(parseInt(param.discussions)) ? parseInt(param.discussions,10) : 1;
   // loop through param and collect content properties
   var cont = this.getContent();
   for (var i in param) {
      if (i.indexOf ("content_") == 0)
         cont[i.substring(8)] = param[i];
   }
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
         this.day = this.createtime.format("yyyyMMdd");
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

   // check online-status of story
   var newStatus = parseInt(param.online,10);
   if (isNaN(newStatus))
      return (getError("storyPublish"));
   if (newStatus == 1 && !topicName)
      return (getError("storyTopicMissing"));
   if (!this.online) {
      if (newStatus > 0) {
         this.online = newStatus;
         this.site.lastupdate = new Date();
      }
   } else {
      if (newStatus > 0 && majorUpdate)
         this.site.lastupdate = new Date();
      this.online = newStatus;
   }
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
 * function returns true/false whether story is online or not
 */

function isOnline() {
   if (parseInt(this.online,10))
      return true;
   return false;
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
   if (this.comments.remove(currComment))
      return(getMsg("confirm","commentDelete"));
   else
      return(getMsg("error","commentDelete"));
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
      // cached version of text is too old, so we cache it again
      var part = this.getContentPart (name);
      if (!part)
         return "";
      var s = createSkin(activateLinks(part));
      this.allowTextMacros(s);
      if (!s.containsMacro("poll") && !s.containsMacro("shortcut") && !s.containsMacro("storylist"))
         this.cache["lastRendered_"+name] = new Date();
      this.cache["rendered_"+name] = this.renderSkinAsString(s);
   }
   return (doWikiStuff(this.cache["rendered_"+name]));
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
    var raw = "";
    for (var i in cnt)
       raw += cnt[i]+" ";
    this.rawcontent = raw.toLowerCase();
}

/**
 * incrementing the read counter for this story
 * every 10 reads the cached value is made persistent
 */
function incrementReadCounter() {
	this.cache.reads++;
	if (this.cache.reads == 10) {
		this.reads += this.cache.reads;
		this.cache.reads = 0;
	}
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
 * function returns true if discussions are enabled
 * for this story
 */

function hasDiscussions() {
   if (parseInt(this.discussions,10))
      return true;
   return false;
}

