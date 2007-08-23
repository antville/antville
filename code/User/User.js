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

User.prototype.constructor = function(data) {
   var now = new Date;
   this.value({
      name: data.name,
      hash: data.hash,
      salt: session.data.token,
      email: data.email,
      status: User.DEFAULT,
      registered: now,
      lastVisit: now
   });
   return this;
};

User.prototype.value = function(key, value) {
   var self = this;

   var getter = function() {
      switch (key) {
         case "hash":
         case "salt":
         case "url":
         return self.properties.get(key);

         default:
         return self[key];
      }
   };
   
   var setter = function() {
      switch (key) {
         case "email":
         case "lastVisit":
         case "name":
         case "registered":
         case "status":
         return self[key] = value;
         
         default:
         return self.properties.set(key, value);
      }
   };

   return HopObject.prototype.value.call(this, key, value, getter, setter);
};

User.prototype.touch = function() {
   this.value("lastVisit", new Date);
   return;
};

User.prototype.getDigest = function(token) {
   token || (token = String.EMPTY);
   return (this.value("hash") + token).md5();
};

/**
 * update user-profile
 * @param Obj Object containing form values
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */
User.prototype.update = function(data) {
   if (!data.digest && data.password) {
      data.digest = ((data.password + this.value("salt")).md5() + 
            session.data.token).md5();
   }
   if (data.digest) {
      if (data.digest !== this.getDigest(session.data.token)) {
         throw Error(gettext("Oops, your old password is incorrect. Please re-enter it."));
      }
      if (!data.hash) {
         if (!data.newPassword || !data.newPasswordConfirm) {
            throw Error(gettext("Please specify a new password."));
         } else if (data.newPassword !== data.newPasswordConfirm) {
            throw Error(gettext("Unfortunately, your passwords didn't match. Please repeat your input."));
         }
         data.hash = (data.newPassword + session.data.token).md5();
      }
      this.value({
         hash: data.hash,
         salt: session.data.token         
      });
   }
   this.value({
      url: evalURL(data.url),
      email: evalEmail(data.email),
   });
   return this;
};

User.prototype.status_macro = function(param) {
   // This macro is allowed for privileged users only
   if (!getPermission(User.PRIVILEGED)) {
      return;
   }
   if (param.as === "editor") {
      var options = {};
      for each (var status in User.status) {
         options[status] = status;
      }
      Html.dropDown({name: "status"}, options, this.value("status"));
   } else {
      res.write(this.value("status"));
   }
   return;
   
};

/**
 * macro rendering username
 */
User.prototype.name_macro = function(param) {
   var url;
   if (param.as === "link" && (url = this.value("url"))) {
      Html.link({href: this.value("url")}, this.value("name"));
   } else {
      res.write(this.value("name"));
   }
   return;
};

/**
 * macro rendering password
 */
User.prototype.password_macro = function(param) {
   if (param.as == "editor") {
      Html.password(this.createInputParam("password", param));
   }
   return;
};

/**
 * macro rendering URL
 */
User.prototype.url_macro = function(param) {
   if (param.as == "editor") {
      Html.input(this.createInputParam("url", param));
   } else {
      res.write(this.url);
   }
   return;
};

/**
 * macro rendering email
 */
User.prototype.email_macro = function(param) {
   if (param.as == "editor") {
      Html.input(this.createInputParam("email", param));
   } else {
      res.write(this.email);
   }
   return;
};

/**
 * macro renders the sites the user is a member of or has subscribed to
 * in order of their last update-timestamp
 */
User.prototype.sitelist_macro = function(param) {
   var memberships = session.user.list();
   memberships.sort(new Function("a", "b", "return b.site.lastupdate - a.site.lastupdate"));
   for (var i in memberships) {
      var site = memberships[i].site;
      if (!site)
         continue;
      site.renderSkin("preview");
   }
   return;
};

/**
 * macro counts
 */
User.prototype.sysmgr_count_macro = function(param) {
   if (!param || !param.what)
      return;
   // this macro is allowed just for sysadmins
   if (!session.user.sysadmin)
      return;
   switch (param.what) {
      case "stories" :
         return this.stories.size();
      case "comments" :
         return this.comments.size();
      case "images" :
         return this.images.size();
      case "files" :
         return this.files.size();
   }
   return;
};

/**
 * function renders the statusflags for this user
 */
User.prototype.sysmgr_statusflags_macro = function(param) {
   // this macro is allowed just for sysadmins
   if (!session.user.sysadmin)
      return;
   if (this.trusted)
      res.write("<span class=\"flagDark\" style=\"background-color:#009900;\">TRUSTED</span>");
   if (this.sysadmin)
      res.write("<span class=\"flagDark\" style=\"background-color:#006600;\">SYSADMIN</span>");
   if (this.blocked)
      res.write("<span class=\"flagDark\" style=\"background-color:#000000;\">BLOCKED</span>");
   return;
};

/**
 * function renders an edit-link
 */
