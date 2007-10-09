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

defineConstants(Story, "getStatus", "closed", "public", "shared", "open");
defineConstants(Story, "getModes", "hidden", "featured");
defineConstants(Story, "getCommentsModes", "closed", 
      "readonly", "moderated", "open");
this.handleMetadata("title");
this.handleMetadata("text");

Story.prototype.constructor = function() {
   this.requests = 0;
   this.status = Story.PUBLIC;
   this.creator = this.modifier = session.user;
   this.created = this.modified = new Date;
   return this;
};

Story.prototype.getPermission = function(action) {
   if (!this.site.getPermission("main")) {
      return false;
   }
   switch (action) {
      case ".":
      case "main":
      return this.creator === session.user || 
            Membership.require(Membership.MANAGER) || 
            this.status !== Story.CLOSED || 
            User.require(User.PRIVILEGED);
      case "comment":
      return this.site.commentsMode === Site.ENABLED &&
            this.commentsMode === Story.OPEN ||
            this.commentsMode === Story.MODERATED;
      case "delete":
      return this.creator === session.user || 
            Membership.require(Membership.MANAGER) ||
            User.require(User.PRIVILEGED);            
      case "edit":
      case "rotate":
      return this.creator === session.user || 
            Membership.require(Membership.MANAGER) || 
            this.status === Story.SHARED &&
            Membership.require(Membership.CONTRIBUTOR) || 
            this.status === Story.OPEN && 
            Membership.require(Membership.SUBSCRIBER) ||
            User.require(User.PRIVILEGED);
   }
   return false;
};

Story.prototype.link_macro = function(param, action, text) {
   switch (action) {
      case "rotate":
      if (this.status === Story.CLOSED) {
         text = gettext("publish");
      } else if (this.mode === Story.FEATURED) {
         text = gettext("hide");
      } else {
         text = gettext("unpublish");
      }
   }
   return HopObject.prototype.link_macro.call(this, param, action, text);
};

Story.prototype.main_action = function() {
   res.data.title = this.getTitle();
   res.data.body = this.renderSkinAsString("Story#main");
   this.site.renderSkin("page");
   this.incrementReadCounter();
   logAction();
   return;
};

