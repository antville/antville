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
// $Revision:3329 $
// $LastChangedBy:piefke3000 $
// $LastChangedDate:2007-09-14 15:18:09 +0200 (Fri, 14 Sep 2007) $
// $URL$
//

/**
 * @fileOverview Defines the Members prototype.
 */

markgettext("Members");
markgettext("members");

/**
 * @name Members
 * @constructor
 * @property {Membership[]} _children
 * @property {Membership[]} contributors
 * @property {Membership[]} managers
 * @property {Membership[]} owners
 * @property {Membership[]} subscribers
 * @extends HopObject
 */

/**
 * 
 * @param {String} action
 * @returns {Boolean}
 */
Members.prototype.getPermission = function(action) {
   switch (action) {
      case "login":
      case "logout":
      case "register":
      case "reset":
      case "salt.js":
      return true;
   }
      
   if (!this._parent.getPermission("main")) {
      return false;
   }

   switch (action) {
      case "edit":
      case "privileges":
      case "subscriptions":
      case "updated":
      return !!session.user;
      
      case ".":
      case "main":
      case "add":
      case "owners":
      case "managers":
      case "contributors":
      case "subscribers":
      return Membership.require(Membership.OWNER) ||
            User.require(User.PRIVILEGED);
   }
   return false;
}

Members.prototype.main_action = function() {
   res.data.title = gettext("Site Members");
   res.data.list = renderList(this, "$Membership#member", 
         10, req.queryParams.page);
   res.data.pager = renderPager(this, this.href(req.action), 
         10, req.queryParams.page);
   res.data.body = this.renderSkinAsString("$Members#main");
   res.handlers.site.renderSkin("Site#page");
   return;
}

Members.prototype.register_action = function() {
   if (req.postParams.register) {
      if (req.postParams.activation) {
         app.log("Detected form submit with completed honeypot field: " + req.data);
         res.redirect(root.href());
      }
      try {
         var title = res.handlers.site.title;
         var user = User.register(req.postParams);
         var membership = new Membership(user, Membership.SUBSCRIBER);
         this.add(membership);
         membership.notify(req.action, user.email, 
               gettext('[{0}] Welcome to {1}!', root.title, title));
         res.message = gettext('Welcome to “{0}”, {1}. Have fun!',
               title, user.name);
         res.redirect(User.getLocation() || this._parent.href());
      } catch (ex) {
         res.message = ex;
      }
   }

   session.data.token = User.getSalt();
   res.data.action = this.href(req.action);
   res.data.title = gettext("Register");
   res.data.body = this.renderSkinAsString("$Members#register");
   this._parent.renderSkin("Site#page");
   return;
}

Members.prototype.reset_action = function() {
   if (req.postParams.reset) {
      try {
         if (!req.postParams.name || !req.postParams.email) {
            throw Error(gettext("Please enter a user name and e-mail address."));
         }
         var user = User.getByName(req.postParams.name);
         if (!user || user.email !== req.postParams.email) {
            throw Error(gettext("User name and e-mail address do not match."))
         }
         var token = User.getSalt();
         user.metadata.set("resetToken", token);
         sendMail(user.email, gettext("[{0}] Password reset confirmation", 
               root.title), user.renderSkinAsString("$User#notify_reset", {
                  href: this.href("reset"),
                  token: token
               }));
         res.message = gettext("A confirmation mail was sent to your e-mail address.");
         res.redirect(this._parent.href());
      } catch(ex) {
         res.message = ex;
      }
   } else if (req.data.user && req.data.token) {
      var user = User.getById(req.data.user);
      if (user) {
         var token = user.metadata.get("resetToken");
         if (token) {
            session.login(user);
            if (req.postParams.save) {
               var password = req.postParams.password;
               if (!password) {
                  res.message = gettext("Please enter a new password.");
               } else if (password !== req.postParams.passwordConfirm) {
                  res.message = gettext("The passwords do not match.");
               } else {
                  user.hash = (password + user.salt).md5();
                  user.metadata.remove("resetToken");
                  res.message = gettext("Your password was changed.");
                  res.redirect(this._parent.href());
               }
            }
            res.data.title = gettext("Reset Password");
            res.data.body = this.renderSkinAsString("$Members#password");
            this._parent.renderSkin("Site#page");
            return;
         }
      }
      res.message = gettext("This URL is not valid for resetting your password.");
      res.redirect(this.href(req.action));
   }
   res.data.action = this.href(req.action);
   res.data.title = gettext("Request Password Reset");
   res.data.body = this.renderSkinAsString("$Members#reset");
   this._parent.renderSkin("Site#page");
   return;
}

