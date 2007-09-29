//
// The Antville Project
// http://code.google.com/p/antville
//
// Copyright 2001-2007 by The Antville People
//
// Licensed under the Apache License, Version 2.0 (the ``License'');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an ``AS IS'' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// $Revision$
// $LastChangedBy$
// $LastChangedDate$
// $URL$
//

defineConstants(Story, "getModes", "readonly", "shared", "open");
defineConstants(Story, "getStatus", "private", "hidden", "public");

this.handleMetadata("title");
this.handleMetadata("text");

Story.prototype.constructor = function() {
   this.requests = 0;
   this.mode = Story.DEFAULT;
   this.creator = this.modifier = session.user;
   this.created = this.modified = new Date;
   return this;
};

Story.prototype.getPermission = function(action) {
   switch (action) {
      case ".":
      case "main":
      return true;
      case "comment":
      return !!session.user;
      case "delete":
      case "edit":
      case "rotate":
      return User.getPermission(User.PRIVILEGED) ||
            Membership.getPermission(Membership.OWNER);
   }
   return false;
};

Story.prototype.main_action = function() {
   res.data.title = this.getTitle();
   res.data.body = this.renderSkinAsString("Story#main");
   this.site.renderSkin("page");
   this.incrementReadCounter();
   logAction();
   return;
};

Story.prototype.getTitle = function() {
   return stripTags(this.title || this.text).clip(5, "...", "\\s") || this; 
};

Story.prototype.edit_action = function() {
   if (session.data.rescuedText) {
      restoreRescuedText();
   }
   
   if (req.postParams.save) {
      //try {
         this.update(req.postParams);
         res.message = gettext("The story was successfully updated.");
         res.redirect(this.href());
      //} catch (ex) {
      //   res.message = ex;
      //   app.log(ex);
      //}
   }
   
   res.data.action = this.href(req.action);
   res.data.title = gettext('Edit story "{0}"', this.getTitle());
   res.data.body = this.renderSkinAsString("Story#edit");
   this.site.renderSkin("page");
   return;
};

Story.prototype.getFormValue = function(name) {
   if (req.isPost()) {
      return req.postParams[name];
   }
   switch (name) {
      case "commentsMode":
      return this.commentsMode || res.handlers.site.commentsMode;
      case "mode":
      return this.mode || Story.READONLY;
      case "status":
      return this.status || Story.PUBLIC;
      case "tags":
      return this.tags.list();
   }
   return this[name];
};

Story.prototype.getFormOptions = function(name) {
   switch (name) {
      case "mode":
      return Story.getModes();
      case "status":
      return Story.getStatus();
      case "commentsMode":
      return Site.getCommentsModes();
   }
   return;
}

Story.prototype.update = function(data) {
   var site = this.site || res.handlers.site;
   var delta = this.getDelta(data);

   if (!data.title && !data.text) {
      throw Error(gettext("Please enter at least something into the 'title' or 'text' field."));
   }

   if (data.created) {
      try {
         this.created = data.created.toDate("yyyy-MM-dd HH:mm", 
               site.getTimeZone());
      } catch (ex) {
         throw Error(gettext("Cannot parse timestamp {0} as a date.", data.created));
         app.log(ex);
      }
   }
   
   this.title = data.title;
   this.text = data.text;
   this.setContent(data);
   //this.setTags(data.tags || data.tag_array)
   this.commentsMode = data.commentsMode;
   if (this.creator === session.user) {
      this.mode = data.mode;
   }
   if (this.status === Story.PRIVATE && data.status !== Story.PRIVATE) {
      if (delta > 50) {
         site.lastUpdate = new Date;
      }
   }
   this.status = data.status;
   this.touch();

   // FIXME: send e-mail notification
   if (false && site.isNotificationEnabled() && newStatus != 0) {
      // status changes from offline to online
      // (this is bad because somebody could send a bunch
      // of e-mails simply by toggling the online status.)
      //if (this.online == 0)
      //   this.sendNotification("story", "create");
      // major update of an already online story
      if (this.online != 0 && content.isMajorUpdate)
         site.sendNotification("update", this);
   }
   return;
};

Story.prototype.setContent = function(data) {
   for each (var key in data) {
      if (key.startsWith("content_")) {
         this.metadata.set(key, data[key]);
      }
   }
   return;
};

