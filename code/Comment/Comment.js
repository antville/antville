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
 * main action
 */
Comment.prototype.main_action = function() {
   // since comments don't have their own page, we redirect to
   // story together with an anchor to this comment
   res.redirect(this.story.href() + "#" + this._id);
   return;
};

/**
 * comment action
 */
Comment.prototype.comment_action = function() {
   // restore any rescued text
   if (session.data.rescuedText)
      restoreRescuedText();
   
   if (req.data.cancel)
      res.redirect(this.story.href());
   else if (req.data.save) {
      try {
         var result = this.evalComment(req.data, session.user);
         res.message = result.toString();
         res.redirect(this.story.href() + "#" + result.id);
      } catch (err) {
         res.message = err.toString();
      }
   }
   
   res.data.action = this.href(req.action);
   res.data.title = this.site.title;
   if (this.story.title)
      res.data.title += " - " + encode(this.story.title);
   res.data.body = this.renderSkinAsString("toplevel");
   res.data.action = this.href("comment");
   res.data.body += (new Comment()).renderSkinAsString("edit");
   this.site.renderSkin("page");
   return;
};

/**
 * edit action
 */
Comment.prototype.edit_action = function() {
   // restore any rescued text
   if (session.data.rescuedText)
      restoreRescuedText();
   
   if (req.data.cancel)
      res.redirect(this.story.href());
   else if (req.data.save) {
      try {
         res.message = this.updateComment(req.data);
         res.redirect(this.story.href() + "#" + this._id);
      } catch (err) {
         res.message = err.toString();
      }
   }
   
   res.data.action = this.href(req.action);
   res.data.title = this.site.title;
   if (this.story.title)
      res.data.title += " - " + encode(this.story.title);
   res.data.body = this.renderSkinAsString("edit");
   this.site.renderSkin("page");
   return;
};

/**
 * delete action
 */
Comment.prototype.delete_action = function() {
   if (req.data.cancel)
      res.redirect(this.story.href());
   else if (req.data.remove) {
      try {
         var url = this.story.href();
         res.message = this.story.deleteComment(this);
         res.redirect(url);
      } catch (err) {
         res.message = err.toString();
      }
   }
   
   res.data.action = this.href(req.action);
   res.data.title = this.site.title;
   var skinParam = {
      description: getMessage("Comment.deleteDescription"),
      detail: this.creator.name
   };
   res.data.body = this.renderSkinAsString("delete", skinParam);
   this.site.renderSkin("page");
   return;
};
/**
 * macro renders a link to reply to a comment
 */
Comment.prototype.replylink_macro = function(param) {
   if (this.site.properties.get("discussions") && req.action == "main") {
      Html.openLink({href: this.href("comment") +
                     (param.anchor ? "#" + param.anchor : "")});
      if (param.image && this.site.images.get(param.image))
         renderImage(this.site.images.get(param.image), param);
      else
         res.write(param.text ? param.text : getMessage("Comment.reply"));
      Html.closeLink();
   }
   return;
};

/**
 * macro renders the url of this comment
 */
Comment.prototype.url_macro = function(param) {
   res.write(this.story.href() + "#" + this._id);
   return;
};

/**
 * constructor function for comment objects
 */
Comment.prototype.constructor = function(site, creator, ipaddress) {
   this.site = site;
   this.online = 1;
   this.editableby = EDITABLEBY_ADMINS;
   this.ipaddress = ipaddress;
   this.creator = creator;
   this.createtime = this.modifytime = new Date();
   return this;
};

/**
 * function evaluates changes to posting
 * @param Obj Object containing the properties needed for creating a reply
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */

Comment.prototype.updateComment = function(param) {
   // collect content
   var content = extractContent(param, this.content.getAll());
   if (!content.exists)
      throw new Exception("textMissing");
   this.content.setAll(content.value);
   // let's keep the comment title property:
   this.title = content.value.title;
   if (content.isMajorUpdate) {
      this.modifytime = new Date();
      // send e-mail notification
      if (this.site.isNotificationEnabled()) 
         this.site.sendNotification("update", this);
   }
   this.ipaddress = param.http_remotehost;
   // add the modified story to search index
   app.data.indexManager.getQueue(this.site).add(this);
   return new Message("update");
};
/**
 * permission check (called by hopobject.onRequest())
 * @param String name of action
 * @param Obj User object
 * @param Int Membership level
 * @return Obj Exception object or null
 */
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

/**
 * check if user is allowed to edit a comment
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
Comment.prototype.checkEdit = function(usr, level) {
   if (this.creator != usr && (level & MAY_EDIT_ANYCOMMENT) == 0)
      throw new DenyException("commentEdit");
   return;
};

Comment.ONLINE = "online";
Comment.OFFLINE = "offline";