Members.prototype.login_action = function() {
   if (req.postParams.login) {
      if (req.postParams.activation) {
         app.log("Detected form submit with completed honeypot field: " + req.data);
         res.redirect(root.href());
      }
      try {
         var user = User.login(req.postParams);
         res.message = gettext('Welcome to {0}, {1}. Have fun!',
               res.handlers.site.getTitle(), user.name);
         res.redirect(User.getLocation() || this._parent.href());
      } catch (ex) {
         res.message = ex;
      }
   }
   session.data.token = User.getSalt();
   res.data.action = this.href(req.action);
   res.data.title = gettext("Login");
   res.data.body = this.renderSkinAsString("$Members#login");
   this._parent.renderSkin("Site#page");
   return;
}

Members.prototype.logout_action = function() {
   if (session.user) {
      res.message = gettext("Good bye, {0}! Looking forward to seeing you again!", 
            session.user.name);
      User.logout();
   }
   res.redirect(this._parent.href());
   return;
}

Members.prototype.edit_action = function() {
   if (req.postParams.save) {
      try {
         session.user.update(req.postParams);
         res.message = gettext("The changes were saved successfully.");
         res.redirect(this._parent.href());
      } catch (err) {
         res.message = err.toString();
      }
   }

   session.data.token = User.getSalt();
   session.data.salt = session.user.salt; // FIXME
   res.data.title = gettext("User Profile");
   res.data.body = session.user.renderSkinAsString("$User#edit");
   this._parent.renderSkin("Site#page");
   return;
}

Members.prototype.salt_js_action = function() {
   res.contentType = "text/javascript";
   var user;
   if (user = User.getByName(req.queryParams.user)) {
      res.write((user.salt || String.EMPTY).toSource());
   }
   return;
}

Members.prototype.owners_action = function() {
   res.data.title = gettext("Site Owners");
   res.data.list = renderList(this.owners, 
         "$Membership#member", 10, req.queryParams.page);
   res.data.pager = renderPager(this.owners, 
         this.href(req.action), 10, req.queryParams.page);
   res.data.body = this.renderSkinAsString("$Members#main");
   res.handlers.site.renderSkin("Site#page");
   return;
}

Members.prototype.managers_action = function() {
   res.data.title = gettext("Site Managers");
   res.data.list = renderList(this.managers, 
         "$Membership#member", 10, req.queryParams.page); 
   res.data.pager = renderPager(this.managers, 
         this.href(req.action), 10, req.queryParams.page);
   res.data.body = this.renderSkinAsString("$Members#main");
   res.handlers.site.renderSkin("Site#page");
   return;
}

Members.prototype.contributors_action = function() {
   res.data.title = gettext("Site Contributors");
   res.data.list = renderList(this.contributors, 
         "$Membership#member", 10, req.queryParams.page);
   res.data.pager = renderPager(this.contributors, 
         this.href(req.action), 10, req.data.page);
   res.data.body = this.renderSkinAsString("$Members#main");
   res.handlers.site.renderSkin("Site#page");
   return;
}