Story.remove = function() {
   if (this.constructor !== Story) {
      return;
   }
   while (this.comments.size() > 0) {
      Comment.remove.call(this.comments.get(0));
   }
   this.setTags(null);
   this.remove();
   return;
};

Story.prototype.rotate_action = function() {
   this.status = this.getRotation();
   return res.redirect(this._parent.href());
};

Story.prototype.getRotation = function() {
   var rotation = [Story.PRIVATE, Story.PUBLIC, Story.HIDDEN];
   return rotation[(rotation.indexOf(this.status) + 1) % 3];
};

Story.prototype.comment_action = function() {
   if (session.data.rescuedText) {
      restoreRescuedText();
   }
   var comment = new Comment(this);
   if (req.postParams.save) {
      try {
         comment.update(req.postParams);
         this.add(comment);
         // Force addition to aggressively cached subcollection
         (this.story || this).comments.add(comment);
         res.message = gettext("The comment was successfully created.");
         res.redirect(comment.href());
      } catch (ex) {
         res.message = ex;
         app.log(ex);
      }
   }
   res.handlers.parent = this;
   res.data.action = this.href(req.action);
   res.data.title = gettext("Add comment to {0}", this.getTitle());
   res.data.body = comment.renderSkinAsString("Comment#edit");
   this.site.renderSkin("page");
   this.incrementReadCounter();
   return;
};

Story.prototype.link_macro = function(param, action, text) {
   switch (action) {
      case "rotate":
      switch (this.getRotation()) {
         case Story.PUBLIC:
         text = gettext("publish"); break;
         case Story.HIDDEN:
         text = gettext("hide"); break;
         case Story.PRIVATE:
         text = gettext("unpublish"); break;
      }
   }
   return HopObject.prototype.link_macro.call(this, param, action, text);
};

Story.prototype.comments_macro = function(param, mode) {
   var story = this.story || this;
   if (mode) {
      var n = this.comments.size() || 0;
      var text = ngettext("{0} comment", "{0} comments", n);
      if (mode === "count" || mode === "size") {
         res.write(text);
      } else if (mode === "link") {
         n < 1 ? res.write(text) : 
               html.link({href: this.href() + "#comments"}, text);
      }
   } else {
      if (story.site.commentsMode === Site.CLOSED || 
            story.commentsMode === Site.CLOSED) {
         //html.element("em", gettext("This story''s comments are closed."));
      } else {
         this.comments.prefetchChildren();
         this.forEach(function() {
            html.openTag("a", {name: this._id});
            //res.write(this.size())
            html.closeTag("a");
            this.renderSkin(this.parent.constructor === Story ? 
                  "Comment#main" : "Comment#level_2");
         });
      }
   }
   return;
};

Story.prototype.content_macro = function(param) {
   switch (param.as) {
      case "editor" :
      var inputParam = this.metadata.createInputParam(param.part, param);
      delete inputParam.part;
      if (param.cols || param.rows)
         html.textArea(inputParam);
      else
         html.input(inputParam);
      break;

      case "image" :
      var part = this.metadata.get(param.part);
      if (part && this.site.images.get(part)) {
         delete param.part;
         renderImage(this.site.images.get(part), param);
      }
      break;

      default :
      if (param.clipping == null)
         param.clipping = "...";
      var part = this.getRenderedContentPart(param.part, param.as);
      if (!part && param.fallback)
         part = this.getRenderedContentPart(param.fallback, param.as);
      if (param.as == "link") {
         if (this._prototype != "Comment")
            html.openLink({href: this.href()});
         else
            html.openLink({href: this.story.href() + "#" + this._id});
         part = part ? part.stripTags() : param.clipping;
      }
      if (!param.limit)
         res.write(part);
      else {
         var stripped = part.stripTags();
         var clipped = stripped.clip(param.limit, param.clipping, param.delimiter);
         if (stripped == clipped)
            res.write(part);
         else
            res.write(clipped);
      }
      if (param.as == "link")
         html.closeLink();
   }
   return;
};

Story.prototype.commentform_macro = function(param) {
   if (this.commentsMode === "closed") {
      return;
   }
   if (session.user) {
      res.data.action = this.href("comment");
      (new Comment()).renderSkin("edit");
   } else {
      html.link({href: this.site.members.href("login")},
                param.text ? param.text : getMessage("Comment.loginToAdd"));
   }
   return;
};

