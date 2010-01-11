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
 * @fileOverview Defines the Comment prototype.
 */

/**
 * @see defineConstants
 */
Comment.getStatus = defineConstants(Comment, "closed", 
      "pending", "readonly", "public");

/**
 * @returns {String}
 */
Comment.remove = function(options) {
   if (this.constructor !== Comment) {
      return;
   }
   if (options && options.mode === "user" && options.confirm === "1") {
      var sql = new Sql;
      sql.retrieve("select id from content where site_id = $0 and creator_id = $1 \
            and prototype = 'Comment'", this.site._id, this.creator._id);
      sql.traverse(function() {
         Comment.remove.call(Comment.getById(this.id));
      });
   } else {
      while (this.size() > 0) {
         Comment.remove.call(this.get(0));
      }
      // Explicitely remove comment from aggressively cached collections:
      (this.parent || this).removeChild(this);
      this.story.comments.removeChild(this);
      this.remove();
   }
   return this.parent.href();
}

/**
 * @name Comment
 * @constructor
 * @param {Object} parent
 * @property {Comment[]} _children
 * @property {String} name
 * @property {Story|Comment} parent
 * @property {Story} story
 * @extends Story
 */
Comment.prototype.constructor = function(parent) {
   this.name = String.EMPTY;
   this.site = parent.site;
   this.story = parent.story || parent;
   this.parent = parent;
   // FIXME: Correct parent_type (Helma bug?)
   this.parent_type = parent._prototype;
   this.status = Story.PUBLIC;
   this.creator = this.modifier = session.user;
   this.created = this.modified = new Date;
   return this;
}

/**
 * 
 * @param {Object} action
 * @returns {Boolean}
 */
Comment.prototype.getPermission = function(action) {
   switch (action) {
      case ".":
      case "main":
      case "comment":
      // FIXME: temporary fix for lost stories due to shrunk database
      if (!this.story) {
         return false;
      }
      return this.site.commentMode === Site.ENABLED &&
            this.story.getPermission(action) && 
            this.status !== Comment.CLOSED &&
            this.status !== Comment.PENDING;
      case "delete":
      case "edit":
      return this.story.getPermission.call(this, "delete");
   }
   return false;
}

/**
 * 
 * @param {Object} action
 * @returns {String}
 */
Comment.prototype.href = function(action) {
   var buffer = [];
   switch (action) {
      case null:
      case undefined:
      case "":
      case ".":
      case "main":
      buffer.push(this.story.href(), "#", this._id);
      break;
      default:
      buffer.push(this.story.comments.href(), this._id, "/", action);
   }
   return buffer.join(String.EMPTY);
}

Comment.prototype.edit_action = function() {
   if (req.postParams.save) {
      try {
         this.update(req.postParams);
         delete session.data.backup;
         res.message = gettext("The comment was successfully updated.");;
         res.redirect(this.story.href() + "#" + this._id);
      } catch (ex) {
         res.message = ex;
         app.log(ex);
      }
   }
   
   res.handlers.parent = this.parent;
   res.data.action = this.href(req.action);
   res.data.title = gettext("Edit Comment");
   res.data.body = this.renderSkinAsString("Comment#edit");
   this.site.renderSkin("Site#page");
   return;
}

/**
 * 
 * @param {Object} data
 */
Comment.prototype.update = function(data) {
   if (!data.title && !data.text) {
      throw Error(gettext("Please enter at least something into the “title” or “text” field."));
   }
   // Get difference to current content before applying changes
   var delta = this.getDelta(data);
   this.title = data.title;
   this.text = data.text;
   this.setMetadata(data);

   if (this.story.commentMode === Story.MODERATED) {
      this.mode = Comment.PENDING;
   } else if (delta > 50) {
      this.modified = new Date;
      if (this.story.status !== Story.CLOSED) { 
         this.site.modified = this.modified;
      }
      // We need persistence for adding the callback
      this.isTransient() && this.persist();
      res.handlers.site.callback(this);
      // FIXME: Where did this.notify(req.action) go?
   }
   this.clearCache();
   this.modifier = session.user;
   return;
}

/**
 * 
 * @param {String} name
 * @returns {HopObject} 
 */
Comment.prototype.getMacroHandler = function(name) {
   if (name === "related") {
      return this.creator.comments;
   }
   return null;
}
