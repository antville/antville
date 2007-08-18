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
   if (!data.name)
      throw new Exception("usernameMissing");
   else if (data.name.length > 30)
      throw new Exception("usernameTooLong");
   else if (invalidChar.exec(data.name))
      throw new Exception("usernameNoSpecialChars");
   else if (this[data.name] || this[data.name + "_action"])
      throw new Exception("usernameExisting");

   // check if email-address is valid
   if (!data.email) {
      throw new Exception("emailMissing");
   }
   evalEmail(data.email);

   // Create hash from password for JavaScript-disabled browsers
   if (!data.hash) {
      // Check if passwords match
      if (!data.password1 || !data.password2) {
         throw new Exception("passwordTwice");
      } else if (data.password1 !== data.password2) {
         throw new Exception("passwordNoMatch");
      }
      data.hash = (data.password1 + session.data.token).md5();
   }

   if (User.getByName(data.name)) {
      throw new Exception("memberExisting");
   }
   var user = new User();
   user.name = data.name;
   user.hash = data.hash;
   user.salt = session.data.token;
   user.email = data.email;
   user.registered = new Date();
   user.blocked = 0;
   // grant trust and sysadmin-rights if there's no sysadmin 'til now
   if (root.manage.sysadmins.size() == 0) {
      user.sysadmin = user.trusted = 1;
   } else {
      user.sysadmin = user.trusted = 0;
   }
   root.users.add(user);
   var welcomeWhere = path.site ? path.site.title : root.getTitle();
   return new Message("welcome", [welcomeWhere, user.name], user);
};

User.prototype.getHash = function(token) {
   token || (token = String.EMPTY);
   return (this.hash + token).md5();
};

User.prototype.login = function(data) {
   var user = this;
   var password = data.hash;
   if (!password) {
      password = ((data.password + this.salt).md5() + 
            session.data.token).md5();
   }
   // check if login is successful
   if (password !== this.getHash(session.data.token)) {
      throw new Exception("loginTypo");
   }
   // login was successful
   session.login(user);
   user.lastVisit = new Date();
   if (data.remember) {
      // user allowed us to set permanent cookies for auto-login
      res.setCookie("avUsr", user.name, 365);
      var ip = req.data.http_remotehost.clip(getProperty("cookieLevel","4"), 
            "", "\\.");
      res.setCookie("avPw", (user.hash + ip).md5(), 365);   
   }
   return new Message("welcome", [res.handlers.context.getTitle(), user.name]);
};

/**
 * macro rendering username
 */
User.prototype.name_macro = function(param) {
   if (param.as == "link" && this.url)
      Html.link({href: this.url}, this.name);
   else
      res.write(this.name);
   return;
};

/**
 * macro rendering password
 */
User.prototype.password_macro = function(param) {
   if (param.as == "editor")
      Html.password(this.createInputParam("password", param));
   return;
};

/**
 * macro rendering URL
 */
User.prototype.url_macro = function(param) {
   if (param.as == "editor")
      Html.input(this.createInputParam("url", param));
   else
      res.write(this.url);
   return;
};

/**
 * macro rendering email
 */
User.prototype.email_macro = function(param) {
   if (param.as == "editor")
      Html.input(this.createInputParam("email", param));
   else
      res.write(this.email);
   return;
};

/**
 * macro rendering checkbox for publishemail
 */
User.prototype.publishemail_macro = function(param) {
   if (param.as == "editor") {
      var inputParam = this.createCheckBoxParam("publishemail", param);
      if (req.data.save && !req.data.publishemail)
         delete inputParam.checked;
      Html.checkBox(inputParam);
   } else
      res.write(this.publishemail ? getMessage("generic.yes") : getMessage("generic.no"));
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
 * macro renders the trust-state of this user
 */
User.prototype.sysmgr_trusted_macro = function(param) {
   // this macro is allowed just for sysadmins
   if (!session.user.sysadmin)
      return;
   if (param.as == "editor") {
      var options = [getMessage("generic.no"), getMessage("generic.yes")];
      Html.dropDown({name: "trusted"}, options, this.trusted);
   } else
      res.write(this.trusted ? getMessage("generic.yes") : getMessage("generic.no"));
   return;
};

/**
 * macro renders the block-state of this user
 */
User.prototype.sysmgr_blocked_macro = function(param) {
   // this macro is allowed just for sysadmins
   if (!session.user.sysadmin)
      return;
   if (param.as == "editor") {
      var options = [getMessage("generic.no"), getMessage("generic.yes")];
      Html.dropDown({name: "blocked"}, options, this.blocked);
   } else
      res.write(this.blocked ? getMessage("generic.yes") : getMessage("generic.no"));
   return;
};

/**
 * macro renders the sysadmin-state of this user
 */
User.prototype.sysmgr_sysadmin_macro = function(param) {
   // this macro is allowed just for sysadmins
   if (!session.user.sysadmin)
      return;
   if (param.as == "editor") {
      var options = [getMessage("generic.no"), getMessage("generic.yes")];
      Html.dropDown({name: "sysadmin"}, options, this.sysadmin);
   } else
      res.write(this.sysadmin ? getMessage("generic.yes") : getMessage("generic.no"));
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