Members.prototype.subscribers_action = function() {
   res.data.title = gettext("Site Subscribers");
   res.data.list = renderList(this.subscribers, 
         "$Membership#member", 10, req.queryParams.page);
   res.data.pager = renderPager(this.subscribers, 
         this.href(req.action), 10, req.queryParams.page);
   res.data.body = this.renderSkinAsString("$Members#main");
   res.handlers.site.renderSkin("Site#page");
   return;
}

Members.prototype.updated_action = function() {
   res.data.title = gettext("Updates");
   res.data.list = session.user.renderSkinAsString("$User#sites");
   res.data.body = session.user.renderSkinAsString("$User#subscriptions");
   res.handlers.site.renderSkin("Site#page");
   return;
}

Members.prototype.privileges_action = function() {
   var site = res.handlers.site;
   res.data.title = gettext("Privileges");
   res.data.list = renderList(session.user.memberships, function(item) {
      res.handlers.subscription = item.site;
      item.renderSkin("$Membership#subscription");
      return;
   });
   res.handlers.site = site;
   res.data.body = session.user.renderSkinAsString("$User#subscriptions");
   res.handlers.site.renderSkin("Site#page");
   return;
}

Members.prototype.subscriptions_action = function() {
   var site = res.handlers.site;
   res.data.title = gettext("Subscriptions");
   res.data.list = renderList(session.user.subscriptions, function(item) {
      res.handlers.subscription = item.site;
      item.renderSkin("$Membership#subscription");
      return;
   });
   res.handlers.site = site;
   res.data.body = session.user.renderSkinAsString("$User#subscriptions");
   res.handlers.site.renderSkin("Site#page");
   return;
}

Members.prototype.add_action = function() {
   if (req.postParams.term) {
      try {
         var result = this.search(req.postParams.term);
         if (result.length < 1) {
            res.message = gettext("No user found to add as member.");
         } else {
            if (result.length >= 100) {
               res.message = gettext("Too many users found, displaying the first {0} matches only.", 
                     result.length);
            } else {
               res.message = ngettext("One user found.", "{0} users found.", 
                      result.length);
            }
            res.data.result = this.renderSkinAsString("$Members#results", result);
         }
      } catch (ex) {
         res.message = ex;
         app.log(ex);
      }
   } else if (req.postParams.add) {
      try {
         var membership = this.addMembership(req.postParams);
         membership.notify(req.action, membership.creator.email,  
               gettext('[{0}] Notification of membership change', root.title));
         res.message = gettext("Successfully added {0} to the list of members.", 
               req.postParams.name);
         res.redirect(membership.href("edit"));
      } catch (ex) {
         res.message = ex;
         app.log(ex);
      }
      res.redirect(this.href());
   }
   res.data.action = this.href(req.action);
   res.data.title = gettext('Add Member');
   res.data.body = this.renderSkinAsString("$Members#add");
   res.handlers.site.renderSkin("Site#page");
   return;
}

/**
 * 
 * @param {String} searchString
 * @returns {Object}
 */
Members.prototype.search = function(searchString) {
   var self = this;
   var mode = "=";
   if (searchString.contains("*")) {
      searchString = searchString.replace(/\*/g, "%");
      mode = "like";
   }
   var sql = new Sql;
   sql.retrieve(Sql.MEMBERSEARCH, mode, searchString, 100);
   var counter = 0, name;
   res.push();
   sql.traverse(function() {
      // Check if the user is not already a member
      if (!self.get(this.name)) {
         self.renderSkin("$Members#result", {name: this.name});
         counter += 1;
      }
   });
   return {
      result: res.pop(),
      length: counter
   };
}

/**
 * 
 * @param {Object} data
 * @returns {Membership}
 */
Members.prototype.addMembership = function(data) {
   var user = root.users.get(data.name);
   if (!user) {
      throw Error(gettext("Sorry, your input did not match any registered user."));
   } else if (this.get(data.name)) {
      throw Error(gettext("This user is already a member of this site."));
   }
   var membership = new Membership(user, Membership.SUBSCRIBER);
   this.add(membership);
   return membership;
}