Story.prototype.tags_macro = function() {
   return res.write(this.getFormValue("tags"));
};

Story.prototype.backlinks_macro = function(param) {
   // check if scheduler has done a new update of accesslog
   // if not and we have cached backlinks simply return them
   if (this.cache.lrBacklinks >= app.data.lastAccessLogUpdate)
      return this.cache.rBacklinks;

   var c = getDBConnection("antville");
   var dbError = c.getLastError();
   if (dbError)
      return dbError;

   // we're doing this with direct db access here
   // (there's no need to do it with prototypes):
   var query = "select referrer, count(*) as count from log where " +
         "context_type = 'Story' and context_id = " + this._id + " group by " +
         "referrer order by count desc, referrer asc;";
   var rows = c.executeRetrieval(query);
   var dbError = c.getLastError();
   if (dbError)
      return dbError;

   // we show a maximum of 100 backlinks
   var limit = Math.min((param.limit ? parseInt(param.limit, 10) : 100), 100);
   res.push();

   var skinParam = new Object();
   var cnt = 0;
   while (rows.next() && cnt <= limit) {
      skinParam.count = rows.getColumnItem("count");
      skinParam.referrer = rows.getColumnItem("referrer");
      skinParam.referrer && (skinParam.text = skinParam.referrer.clip(50));
      this.renderSkin("backlinkItem", skinParam);
      cnt++;
   }
   rows.release();
   // cache rendered backlinks and set timestamp for
   // checking if backlinks should be rendered again
   skinParam = {referrers: res.pop()};
   if (skinParam.referrers.length > 0)
      this.cache.rBacklinks = this.renderSkinAsString("backlinks", skinParam);
   else
      this.cache.rBacklinks = "";
   this.cache.lrBacklinks = new Date();
   res.write(this.cache.rBacklinks);
   return;
};

Story.prototype.setTags = function(tags) {
   if (!tags) {
      tags = [];
   } else if (tags.constructor === String) {
      tags = tags.split(/\s*,\s*/);
   }
   
   var diff = {};
   var tag;
   for (var i in tags) {
       // Trim and remove URL characters  (like ../.. etc.)
      tag = tags[i] = String(tags[i]).trim().replace(/^[\/\.]+$/, "?");
      if (tag && diff[tag] == null) {
         diff[tag] = 1;
      }
   }
   this.tags.forEach(function() {
      if (!this.tag) {
         return;
      }
      diff[this.tag.name] = (tags.indexOf(this.tag.name) < 0) ? this : 0;
   });

   for (var tag in diff) {
      switch (diff[tag]) {
         case 0:
         // Do nothing (tag already exists)
         break;
         case 1:
         // Add tag to story
         Story.prototype.addTag.call(this, tag);
         break;
         default:
         // Remove tag
         Story.prototype.removeTag.call(this, diff[tag]);
      }
   }
   return;
};

Story.prototype.addTag = function(name) {
   //res.debug("Add tag " + name);
   //return;
   this.tags.add(new TagHub(name, this, session.user));
   return;
};

Story.prototype.removeTag = function(tag) {
   //res.debug("Remove " + tag);
   //return;
   var parent = tag._parent;
   // Remove tag from site if necessary
   if (parent.size() === 1) {
      res.debug("Remove " + parent);
      parent.remove();
   }
   // Remove tag from story
   tag.remove();
   return;
};

Story.prototype.deleteComment = function(commentObj) {
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
};

