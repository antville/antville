/**
 * check if story is ok; if true, save changed story
 * @param Obj Object containing the properties needed for creating a new story
 * @param Obj User-Object modifying this story
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */

function evalStory(param,modifier) {
   var result = new Object();
   result.error = false;
   // if user deleted the text of the story, return with error-message
   if (!param.text) {
      result.message = "You need at least some text!";
      result.error = true;
      return (result);
   }
   
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
      if (ctime.error) {
          result.message = "Error: Can't parse timestamp \""+param.createtime+"\" as date";
          result.error = true;
      } else if (ctime.value != this.createtime) {
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
      result.message = "The name of the topic contains forbidden characters!";
      result.error = true;
      return (result);
   } else
      this.topic = topicName;
   // check online-status of story
   var online = parseInt(param.online,10);
   if (online == 1 && !this.topic) {
      result.message = "Can't set story online just in topic because you didn't specify one!";
      result.error = true;
      this.online = 2;
      return (result);
   } else if (isNaN(online))
      this.online = 0;
   else
      this.online = online;

   // the modifytimes of a story and its parent weblog will only 
   // be updated if more than 50 characters have changed.
   if (majorUpdate) {
      if (this.online > 0)
         this.weblog.lastupdate = new Date();
      this.modifytime = new Date();
   }

   if (this.online > 0) {
      // href() may not yet work if we changed the topic
      // so we build the redirect URL manually
      if (this.topic)
         result.url = this.weblog.topics.href() + escape(this.topic) + "/" + this._id;
      else
         result.url = this.weblog.href() + this.day+"/" + this._id;
   } else
      result.url = this.weblog.stories.href();
   result.message = "The story was updated successfully!";
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
   var result = new Object();
   if (!param.text) {
      result.message = "You need at least some text!";
      result.error = true;
   } else {
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
      result.message = "Your posting was saved successfully!";
      result.error = false;
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
      currComment.deleteComment(currComment.get(i-1));
   if (this.remove(currComment))
      return("The comment was deleted successfully!");
   else
      return("Couldn't delete the comment!");
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
   for (var i=this.size();i>0;i--) {
      var comment = this.get(i-1);
      comment.deleteAll();
      this.remove(comment);
   }
   return true;
}
