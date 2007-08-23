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
 * constructor function for membership objects
 */
Membership.prototype.constructor = function(usr, level) {
   this.user = usr;
   this.username = usr.name;
   this.level = level ? level : SUBSCRIBER;
   this.createtime = new Date();
   return this;
};

/**
 * edit action
 */
Membership.prototype.edit_action = function() {
   if (req.data.cancel)
      res.redirect(this._parent.href());
   else if (req.data.save) {
      try {
         res.message = this.updateMembership(parseInt(req.data.level, 10), session.user);
         res.redirect(this._parent.href());
      } catch (err) {
         res.message = err.toString();
      }
   }
   
   res.data.action = this.href(req.action);
   res.data.title = getMessage("Membership.editTitle", {userName: this.username});
   res.data.body = this.renderSkinAsString("edit");
   this.site.renderSkin("page");
   return;
};

/**
 * delete action
 */
Membership.prototype.delete_action = function() {
   if (req.data.cancel)
      res.redirect(this._parent.href());
   else if (req.data.remove) {
      try {
         var url = this._parent.href();
         res.message = this._parent.deleteMembership(this);
         res.redirect(url);
      } catch (err) {
         res.message = err.toString();
      }
   }
   
   res.data.action = this.href(req.action);
   res.data.title = getMessage("Membership.deleteTitle", {userName: this.username});
   var skinParam = {
      description: getMessage("Membership.deleteDescription"),
      detail: this.username
   };
   res.data.body = this.renderSkinAsString("delete", skinParam);
   this.site.renderSkin("page");
   return;
};

/**
 * send an e-mail to the user owning this membership
 */
Membership.prototype.mailto_action = function() {
   if (req.data.cancel)
      res.redirect(this._parent.href());
   else if (req.data.send) {
      if (req.data.text) {
         try {
            var mailbody = this.renderSkinAsString("mailmessage", {text: req.data.text});
            sendMail(session.user.email, this.user.email, 
                  getMessage("mail.toUser", root.sys_title), mailbody);
            res.message = new Message("mailSend");
            res.redirect(this._parent.href());
         } catch (err) {
            res.message = err.toString();
         }
      } else {
         res.message = new Exception("mailTextMissing");
      }
   }
   
   res.data.action = this.href(req.action);
   res.data.title = getMessage("Membership.sendEmailTitle", {userName: this.username});
   res.data.body = this.renderSkinAsString("mailto");
   this.site.renderSkin("page");
   return;
};

/**
 * macro renders the username
 */
Membership.prototype.username_macro = function(param) {
   if (param.linkto && (param.linkto != "edit" || this.user != session.user))
      Html.link({href: this.href(param.linkto)}, this.username);
   else
      res.write(this.username);
   return;
};

/**
 * macro renders e-mail address
 */
Membership.prototype.email_macro = function(param) {
   if (this.user.publishemail)
      return this.user.email;
   return "***";
};

/**
 * macro renders a member's url as text or link
 */
Membership.prototype.url_macro = function(param) {
   if (!this.user.url)
      return;
   if (param.as == "link")
      Html.link({href: this.user.url}, this.user.url);
   else
      res.write(this.user.url);
   return;
};

/**
 * macro renders user-level
 */
Membership.prototype.level_macro = function(param) {
   if (param.as == "editor")
      Html.dropDown({name: "level"}, getRoles(), this.level, param.firstOption);
   else
      res.write(getRole(this.level));
   return;
};

/**
 * macro renders the username
 */
Membership.prototype.editlink_macro = function(param) {
   if (this.user != session.user)
      Html.link({href: this.href("edit")}, param.text ? param.text : getMessage("generic.edit"));
   return;
};

/**
 * macro renders a link for deleting a membership
 */
Membership.prototype.deletelink_macro = function(param) {
   if (this.level != ADMIN)
      Html.link({href: this.href("delete")},
                param.text ? param.text : getMessage("generic.remove"));
   return;
};

/**
 * macro renders a link to unsubscribe-action
 */
Membership.prototype.unsubscribelink_macro = function(param) {
   if (this.level == SUBSCRIBER)
      Html.link({href: this.site.href("unsubscribe")},
                param.text ? param.text : getMessage("Membership.unsubscribe"));
   return;
};

/**
 * function updates a membership
 * @param Int Integer representing role of user
 * @param Obj User-object modifying this membership
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */
Membership.prototype.updateMembership = function(lvl, modifier) {
   if (isNaN(lvl))
      throw new Exception("memberNoRole");
   // editing the own membership is denied
   if (this.user == modifier)
      throw new DenyException("memberEditSelf");
   if (lvl != this.level) {
      this.level = lvl;
      this.modifier = modifier;
      this.modifytime = new Date();
      sendMail(root.sys_email, this.user.email,
            getMessage("mail.statusChange", this.site.title),
            this.renderSkinAsString("mailstatuschange"));
   }
   return new Message("update");
};

/**
 * permission check (called by hopobject.onRequest())
 * @param String name of action
 * @param Obj User object
 * @param Int Membership level
 * @return Obj Exception object or null
 */
Membership.prototype.checkAccess = function(action, usr, level) {
   checkIfLoggedIn(this.href(req.action));
   try {
      this._parent.checkEditMembers(usr, level);
   } catch (deny) {
      res.message = deny.toString();
      res.redirect(this.site.href());
   }
   return;
};