User.prototype.sysmgr_editlink_macro = function(param) {
   // this macro is allowed just for sysadmins
   if (!session.user.sysadmin || req.data.edit == this.name || session.user == this)
      return;
   param.linkto = "users";
   param.urlparam = "item=" + this.name + "&action=edit";
   if (req.data.page)
      param.urlparam += "&page=" + req.data.page;
   param.anchor = this.name;
   Html.openTag("a", root.manage.createLinkParam(param));
   res.write(param.text ? param.text : getMessage("generic.edit"));
   Html.closeTag("a");
   return;
};

/**
 * macro renders the username as plain text
 */
User.prototype.sysmgr_username_macro = function(param) {
   res.write(this.name);
   return;
};

/**
 * macro renders the timestamp of registration
 */
User.prototype.sysmgr_registered_macro = function(param) {
   // this macro is allowed just for sysadmins
   if (!session.user.sysadmin)
      return;
   fmt=param.format ? param.format : "dd.MM.yyyy HH:mm";
   res.write(this.registered.format(fmt));
   return;
};

/**
 * macro renders the timestamp of last visit
 */

User.prototype.sysmgr_lastvisit_macro = function(param) {
   // this macro is allowed just for sysadmins
   if (!session.user.sysadmin)
      return;
   if (this.lastvisit) {
      fmt=param.format ? param.format : "dd.MM.yyyy HH:mm";
      res.write(this.lastvisit.format(fmt));
   }
   return;
};

/** 
 * macro renders links to last items of this user
 */
User.prototype.sysmgr_lastitems_macro = function(param) {
   var max = param.max ? parseInt(param.max) : 5;
   var coll = this[param.what];
   var cnt = Math.min(coll.count(), max);
   for (var i=0; i<cnt; i++) {
      Html.link({href: coll.get(i).href()}, "#" + (coll.count()-i) + " ");
   }
   return;
};

User.getByName = function(name) {
   return root.users.get(name);
};

User.getSalt = function() {
   var salt = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 8);;
   var random = java.security.SecureRandom.getInstance("SHA1PRNG");
   random.nextBytes(salt);
   return Packages.sun.misc.BASE64Encoder().encode(salt);
};

User.register = function(data) {
   // check if username is existing and is clean
   // can't use isClean() here because we accept
   // special characters like umlauts and spaces
   var invalidChar = new RegExp("[^a-zA-Z0-9äöüß\\.\\-_ ]");
   if (!data.name) {
      throw Error(gettext("Please enter a username."));
   } else if (data.name.length > 30) {
      throw Error(gettext("Sorry, the username you entered is too long. Please choose a shorter one."));
   } else if (invalidChar.exec(data.name)) {
      throw Error(gettext("Please enter alphanumeric characters only in the username field."));
   } else if (this[data.name] || this[data.name + "_action"]) {
      throw Error(gettext("Sorry, the user name you entered already exists. Please enter a different one."));
   }

   // check if email-address is valid
   if (!data.email) {
      throw new Error(gettext("Please enter your e-mail address."));
   }
   evalEmail(data.email);

   // Create hash from password for JavaScript-disabled browsers
   if (!data.hash) {
      // Check if passwords match
      if (!data.password || !data.passwordConfirm) {
         throw new Error(gettext("Could not verify your password. Please repeat your input."))
      } else if (data.password !== data.passwordConfirm) {
         throw new Error(gettext("Unfortunately, your passwords didn't match. Please repeat your input."));
      }
      data.hash = (data.password + session.data.token).md5();
   }

   if (User.getByName(data.name)) {
      throw new Error(gettext("Sorry, the user name you entered already exists. Please enter a different one."));
   }
   var user = new User(data);
   // grant trust and sysadmin-rights if there's no sysadmin 'til now
   if (root.manage.sysadmins.size() < 1) {
      user.value("status", User.PRIVILEGED);
   }
   root.users.add(user);
   session.login(user);
   return user;
};

User.login = function(data) {
   var user = User.getByName(data.name);
   if (!user) {
      throw Error(gettext("Unfortunately, your login failed. Maybe a typo?"));
   }
   var digest = data.digest;
   // Calculate digest for JavaScript-disabled browsers
   if (!digest) {
      digest = ((data.password + user.value("salt")).md5() + 
            session.data.token).md5();
   }
   // Check if login is correct
   if (digest !== user.getDigest(session.data.token)) {
      throw Error("Unfortunately, your login failed. Maybe a typo?");
   }
   if (data.remember) {
      // Set long running cookies for automatic login
      res.setCookie("avUsr", user.value("name"), 365);
      var ip = req.data.http_remotehost.clip(getProperty("cookieLevel", "4"), 
            "", "\\.");
      res.setCookie("avPw", (user.value("hash") + ip).md5(), 365);   
   }
   user.touch();
   session.login(user);
   return user;
};

User.status = ["default", "blocked", "trusted", "privileged"];

for each (status in User.status) {
   User[status.toUpperCase()] = status;
}
