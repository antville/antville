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

defineConstants(User, "getStatus", "default", "blocked", "trusted", 
      "privileged");
defineConstants(User, "getScopes", "all users", "trusted users", 
      "privileged users");

this.handleMetadata("hash");
this.handleMetadata("salt");
this.handleMetadata("url");

disableMacro(User, "password");
disableMacro(User, "hash");
disableMacro(User, "email");

User.prototype.constructor = function(data) {
   var now = new Date;
   this.map({
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

User.prototype.update = function(data) {
   if (!data.digest && data.password) {
      data.digest = ((data.password + this.salt).md5() + 
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
      this.map({
         hash: data.hash,
         salt: session.data.token         
      });
   }
   this.map({
      url: evalURL(data.url),
      email: evalEmail(data.email),
   });
   return this;
};

User.prototype.touch = function() {
   this.lastVisit = new Date;
   return;
};

User.prototype.getDigest = function(token) {
   token || (token = String.EMPTY);
   return (this.hash + token).md5();
};

User.prototype.getFormOptions = function(name) {
   switch (name) {
      case "status":
      return User.getStatus();
   }
}

User.prototype.list_macro = function(param, type) {
   switch (type) {
      case "sites":
      var memberships = session.user.list();
      memberships.sort(function(a, b) {
         return b.site.modified - a.site.modified;
      });
      memberships.forEach(function(membership) {
         var site;
         if (site = membership.get("site")) {
            site.renderSkin("preview");
         }
         return;
      });
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
      user.status = User.PRIVILEGED;
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
      digest = ((data.password + user.salt).md5() + session.data.token).md5();
   }
   // Check if login is correct
   if (digest !== user.getDigest(session.data.token)) {
      throw Error("Unfortunately, your login failed. Maybe a typo?");
   }
   if (data.remember) {
      // Set long running cookies for automatic login
      res.setCookie("avUsr", user.name, 365);
      var ip = req.data.http_remotehost.clip(getProperty("cookieLevel", "4"), 
            "", "\\.");
      res.setCookie("avPw", (user.hash + ip).md5(), 365);   
   }
   user.touch();
   session.login(user);
   return user;
};

User.getPermission = function(status) {
   return session.user && session.user.status === status;
};

User.getMembership = function() {
   var membership;
   if (session.user) {
      membership = Members.getByName(session.user.name);
   }
   return membership || new HopObject;
};