Story.prototype.getRenderedContentPart = function(name, mode) {
   var part = this.metadata.get(name);
   if (!part) {
      return "";
   }
   var key = mode ? (name + ":" + mode) : name;
   var lastRendered = this.cache["lastRendered_" + key];
   if (!lastRendered) {
       // FIXME: || lastRendered.getTime() < this.metadata.getLastModified().getTime())
      switch (mode) {
         case "plaintext":
         part = stripTags(part).clipURLs(30);
         break;
         
         case "alttext":
         part = stripTags(part);
         part = part.replace(/\"/g, "&quot;");
         part = part.replace(/\'/g, "&#39;");
         break;
         
         default:
         var skin = createSkin(format(part));
         this.allowTextMacros(skin);
         // Enable caching; some macros (eg. poll, storylist) will set this 
         // to false to prevent caching of a contentpart containing them.
         res.meta.cachePart = true;
         // The following is necessary so that global macros know where they belong to.
         // Even if they are embedded at some other site.
         var site;
         if (this.site != res.handlers.site) {
            site = res.handlers.site;
            res.handlers.site = this.site;
         }
         part = this.renderSkinAsString(skin); // FIXME: .activateURLs(50);
         site && (res.handlers.site = site);
      }
      this.cache[key] = part;
      if (res.meta.cachePart) {
         this.cache["lastRendered_" + key] = new Date();
      }
   }   
   return this.cache[key];
};

Story.prototype.incrementReadCounter = function() {
   return; // FIXME FIXME FIXME
   // Do not record requests by the story creator
   if (session.user === this.creator) {
      return;
   }
   if (!app.data.readLog.containsKey(String(this._id))) {
      var logObj = new Object();
      logObj.site = this.site.alias;
      logObj.story = this._id;
      logObj.reads = this.reads + 1;
      app.data.readLog.put(String(this._id), logObj);
   } else {
      app.data.readLog.get(String(this._id)).reads += 1;
   }
   return;
};

Story.prototype.getNavigationName  = function() {
   if (this.title)
      return this.title;
   return getDisplay("story") + " " + this._id;
};

Story.prototype.getIndexDocument = function() {
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
   var content = this.metadata.get();
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
};

Story.prototype.checkAccess = function(action, usr, level) {
   var url = this.site.href();
   try {
      switch (action) {
         case "main" :
            this.checkView(usr, level);
            break;
         case "edit" :
            if (!usr && req.data.save)
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
};

Story.prototype.checkPost = function(usr, level) {
   if (!usr.sysadmin && !this.site.online && level == null)
      throw new DenyException("siteView");
   else if (!this.site.metadata.get("discussions"))
      throw new DenyException("siteNoDiscussion");
   else if (!this.discussions)
      throw new DenyException("storyNoDiscussion");
   return;
};
    
Story.prototype.checkDelete = function(usr, level) {
   if (this.creator != usr && (level & MAY_DELETE_ANYSTORY) == 0)
      throw new DenyException("storyDelete");
   return;
};

Story.prototype.checkEdit = function(usr, level) {
   if (this.creator != usr) {
      if (level == null)
         throw new DenyException("storyEdit");
      else if (this.editableby == EDITABLEBY_ADMINS && (level & MAY_EDIT_ANYSTORY) == 0)
         throw new DenyException("storyEdit");
      else if (this.editableby == EDITABLEBY_CONTRIBUTORS && (level & MAY_ADD_STORY) == 0)
         throw new DenyException("storyEdit");
   }
   return;
};

Story.prototype.checkView = function(usr, level) {
   this.site.checkView(usr, level);
   if (!this.online && this.creator != usr) {
      if (this.editableby == EDITABLEBY_ADMINS && (level & MAY_EDIT_ANYSTORY) == 0)
         throw new DenyException("storyView");
      else if (this.editableby == EDITABLEBY_CONTRIBUTORS && (level & MAY_ADD_STORY) == 0)
         throw new DenyException("storyView");
   }
   return;
};

Story.prototype.allowTextMacros = function(s) {
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
   s.allowMacro("storylist");
   s.allowMacro("fakemail");
   s.allowMacro("this.topic");
   s.allowMacro("story.topic");
   s.allowMacro("imageoftheday");
   s.allowMacro("spacer");

   // allow module text macros
   for (var i in app.modules) {
      if (app.modules[i].allowTextMacros)
         app.modules[i].allowTextMacros(s);
   }
   return;
};

Story.prototype.getDelta = function(data) {
   var deltify = function(o1, o2) {
      var len1 = o1 ? String(o1).length : 0;
      var len2 = o2 ? String(o2).length : 0;
      return Math.abs(len1 - len2);
   };

   var delta = 0;
   delta += deltify(data.title, this.title);
   delta += deltify(data.text, this.text);
   for each (var key in data) {
      if (key.startsWith("content_")) {
         delta += deltify(data.key, this.metadata.get(key))
      }
   }
   return delta;
};
