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
   if (!param.text)
      return (getError("textMissing"));
   
   // check if there's a difference between old and
   // new text of more than 50 characters:
   var majorUpdate = Math.abs(this.text.length - param.text.length) > 50;

   // assign those properties that can be stored anyway
   var editableby = parseInt(param.editableby,10);
   this.editableby = (modifier == this.author && !isNaN(editableby) ? editableby : null);
   this.title = param.title;
   this.text = param.text;
   this.modifier = modifier;
   this.ipaddress = param.http_remotehost;
   // check if the createtime is set in param
   if (param.createtime) {
      var ctime = tryEval ('parseTimestamp("'+param.createtime+'", "yyyy-MM-dd HH:mm")');
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
      var topicName = this.weblog.topics.get(parseInt(param.topicidx,10)).groupname;
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
         this.weblog.lastupdate = new Date();
      }
   } else {
      if (newStatus > 0 && majorUpdate)
         this.weblog.lastupdate = new Date();
      this.online = newStatus;
      this.online = newStatus;
   }
   if (majorUpdate)
      this.modifytime = new Date();
   result = getConfirm("storyUpdate");
   result.url = this.online > 0 ? this.href() : this.weblog.stories.href();
   this.cache.lrText = null;
   return (result);
}

/**
 * function sets story either online or offline
 */

function toggleOnline(newStatus) {
   if (newStatus == "online") {
      this.online = 2;
      this.weblog.lastupdate = new Date();
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
   var result;
   if (!param.text)
      result = getError("textMissing");
   else {
      var c = new comment();
      c.title = param.title;
      c.text = param.text;
      c.weblog = this.weblog;
      c.story = story;
      c.createtime = c.modifytime = new Date();
      c.author = creator;
      c.online = 1;
      c.editableby = null;
      c.ipaddress = param.http_remotehost;
      this.add(c);
      this.weblog.lastupdate = new Date();
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

function getText() {
   if (this.cache.lrText <= this.modifytime) {
      // cached version of text is too old, so we cache it again
      var s = createSkin(format(activateLinks(this.text)));
      this.allowTextMacros(s);
      if (!s.containsMacro("poll"))
      	this.cache.lrText = new Date();
      this.cache.rText = this.renderSkinAsString(s);
   }
   return (doWikiStuff(this.cache.rText));
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
