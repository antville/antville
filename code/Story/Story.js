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

/**
 * @fileOverview Defindes the Story prototype.
 */

markgettext("Story");
markgettext("story");

/**
 * @function
 * @returns {String[]}
 * @see defineConstants
 */
Story.getStatus = defineConstants(Story, markgettext("closed"), 
      markgettext("public"), markgettext("shared"), markgettext("open"));
/**
 * @function
 * @returns {String[]}
 * @see defineConstants
 */
Story.getModes = defineConstants(Story, markgettext("hidden"), 
      markgettext("featured"));
/**
 * @function
 * @returns {String[]}
 * @see defineConstants
 */
Story.getCommentModes = defineConstants(Story, markgettext("closed"), 
      /* markgettext("readonly"), markgettext("moderated"), */ 
      markgettext("open"));

/**
 * 
 */
Story.remove = function() {
   if (this.constructor === Story) {
      HopObject.remove.call(this.comments);
      this.setTags(null);
      this.remove();
   }
   return;
}

this.handleMetadata("title");
this.handleMetadata("text");

/**
 * @name Story
 * @constructor
 * @property {Comment[]} _children
 * @property {String} commentMode
 * @property {Comment[]} comments
 * @property {Date} created
 * @property {User} creator
 * @property {Metadata} metadata
 * @property {String} mode
 * @property {Date} modified
 * @property {User} modifier
 * @property {String} name
 * @property {Number} parent_id
 * @property {String} parent_type
 * @property {String} prototype
 * @property {Number} requests
 * @property {Site} site
 * @property {String} status
 * @property {TagHub[]} tags
 * @property {String} text
 * @property {String} title
 * @extends HopObject
 */
Story.prototype.constructor = function() {
   this.name = String.EMPTY;
   this.requests = 0;
   this.status = Story.PUBLIC;
   this.mode = Story.FEATURED;
   this.commentMode = Story.OPEN;
   this.creator = this.modifier = session.user;
   this.created = this.modified = new Date;
   return this;
}

/**
 * 
 * @param {String} action
 * @returns {Boolean}
 */
Story.prototype.getPermission = function(action) {
   if (!this.site.getPermission("main")) {
      return false;
   }
   switch (action) {
      case ".":
      case "main":
      return this.status !== Story.CLOSED || 
            this.creator === session.user || 
            Membership.require(Membership.MANAGER) || 
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
}

Story.prototype.main_action = function() {
   res.data.title = this.getTitle(5);
   res.data.body = this.renderSkinAsString("Story#main");
   this.site.renderSkin("Site#page");
   this.site.log();
   this.count();
   this.log();
   return;
}

/**
 * 
 * @param {Number} limit
 * @returns {String}
 */
Story.prototype.getTitle = function(limit) {
   var key = this + ":title:" + limit;
   if (!res.meta[key]) {
      if (this.title) {
         res.meta[key] = stripTags(this.title).clip(limit, "...", "\\s");
      } else if (this.text) {
         var parts = stripTags(this.text).embody(limit, "...", "\\s");
         res.meta[key] = parts.head;
         res.meta[this + ":text:" + limit] = parts.tail;
      }
   }
   return String(res.meta[key]) || "..."; 
}

Story.prototype.edit_action = function() {
   if (req.postParams.save) {
      try {
         this.update(req.postParams);
         delete session.data.backup;
         res.message = gettext("The story was successfully updated.");
         res.redirect(this.href());
      } catch (ex) {
         res.message = ex;
         app.log(ex);
      }
   }
   
   res.data.action = this.href(req.action);
   res.data.title = gettext('Edit Story');
   res.data.body = this.renderSkinAsString("Story#edit");
   this.site.renderSkin("Site#page");
   return;
}

/**
 * 
 * @param {Object} data
 */
Story.prototype.update = function(data) {
   var site = this.site || res.handlers.site;
   
   if (!data.title && !data.text) {
      throw Error(gettext("Please enter at least something into the “title” or “text” field."));
   }
   if (data.created) {
      try {
         this.created = data.created.toDate(SHORTDATEFORMAT, 
               site.getTimeZone());
      } catch (ex) {
         throw Error(gettext("Cannot parse timestamp {0} as a date.", data.created));
         app.log(ex);
      }
   }
   
   // Get difference to current content before applying changes
   var delta = this.getDelta(data);
   this.title = data.title ? data.title.trim() : String.EMPTY;
   this.text = data.text ? data.text.trim() : String.EMPTY;
   this.status = data.status || Story.PUBLIC;
   this.mode = data.mode || Story.FEATURED;
   this.commentMode = data.commentMode || Story.OPEN;
   this.setMetadata(data);

   // FIXME: To be removed resp. moved to Stories.create_action and 
   // Story.edit_action if work-around for Helma bug #607 fails
   // We need persistence for setting the tags
   this.isTransient() && this.persist();
   this.setTags(data.tags || data.tag_array);

   if (delta > 50) {
      this.modified = new Date;
      if (this.status !== Story.CLOSED) {
         site.modified = this.modified;
      }
      site.callback(this);
      // Notification is sent in Stories.create_action()
   }
   
   this.clearCache();
   this.modifier = session.user;
   return;
}

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
}

