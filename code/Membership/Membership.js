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

Membership.prototype.constructor = function(user, role) {
   this.map({
      creator: user,
      name: user.name,
      role: role || Membership.SUBSCRIBER,
      createtime: new Date
   });
   this.touch();
   return this;
};

Membership.prototype.update = function(data) {
   if (!data.role) {
      throw Error(gettext("Please choose a role for this member."));
   } else if (this.user === session.user) {
      throw Error(gettext("Sorry, you are not allowed to edit your own membership."));
   } else if (data.role !== this.role) {
      this.role = data.role;
      this.touch();
      /* FIXME: sendMail(root.sys_email, this.user.email,
            getMessage("mail.statusChange", this.site.title),
            this.renderSkinAsString("mailstatuschange"));*/
   }
   return;
};

Membership.prototype.getPermission = function(action) {
   switch (action) {
      case "edit":
      return this.creator !== session.user;
      case "delete":
      return this.role !== Membership.OWNER;
      case "unsubscribe":
      return this.role === Membership.SUBSCRIBER;
   }
   return true;
}

Membership.prototype.edit_action = function() {
   if (req.postParams.save) {
      try {
         this.update(req.postParams);
         res.message = gettext("The changes were saved successfully.");
         res.redirect(this._parent.href());
      } catch(ex) {
         res.message = ex;
         app.log(ex);
      }
   }
   
   res.data.action = this.href(req.action);
   res.data.title = gettext("Edit membership: {0}", this.name);
   res.data.body = this.renderSkinAsString("edit");
   this.site.renderSkin("page");
   return;
};

Membership.prototype.contact_action = function() {
   if (req.postParams.send) {
      try {
         if (!req.postParams.text) {
            throw Error(gettext("Please enter the message text."));
         }
         var body = this.renderSkinAsString("mailmessage", 
               {text: req.postParams.text});
         sendMail(session.user.email, this.creator.email, 
               gettext("Message from a {0} user", root.sys_title), body);
         res.message = new Message("mailSend");
         res.redirect(this._parent.href());
      } catch(ex) {
         res.message = ex;
         app.log(ex);
      }
   }
   
   res.data.action = this.href(req.action);
   res.data.title = gettext("Send e-mail to {0}", this.username);
   res.data.body = this.renderSkinAsString("mailto");
   this.site.renderSkin("page");
   return;
};

Membership.prototype.delete_action = function() {
   if (req.postParams.proceed) {
      try {
         var url = this._parent.href();
         Membership.remove(this);
         res.message = gettext("Successfully deleted the membership.");
         res.redirect(url);
      } catch(ex) {
         res.message = ex;
         app.log(ex);
      }
   }
   
   res.data.action = this.href(req.action);
   res.data.title = gettext("Delete membership: {0}", this.name);
   res.data.body = this.renderSkinAsString("delete", {
      text: gettext('You are about to delete the membership {0}', this.name)
   });
   this.site.renderSkin("page");
   return;
};

Membership.prototype.getMacroHandler = function(name) {
   switch (name) {
      case "creator":
      return this.creator;
   }
};

Membership.prototype.email_macro = function(param) {
   throw Error("Due to privacy reasons the display of e-mail addresses is disabled.")
};

Membership.prototype.getFormOptions = function(name) {
   switch (name) {
      case "role":
      return Membership.getRoles();
   }
   return;
};

defineConstants(Membership, "getRoles", "Subscriber", "Contributor", 
      "Manager", "Owner");
      
Membership.getLevel = function(role) {
   if (!role) {
      var membership = User.getMembership();
      membership && (role = membership.role);
   }
   switch (role) {
      case Membership.OWNER:
      return 131071;
      case Membership.MANAGER:
      return 16383;
      case Membership.CONTRIBUTOR:
      return 9361;
      case Membership.SUBSCRIBER:
      default:
      return 0;
   }
};

Membership.getPermission = function(role) {
   if (role && res.handlers.membership) {
      return Membership.getLevel(res.handlers.membership.role) - 
            Membership.getLevel(role) >= 0;
   }
   return false;
};
      
Membership.remove = function(membership) {
   if (!membership) {
      throw Error(gettext("Please specify a membership you want to be removed."));
   } else if (membership.role === Membership.OWNER) {
      throw Error(gettext("Sorry, an owner of a site cannot be removed."));
   }
   membership.remove();
   return;
};

/*
Membership.getRoles = function() {
   return [{
      display: Membership.SUBSCRIBER,
      value: 0
   }, {
      display: Membership.CONTRIBUTOR,
      value: Membership.SUBSCRIBER | MAY_ADD_STORY | MAY_ADD_COMMENT | 
            MAY_ADD_IMAGE | MAY_ADD_FILE | MAY_VIEW_STATS
   }, {
      display: Membership.CONTENTMANAGER,
      value: Membership.CONTRIBUTOR | MAY_VIEW_ANYSTORY | MAY_EDIT_ANYSTORY |
            MAY_DELETE_ANYSTORY | MAY_EDIT_ANYCOMMENT | MAY_DELETE_ANYCOMMENT | 
            MAY_EDIT_ANYIMAGE | MAY_DELETE_ANYIMAGE | MAY_EDIT_ANYFILE | 
            MAY_DELETE_ANYFILE
   }, {
      display: Membership.ADMINISTRATOR,
      value: Membership.CONTENTMANAGER | MAY_EDIT_PREFS | MAY_EDIT_LAYOUTS | 
            MAY_EDIT_MEMBERS
   }];
};

Membership.getRole = function(level) {
   switch (parseInt(level, 10)) {
      case 9361:
      return gettext(Membership.CONTRIBUTOR); break;
      
      case 16383:
      return gettext(Membership.CONTENTMANAGER); break;
      
      case 131071:
      return gettext(Membership.ADMINISTRATOR); break;

      default:
      return gettext(Membership.SUBSCRIBER);
   }
};
*/