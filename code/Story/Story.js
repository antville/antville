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

Story.getStatus = defineConstants(Story, "closed", "public", "shared", "open");
Story.getModes = defineConstants(Story, "hidden", "featured");
Story.getCommentModes = defineConstants(Story, "closed", 
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
      return this.site.commentMode === Site.ENABLED &&
            (this.commentMode === Story.OPEN ||
            this.commentMode === Story.MODERATED);
      case "delete":
      return this.creator === session.user || 
            Membership.require(Membership.MANAGER) ||
            User.require(User.PRIVILEGED);            
      case "edit":
      case "rotate":
      return this.creator === session.user || 
            Membership.require(Membership.MANAGER) || 
            (this.status === Story.SHARED &&
            Membership.require(Membership.CONTRIBUTOR)) || 
            (this.status === Story.OPEN && 
            Membership.require(Membership.SUBSCRIBER)) ||
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
   this.logRequest();
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
   if (req.postParams.save) {
      //try {
         this.update(req.postParams);
         delete session.data.backup;
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
      case "commentMode":
      return this.commentMode || Story.OPEN;
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
      case "commentMode":
      return Story.getCommentModes();
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
   this.commentMode = data.commentMode;
   this.mode = data.mode;
   this.status = data.status;
   if (this.status !== Story.CLOSED && delta > 50) {
      site.hitchWebHook();
      site.lastUpdate = new Date;
   }
   this.touch();
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
   return res.redirect(req.data.http_referer || this._parent.href());
};

Story.prototype.comment_action = function() {
   if (!User.require(User.REGULAR)) {
      User.pushLocation(this.href(req.action) + "#form");
      res.message = gettext("Please login to add a comment.");
      res.redirect(this.site.members.href("login"));
   }
   var comment = new Comment(this);
   if (req.postParams.save) {
      try {
         comment.update(req.postParams);
         this.add(comment);
         // Force addition to aggressively cached subcollection
         (this.story || this).comments.add(comment);
         comment.notify(req.action);
         delete session.data.backup;
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
   this.logRequest();
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
   if (story.site.commentMode === Site.DISABLED || 
         story.commentMode === Site.CLOSED) {
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

Story.prototype.logRequest = function() {
   if (session.user === this.creator) {
      return;
   }
   var entry;
   if (entry = app.data.stories[this._id]) {
      entry.requests += 1;
   } else {
      app.data.stories[this._id] = {
         story: this,
         requests: this.requests + 1
      };
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
   var skin = value.constructor === String ? createSkin(format(value)) : value;
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
   if (this.isTransient()) {
      return Infinity;
   }

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
   // In-between updates (10 min) get zero delta
   var timex = (new Date - this.modified) > Date.ONEMINUTE * 10 ? 1 : 0;
   return delta * timex;
};
