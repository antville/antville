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

Comment.prototype.constructor = function(parent) {
   this.site = parent.site;
   this.story = parent.story || parent;
   this.parent = parent;
   // FIXME: Correct parent_type (Helma bug?)
   this.parent_type = parent._prototype;
   this.status = Story.PUBLIC;
   this.mode = Story.READONLY;
   this.creator = this.modifier = session.user;
   this.created = this.modified = new Date;
   return this;
};

Comment.prototype.href = function(action) {
   if (!action || action === "." ||Êaction === "main") {
      return this.story.href() + "#" + this._id;
   } else {
      return HopObject.prototype.href.apply(this, arguments);
   }
};

Comment.prototype.getPermission = function(action) {
   switch (action) {
      case ".":
      case "main":
      return true;
      case "comment":
      return !!session.user;
      case "delete":
      case "edit":
      return User.getPermission(User.PRIVILEGED) ||
            session.user === this.creator;
   }
   return false;
};

Comment.prototype.main_action = function() {
   return res.redirect(this.href());
};

Comment.prototype.edit_action = function() {
   if (session.data.rescuedText) {
      restoreRescuedText();
   }
   
   if (req.postParams.save) {
      try {
         this.update(req.postParams);
         res.message = gettext("The comment was successfully updated.");;
         res.redirect(this.story.href() + "#" + this._id);
      } catch (ex) {
         res.message = ex;
         app.log(ex);
      }
   }
   
   res.data.action = this.href(req.action);
   res.data.title = "Edit comment to story " + res.handlers.story.getTitle();
   res.data.body = this.renderSkinAsString("edit");
   this.site.renderSkin("page");
   return;
};

Comment.prototype.update = function(data) {
   var delta = this.getDelta(data);
   if (!data.title && !data.text) {
      throw Error(gettext("Please enter at least something into the 'title' or 'text' field."));
   }
   this.title = data.title;
   this.text = data.text;
   this.setContent(data);
   if (res.handlers.story.status === Story.PRIVATE && delta > 50) {
      res.handlers.site.lastUpdate = new Date;
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
   return;
};

Comment.prototype.___comment_action = function() {
   if (session.data.rescuedText) {
      restoreRescuedText();
   }
   
   var comment = new Comment;
   if (req.postParams.save) {
      try {
         comment.update(req.postParams);
         this.add(comment);
         res.message;
         res.redirect(comment.href());
      } catch (err) {
         res.message = err.toString();
      }
   }
   
   res.data.action = this.href(req.action);
   res.data.title = gettext("Reply to comment of story {0}", 
         res.handlers.story.getTitle());
   res.data.body = this.renderSkinAsString("toplevel");
   res.data.body += comment.renderSkinAsString("edit");
   this.site.renderSkin("page");
   return;
};

Comment.prototype.checkAccess = function(action, usr, level) {
   try {
      switch (action) {
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
            this.story.checkPost(usr, level);
            break;
      }
   } catch (deny) {
      res.message = deny.toString();
      res.redirect(this.story.href());
   }
   return;
};

Comment.prototype.checkEdit = function(usr, level) {
   if (this.creator != usr && (level & MAY_EDIT_ANYCOMMENT) == 0)
      throw new DenyException("commentEdit");
   return;
};

Comment.ONLINE = "online";
Comment.OFFLINE = "offline";