Story.prototype.comment_action = function() {
   // Check if user is logged in since we allow linking here for any user
   if (!User.require(User.REGULAR)) {
      User.setLocation(this.href(req.action) + "#form");
      res.message = gettext("Please login first.");
      res.redirect(this.site.members.href("login"));
   }
   var comment = new Comment(this);
   if (req.postParams.save) {
      try {
         comment.update(req.postParams);
         this.add(comment);
         // Force addition to aggressively cached collection
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
   res.data.title = gettext("Add Comment");
   res.data.body = comment.renderSkinAsString("Comment#edit");
   this.site.renderSkin("Site#page");
   return;
}

/**
 * 
 * @param {String} name
 * @returns {Object}
 */
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
      return this.getTags().join(Tag.DELIMITER);
   }
   return this[name];
}

/**
 * 
 * @param {String} name
 * @returns {String[]}
 */
Story.prototype.getFormOptions = function(name) {
   switch (name) {
      case "commentMode":
      return Story.getCommentModes();
      case "mode":
      return Story.getModes();
      case "status":
      return Story.getStatus();
      case "tags":
      // FIXME: This could become a huge select element...
      return [];
   }
   return;
}

/**
 * 
 * @param {Object} data
 */
Story.prototype.setMetadata = function(data) {
   var name;
   for (var key in data) {
      if (this.isMetadata(key)) {
         this.metadata.set(key, data[key]);
      }
   }
   return;
}

/**
 * 
 * @param {String} name
 */
Story.prototype.isMetadata = function(name) {
   return this[name] === undefined && name !== "save";
}

/**
 * Increment the request counter
 */
Story.prototype.count = function() {
   if (session.user === this.creator) {
      return;
   }
   var story;
   var key = "Story#" + this._id;
   if (story = app.data.requests[key]) {
      story.requests += 1;
   } else {
      app.data.requests[key] = {
         type: this.constructor,
         id: this._id,
         requests: this.requests + 1
      };
   }
   return;
}

/**
 * Calculate the difference of a story’s current and its updated content
 * @param {Object} data
 * @returns {Number}
 */
Story.prototype.getDelta = function(data) {
   if (this.isTransient()) {
      return Infinity;
   }

   var deltify = function(s1, s2) {
      var len1 = s1 ? String(s1).length : 0;
      var len2 = s2 ? String(s2).length : 0;
      return Math.abs(len1 - len2);
   };

   var delta = 0;
   delta += deltify(data.title, this.title);
   delta += deltify(data.text, this.text);
   for (var key in data) {
      if (this.isMetadata(key)) {
         delta += deltify(data[key], this.metadata.get(key))
      }
   }
   // In-between updates (1 hour) get zero delta
   var timex = (new Date - this.modified) > Date.ONEHOUR ? 1 : 0;
   return delta * timex;
}

/**
 * 
 * @param {String} name
 * @returns {HopObject}
 */
Story.prototype.getMacroHandler = function(name) {
   if (name === "metadata") {
      return this.metadata;
   }
   return null;
}

/**
 * 
 * @param {Object} param
 * @param {String} action
 * @param {String} text
 */
Story.prototype.link_macro = function(param, action, text) {
   switch (action) {
      case "rotate":
      if (this.status === Story.CLOSED) {
         text = gettext("Publish");
      } else if (this.mode === Story.FEATURED) {
         text = gettext("Hide");
      } else {
         text = gettext("Close");
      }
   }
   return HopObject.prototype.link_macro.call(this, param, action, text);
}

/**
 * 
 * @param {Object} param
 */