Story.prototype.getTitle = function(limit) {
   return this.title || this;
   var key = this + ":title:" + limit;
   if (!res.meta[key]) {
      if (this.title) {
         res.meta[key] = stripTags(this.title.clip(limit, "...", "\\s"));
      } else if (this.text) {
         var parts = stripTags(this.text.embody(limit, "...", "\\s"));
         res.meta[key] = parts.head;
         res.meta[this + ":text:" + limit] = parts.tail;
      }
   }
   return res.meta[key] || this; 
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
      return this.commentsMode || Story.OPEN;
      case "mode":
      return this.mode || Story.FEATURED;
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
      return Story.getCommentsModes();
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
   if (this.status === Story.CLOSED) {
      this.status = this.cache.status || Story.PUBLIC;
   } else if (this.mode === Story.FEATURED) {
      this.mode = Story.HIDDEN;
   } else {
      this.cache.status = this.status;
      this.mode = Story.FEATURED;
      this.status = Story.CLOSED;
   }
   return res.redirect(this._parent.href());
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

Story.prototype.summary_macro = function(param) {
   param.limit || (param.limit = 15);
   var keys, summary;
   if (arguments > 1) {
      res.push();
      var content;
      for (var i=1; i<arguments.length; i+=1) {
         if (content = this.metadata.get("content_" + arguments[i])) {
            res.write(content);
            res.write(String.SPACE);
         }
      }      
      summary = res.pop();
   }
   if (!summary) {
      summary = (this.title || String.EMPTY) + String.SPACE + 
            (this.text || String.EMPTY);
   }
   var clipped = stripTags(summary).clip(param.limit, param.clipping, "\\s");
   var head = clipped.split(/(\s)/, param.limit * 0.6).join(String.EMPTY);
   var tail = clipped.substring(head.length).trim();
   head = head.trim();
   if (!head && !tail) {
      head = "...";
   }
   html.link({href: this.href()}, head);
   res.writeln("\n");
   res.write(tail);
   return;
};

Story.prototype.comments_macro = function(param, mode) {
   var story = this.story || this;
   if (story.site.commentsMode === Site.CLOSED || 
         story.commentsMode === Site.CLOSED) {
      return;
   } else if (mode) {
      var n = this.comments.size() || 0;
      var text = ngettext("{0} comment", "{0} comments", n);
      if (mode === "count" || mode === "size") {
         res.write(text);
      } else if (mode === "link") {
         n < 1 ? res.write(text) : 
               html.link({href: this.href() + "#comments"}, text);
      }
   } else {
      this.comments.prefetchChildren();
      this.forEach(function() {
         html.openTag("a", {name: this._id});
         //res.write(this.size())
         html.closeTag("a");
         this.renderSkin(this.parent.constructor === Story ? 
               "Comment#main" : "Comment#reply");
      });
   }
   return;
};

Story.prototype.commentform_macro = function(param) {
   if (this.commentsMode === "closed") {
      return;
   }
   if (session.user) {
      res.data.action = this.href("comment");
      (new Comment()).renderSkin("Comment#edit");
   } else {
      html.link({href: this.site.members.href("login")},
                param.text || gettext("Please login to add a comment"));
   }
   return;
};

Story.prototype.tags_macro = function() {
   return res.write(this.getFormValue("tags"));
};

Story.prototype.backlinks_macro = function(param, limit) {
   limit || (limit = param.limit);
   var db = getDBConnection("antville");
   var query = "select referrer, count(*) as count from log where " +
         "context_type = 'Story' and context_id = " + this._id + " group by " +
         "referrer order by count desc, referrer asc;";
   var rows = db.executeRetrieval(query);
   var limit = Math.min(parseInt(limit, 10) || 100, 100);
   var counter = 0;
   var param;
   res.push();
   while (rows.next() && counter <= limit) {
      param = {
         requests: rows.getColumnItem("count"),
         referrer: rows.getColumnItem("referrer")
      };
      param.referrer && (param.text = param.referrer.clip(50));  
      this.renderSkin("Story#backlink", param);
      counter += 1;
   }
   rows.release();
   param = {referrers: res.pop()};
   if (param.referrers.length > 0) {
      this.renderSkin("Story#backlinks", param);
   }
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

Story.prototype.format_filter = function(value, param, mode) {
   if (value) {
      switch (mode) {
         case "text":
         return this.url_filter(stripTags(value), param, mode);
         case "quotes":
         return stripTags(value).replace(/(\"|\')/g, function(str, quotes) {
            return "&#" + quotes.charCodeAt(0) + ";";
         });
         default:
         value = this.macro_filter(value, param);
         return this.url_filter(value, param);
      }
   }
   return String.EMTPY;
};

Story.prototype.macro_filter = function(value, param) {
   var skin = createSkin(format(value));
   skin.allowMacro("image");
   skin.allowMacro("this.image");
   skin.allowMacro("site.image");
   skin.allowMacro("story.image");
   skin.allowMacro("thumbnail");
   skin.allowMacro("this.thumbnail");
   skin.allowMacro("site.thumbnail");
   skin.allowMacro("story.thumbnail");
   skin.allowMacro("link");
   skin.allowMacro("this.link");
   skin.allowMacro("site.link");
   skin.allowMacro("story.link");
   skin.allowMacro("file");
   skin.allowMacro("poll");
   skin.allowMacro("logo");
   skin.allowMacro("storylist");
   skin.allowMacro("fakemail");
   skin.allowMacro("this.topic");
   skin.allowMacro("story.topic");
   skin.allowMacro("imageoftheday");
   skin.allowMacro("spacer");

   // FIXME: allow module text macros
   for (var i in app.modules) {
      if (app.modules[i].allowTextMacros)
         app.modules[i].allowTextMacros(skin);
   }

   var site;
   if (this.site !== res.handlers.site) {
      site = res.handlers.site;
      res.handlers.site = this.site;
   }
   value = this.renderSkinAsString(skin);
   site && (res.handlers.site = site);
   return value;
};

Story.prototype.url_filter = function(value, param, mode) {
   param.limit || (param.limit = 20);
   var re = /(^|\/>|\s+)([\w+-_]+:\/\/[^\s]+?)([\.,;:\)\]\"]?)(?=[\s<]|$)/gim;
   return value.replace(re, function(str, head, url, tail) {
      res.push();
      res.write(head);
      if (mode === "plain") {
         res.write(url.clip(param.limit));
      } else {
         var text = /:\/\/([^\/]*)/.exec(url)[1].clip(param.limit);
         html.link({href: url, title: url}, text);
      }
      res.write(tail);
      return res.pop();
   });
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
