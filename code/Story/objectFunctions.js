/**
 * constructor function for story objects
 */
function constructor(creator, ipaddress) {
   this.reads = 0;
   this.ipaddress = ipaddress;
   this.creator = creator;
   this.editableby = EDITABLEBY_ADMINS;
   this.createtime = new Date();
   this.modifytime = new Date();
   return this;
}


/**
 * check if story is ok; if true, save changed story
 * @param Obj Object containing the properties needed for creating a new Story
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
       // FIXME: this should be solved more elegantly
      if (String.URLPATTERN.test(param.topic))
         throw new Exception("topicNoSpecialChars");
      if (this.site.topics[param.topic] || this.site.topics[param.topic + "_action"])
         throw new Exception("topicReservedWord");
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
      this.editableby = !isNaN(param.editableby) ?
                        parseInt(param.editableby, 10) : EDITABLEBY_ADMINS;
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
   var result = new Message("storyUpdate");
   result.url = this.online > 0 ? this.href() : this.site.stories.href();
   result.id = this._id;
   // add the modified story to search index
   app.data.indexManager.getQueue(this.site).add(this);
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

   // add the modified story to search index
   app.data.indexManager.getQueue(this.site).add(this);
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
   var c = new Comment(this.site, creator, param.http_remotehost);
   c.content.setAll(content.value);
   // let's keep the title property:
   c.title = content.value.title;
   this.add(c);
   // also add to story.comments since it has
   // cachemode set to aggressive and wouldn't refetch
   // its child collection index otherwise
   if (this.story)
      this.story.comments.add(c);
   else
      this.comments.add(c);
   this.site.lastupdate = new Date();
   // send e-mail notification
   if (this.site.isNotificationEnabled())
      this.site.sendNotification("create", c);
   var result = new Message("commentCreate");
   result.id = c._id;
   // add the new comment to search index
   app.data.indexManager.getQueue(this.site).add(c);
   return result;
}

/**
 * function deletes a whole thread
 * @param Obj Comment-Object that should be deleted
 * @return String Message indicating success/failure
 */

function deleteComment(commentObj) {
   for (var i=commentObj.size();i>0;i--)
      this.deleteComment(commentObj.get(i-1));
   // also remove from comment's parent since it has
   // cachemode set to aggressive and wouldn't refetch
   // its child collection index otherwise
   (commentObj.parent ? commentObj.parent : this).removeChild(commentObj);
   this.comments.removeChild(commentObj);
   commentObj.remove();

   // remove the modified comment from search index
   app.data.indexManager.getQueue(this.site).remove(commentObj._id);
   return new Message("commentDelete");
}

/**
 * function checks if the text of the story was already cached
 * and if it's still valid
 * if false, it caches it again
 * @return String cached text of story
 */
function getRenderedContentPart(name, fmt) {
   var part = this.content.getProperty(name);
   if (!part)
      return "";
   var key = fmt ? name + ":" + fmt : name;
   var lastRendered = this.cache["lastRendered_" + key];
   if (!lastRendered ||
       lastRendered.getTime() < this.content.getLastModified().getTime()) {
      switch (fmt) {
         case "plaintext":
            part = stripTags(part);
            break;
         case "alttext":
            part = stripTags(part);
            part = part.replace(/\"/g, "&quot;");
            part = part.replace(/\'/g, "&#39;");
            break;
         default:
            var s = createSkin(format(part));
            this.allowTextMacros(s);
            // enable caching; some macros (eg. poll, storylist)
            // will set this to false to prevent caching of a contentpart
            // containing them
            req.data.cachePart = true;
            // The following is necessary so that global macros know where they belong to.
            // Even if they are embeded at some other site.
            var tmpSite;
            if (this.site != res.handlers.site) {
               tmpSite = res.handlers.site;
               res.handlers.site = this.site;
            }
            part = this.renderSkinAsString(s).activateURLs();
            if (tmpSite)
               res.handlers.site = tmpSite;
      }
      this.cache[key] = part;
      if (req.data.cachePart)
         this.cache["lastRendered_" + key] = new Date();
   }   
   return this.cache[key];
}

/**
 * function deletes all childobjects of a story (recursive!)
 */
function deleteAll() {
   var queue = app.data.indexManager.getQueue(this.site);
   var item;
   for (var i=this.comments.size();i>0;i--) {
      item = this.comments.get(i-1);
      // remove comment from search index
      queue.remove(item._id);
      item.remove();
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
   return DISPLAY["story"] + " " + this._id;
}


/**
 * creates a Lucene Document object for a story
 * @return Object instance of Search.Document representing the story
 */
function getIndexDocument() {
   var doc = new Search.Document();
   switch (this._prototype) {
      case "Comment":
         doc.addField("story", this.story._id, {store: true, index: true, tokenize: false});
         if (this.parent)
            doc.addField("parent", this.parent._id, {store: true, index: true, tokenize: false});
         break;
      default:
         doc.addField("day", this.day, {store: true, index: true, tokenize: false});
         if (this.topic)
            doc.addField("topic", this.topic, {store: true, index: true, tokenize: true});
         break;
   }

   doc.addField("online", this.online, {store: true, index: true, tokenize: false});
   doc.addField("site", this.site._id, {store: true, index: true, tokenize: false});
   doc.addField("id", this._id, {store: true, index: true, tokenize: false});
   var content = this.content.getAll();
   var title;
   if (title = stripTags(content.title).trim())
      doc.addField("title", title, {store: false, index: true, tokenize: true});
   var text = new java.lang.StringBuffer();
   for (var propName in content) {
      if (propName != "title") {
         text.append(stripTags(content[propName]).trim());
         text.append(" ");
      }
   }
   doc.addField("text", text.toString(), {store: false, index: true, tokenize: true});
   if (this.creator) {
      // FIXME: checking this shouldn't be necessary, but somehow it is ...
      doc.addField("creator", this.creator.name, {store: false, index: true, tokenize: false});
      doc.addField("createtime", this.createtime.format("yyyyMMdd"), {store: false, index: true, tokenize: false});
   }
   return doc;
}