Story.prototype.summary_macro = function(param) {
   param.limit || (param.limit = 15);
   var keys, summary;
   if (arguments.length > 1) {
      res.push();
      var content;
      for (var i=1; i<arguments.length; i+=1) {
         if (content = this.metadata.get("metadata_" + arguments[i])) {
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
}

/**
 * 
 * @param {Object} param
 * @param {String} mode
 */
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
      this.prefetchChildren();
      this.forEach(function() {
         html.openTag("a", {name: this._id});
         html.closeTag("a");
         this.renderSkin(this.parent.constructor === Story ? 
               "Comment#main" : "Comment#reply");
      });
   }
   return;
}

/**
 * 
 * @param {Object} param
 * @param {String} mode
 */
Story.prototype.tags_macro = function(param, mode) {
   if (mode === "link") {
      var tags = [];
      this.tags.list().forEach(function(item) {
         res.push();
         if (item.tag) {
            renderLink(param, item.tag.href(), item.tag.name);
            tags.push(res.pop());
         }
      });
      return res.write(tags.join(Tag.DELIMITER));
   }
   return res.write(this.getFormValue("tags"));
}

/**
 * 
 * @param {Object} param
 * @param {Number} limit
 */
Story.prototype.referrers_macro = function(param, limit) {
   if (!User.require(User.PRIVILEGED) && 
         !Membership.require(Membership.OWNER)) {
      return;
   }

   limit = Math.min(limit || param.limit || 100, 100);
   if (limit < 1) {
      return;
   }

   var self = this;
   var sql = new Sql;
   sql.retrieve(Sql.REFERRERS, "Story", this._id);

   res.push();
   var n = 0;
   sql.traverse(function() {
      if (n < limit && this.requests && this.referrer) {
         this.text = encode(this.referrer.head(50));
         this.referrer = encode(this.referrer);
         self.renderSkin("$Story#referrer", this);
      }
      n += 1;
   });
   param.referrers = res.pop();
   if (param.referrers) {
      this.renderSkin("$Story#referrers", param);
   }
   return;   
}

/**
 * 
 * @param {Object} value
 * @param {Object} param
 * @param {String} mode
 * @returns {String}
 */
Story.prototype.format_filter = function(value, param, mode) {
   if (value) {
      switch (mode) {
         case "plain":
         return this.url_filter(stripTags(value), param, mode);
         
         case "quotes":
         return stripTags(value).replace(/(\"|\')/g, function(str, quotes) {
            return "&#" + quotes.charCodeAt(0) + ";";
         });
         
         case "image":
         var image = HopObject.getFromPath(value, "images");
         if (image) {
            res.push();
            image.render_macro(param);
            return res.pop();
         }
         break;
         
         default:
         value = this.macro_filter(format(value), param);
         return this.url_filter(value, param);
      }
   }
   return String.EMTPY;
}

/**
 * 
 * @param {String|Skin} value
 * @param {Object} param
 * @returns {String}
 */
Story.prototype.macro_filter = function(value, param) {
   var skin = value.constructor === String ? createSkin(value) : value;
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
}

/**
 * 
 * @param {String} value
 * @param {Object} param
 * @param {String} mode
 * @returns {String}
 */
Story.prototype.url_filter = function(value, param, mode) {
   param.limit || (param.limit = 50);
   // FIXME: The first RegExp has troubles with <a href=http://... (no quotes)
   //var re = /(^|\/>|\s+)([\w+-_]+:\/\/[^\s]+?)([\.,;:\)\]\"]?)(?=[\s<]|$)/gim;
   var re = /(^|\/>|\s+)([!fhtpsr]+:\/\/[^\s]+?)([\.,;:\)\]\"]?)(?=[\s<]|$)/gim
   return value.replace(re, function(str, head, url, tail) {
      if (url.startsWith("!")) {
         return head + url.substring(1) + tail;
      }
      res.push();
      res.write(head);
      if (mode === "plain") {
         res.write(url.clip(param.limit));
      } else {
         var text, location = /:\/\/([^\/]*)/.exec(url)[1];
         text = location;
         if (mode === "extended") {
            text = url.replace(/^.+\/([^\/]*)$/, "$1");
         }
         html.link({href: url, title: url}, text.clip(param.limit));
         if (mode === "extended" && text !== location) {
            res.write(" <small>(" + location + ")</small>");
         }
      }
      res.write(tail);
      return res.pop();
   });
}

/**
 * @returns {String}
 */
Story.prototype.getConfirmText = function() {
   return gettext("You are about to delete a story by user {0}.", 
         this.creator.name);
}
