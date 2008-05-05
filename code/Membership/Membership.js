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

Membership.getByName = function(name) {
   return res.handlers.site.members.get(name);
}

Membership.require = function(role) {
   if (res.handlers.membership) {
      return res.handlers.membership.require(role);
   }
   return false;
}
      
Membership.getRoles = defineConstants(Membership, "Subscriber", "Contributor", 
      "Manager", "Owner");
      
Membership.remove = function(membership) {
   if (membership && membership.constructor === Membership) {
      if (!membership.getPermission("delete")) {
         throw Error(gettext("Sorry, an owner of a site cannot be removed."));
      }
      var recipient = membership.creator.email;
      membership.remove();
      if (req.action === "delete") {
         membership.notify(req.action, recipient,  
               gettext("Notification of membership cancellation"));
      }
   }
   return;
}

Membership.prototype.constructor = function(user, role) {
   user || (user = session.user);
   if (user) {
      this.map({
         creator: user,
         name: user.name,
         role: role,
         created: new Date
      });
      this.touch();
   }
   return this;
}

Membership.prototype.getPermission = function(action) {
   switch (action) {
      case "contact": return true;
      case "edit":
      return this.creator !== session.user;
      case "delete":
      return this.role !== Membership.OWNER;
   }
   return false;
}

Membership.prototype.getFormOptions = function(name) {
   switch (name) {
      case "role":
      return Membership.getRoles();
   }
   return;
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
   res.data.title = gettext("Edit membership {0}", this.name);
   res.data.body = this.renderSkinAsString("$Membership#edit");
   this.site.renderSkin("Site#page");
   return;
}

Membership.prototype.update = function(data) {
   if (!data.role) {
      throw Error(gettext("Please choose a role for this member."));
   } else if (this.user === session.user) {
      throw Error(gettext("Sorry, you are not allowed to edit your own membership."));
   } else if (data.role !== this.role) {
      this.role = data.role || Membership.SUBSCRIBER;
      this.touch();
      this.notify(req.action, this.creator.email, 
            gettext("Notification of membership change"));
   }
   return;
}

Membership.prototype.contact_action = function() {
   if (req.postParams.send) {
      try {
         if (!req.postParams.text) {
            throw Error(gettext("Please enter the message text."));
         }
         this.notify(req.action, this.creator.email, 
               gettext('Message from user {0} of {1}', 
               session.user.name, root.title));
         res.message = gettext("Your message was sent successfully.");
         res.redirect(this._parent.href());
      } catch(ex) {
         res.message = ex;
         app.log(ex);
      }
   }
   
   res.data.action = this.href(req.action);
   res.data.title = gettext('Contact user {0}', this.name);
   res.data.body = this.renderSkinAsString("$Membership#contact");
   this.site.renderSkin("Site#page");
   return;
}

Membership.prototype.getMacroHandler = function(name) {
   switch (name) {
      case "creator":
      return this.creator;
   }
}

Membership.prototype.email_macro = function(param) {
   throw Error("Due to privacy reasons the display of e-mail addresses is disabled.")
}

Membership.prototype.status_macro = function() {
   this.renderSkin(session.user ? "Membership#status" : "Membership#login");
   return;
}

Membership.prototype.link_filter = function(value, param) {
   if (this.isTransient()) {
      return value;
   }
   return HopObject.prototype.link_filter.call(this, value, 
         param, this.creator.url); // || this.href());
}

Membership.prototype.require = function(role) {
   var roles = [Membership.SUBSCRIBER, Membership.CONTRIBUTOR, 
         Membership.MANAGER, Membership.OWNER];
   if (role) {
      return roles.indexOf(this.role) >= roles.indexOf(role);
   }
   return false;
}

Membership.prototype.notify = function(action, recipient, subject) {
   switch (action) {
      case "add":
      case "contact":
      case "delete":
      case "edit":
      case "register":
      res.handlers.sender = User.getMembership();
      sendMail(root.email, recipient, subject,
            this.renderSkinAsString("$Membership#notify_" + action));
   }
   return;
}

Membership.prototype.valueOf = Membership.prototype.toString;

Membership.prototype.toString = function() {
   return "the membership of user " + this.name + " in site " + this.site.name;
}
