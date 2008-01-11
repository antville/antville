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

Comment.getStatus = defineConstants(Comment, "closed", 
      "pending", "readonly", "public");

Comment.prototype.constructor = function(parent) {
   this.site = parent.site;
   this.story = parent.story || parent;
   this.parent = parent;
   // FIXME: Correct parent_type (Helma bug?)
   this.parent_type = parent._prototype;
   this.status = Story.PUBLIC;
   this.creator = this.modifier = session.user;
   this.created = this.modified = new Date;
   return this;
};

Comment.prototype.getPermission = function(action) {
   switch (action) {
      case ".":
      case "main":
      case "comment":
      return this.site.commentMode === Site.ENABLED &&
            this.story.getPermission(action) && 
            this.status !== Comment.CLOSED &&
            this.status !== Comment.PENDING;
      case "delete":
      case "edit":
      return this.story.getPermission.call(this, "delete");
   }
   return false;
};

Comment.prototype.main_action = function() {
   return res.redirect(this.story.href() + "#" + this._id);
};

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
   res.data.title = gettext("Edit comment to story {0}", 
         res.handlers.story.getTitle());
   res.data.body = this.renderSkinAsString("Comment#edit");
   this.site.renderSkin("page");
   return;
};

Comment.prototype.update = function(data) {
   if (!data.title && !data.text) {
      throw Error(gettext("Please enter at least something into the 'title' or 'text' field."));
   }
   this.title = data.title;
   this.text = data.text;
   this.setContent(data);
   if (this.site.commentMode === Site.MODERATED || 
         this.story.commentMode === Site.MODERATED) {
      this.mode = Comment.PENDING;
   } else if (this.story.status === Story.PRIVATE && 
         this.getDelta(data) > 50) {
      this.site.lastUpdate = new Date;
   }
   this.touch();
   return;
};

Comment.remove = function() {
   if (this.constructor !== Comment) {
      return;
   }
   while (this.size() > 0) {
      Comment.remove.call(this.get(0));
   }
   // Force removal from aggressively cached collections:
   (this.parent || this).removeChild(this);
   this.story.comments.removeChild(this);
   this.remove();
   return this.parent.href();
};
