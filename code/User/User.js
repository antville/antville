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
 * @fileOverview Defines the User prototype.
 */

/** @constant */
User.COOKIE = getProperty("userCookie", "antvilleUser");
/** @constant */
User.HASHCOOKIE = getProperty("hashCookie", "antvilleHash");

/**
 * @function
 * @returns {String[]}
 * @see defineConstants
 */
User.getStatus = defineConstants(User, "blocked", 
      "regular", "trusted", "privileged");

this.handleMetadata("hash");
this.handleMetadata("salt");
this.handleMetadata("url");

disableMacro(User, "password");
disableMacro(User, "hash");
disableMacro(User, "email");

/**
 * A User object represents a login to Antville.
 * @name User
 * @constructor
 * @param {Object} data
 * @extends HopObject
 * @property {Membership[]} _children
 * @property {Date} created
 * @property {Comment[]} comments
 * @property {String} email
 * @property {File[]} files
 * @property {String} hash
 * @property {Image[]} images
 * @property {Membership[]} memberships
 * @property {Metadata} metadata
 * @property {Date} modified
 * @property {String} name 
 * @property {String} salt
 * @property {Site[]} sites
 * @property {Membership[]} subscriptions
 * @property {String} status
 * @property {Story[]} stories
 * @extends HopObject
 */
User.prototype.constructor = function(data) {
   var now = new Date;
   this.map({
      name: data.name,
      hash: data.hash,
      salt: session.data.token,
      email: data.email,
      status: User.REGULAR,
      created: now,
      modified: now
   });
   return this;
}

/**
 * 
 */
User.prototype.onLogout = function() { /* ... */ }

/**
 * 
 * @param {String} action
 * @returns {Boolean}
 */
User.prototype.getPermission = function(action) {
   return User.require(User.PRIVILEGED);
}

/**
 * 
 * @param {Object} data
 */
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
            throw Error(gettext("Unfortunately, your passwords did not match. Please repeat your input."));
         }
         data.hash = (data.newPassword + session.data.token).md5();
      }
      this.map({
         hash: data.hash,
         salt: session.data.token         
      });
   }
   if (!(this.email = validateEmail(data.email))) {
      throw Error(gettext("Please enter a valid e-mail address"));
   }
   
	if(data.url != "") {
      if (!(this.url = validateUrl(data.url))) {
        throw Error(gettext("Please enter a valid URL"));
      }
   }
   return this;
}

/**
 * 
 */
User.prototype.touch = function() {
   this.modified = new Date;
   return;
}

/**
 * 
 * @param {String} token
 * @returns {String}
 */
User.prototype.getDigest = function(token) {
   token || (token = String.EMPTY);
   return (this.hash + token).md5();
}

/**
 * 
 * @param {String} name
 * @returns {Object}
 */
User.prototype.getFormOptions = function(name) {
   switch (name) {
      case "status":
      return User.getStatus();
   }
}

/**
 * 
 * @param {Object} param
 * @param {String} type
 */
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
            site.renderSkin("$Site#listItem");
         }
         return;
      });
   }
   return;
}

/**
 * 
 * @param {String} name
 * @returns {User}
 */
User.getByName = function(name) {
   return root.users.get(name);
}

/**
 * @returns {String}
 */
User.getSalt = function() {
   var salt = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 8);;
   var random = java.security.SecureRandom.getInstance("SHA1PRNG");
   random.nextBytes(salt);
   return Packages.sun.misc.BASE64Encoder().encode(salt);
}

/**
 * 
 * @param {Object} data
 * @throws {Error}
 * @returns {User}
 */
User.register = function(data) {
   // check if username is existing and is clean
   // can't use isClean() here because we accept
   // special characters like . - and space
   var invalidChar = new RegExp("[^a-zA-Z0-9\\.\\-_ ]");
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
      throw Error(gettext("Please enter your e-mail address."));
   }
   validateEmail(data.email);

   // Create hash from password for JavaScript-disabled browsers
   if (!data.hash) {
      // Check if passwords match
      if (!data.password || !data.passwordConfirm) {
         throw Error(gettext("Could not verify your password. Please repeat your input."))
      } else if (data.password !== data.passwordConfirm) {
         throw Error(gettext("Unfortunately, your passwords did not match. Please repeat your input."));
      }
      data.hash = (data.password + session.data.token).md5();
   }

   if (User.getByName(data.name)) {
      throw Error(gettext("Sorry, the user name you entered already exists. Please enter a different one."));
   }
   var user = new User(data);
   // grant trust and sysadmin-rights if there's no sysadmin 'til now
   if (root.admins.size() < 1) {
      user.status = User.PRIVILEGED;
   }
   root.users.add(user);
   session.login(user);
   return user;
}

/**
 * 
 */
User.autoLogin = function() {
   if (session.user) {
      return;
   }
   var name = req.cookies[User.COOKIE];
   var hash = req.cookies[User.HASHCOOKIE];
   if (!name || !hash) {
      return;
   }
   var user = User.getByName(name);
   if (!user) {
      return;
   }
   var ip = req.data.http_remotehost.clip(getProperty("cookieLevel", "4"),
         "", "\\.");
   if ((user.hash + ip).md5() !== hash) {
      return;
   }
   session.login(user);
   user.touch();
   res.message = gettext('Welcome to {0}, {1}. Have fun!',
         res.handlers.site.title, user.name);
   return;
}

/**
 * 
 * @param {Object} data
 * @returns {User}
 */
User.login = function(data) {
   var user = User.getByName(data.name);
   if (!user) {
      throw Error(gettext("Unfortunately, your login failed. Maybe a typo?"));
   }
   var digest = data.digest;
   // Calculate digest for JavaScript-disabled browsers
   if (!digest) {
      app.logger.warn("Received clear text password from " + req.data.http_referer);
      digest = ((data.password + user.salt).md5() + session.data.token).md5();
   }
   // Check if login is correct
   if (digest !== user.getDigest(session.data.token)) {
      throw Error(gettext("Unfortunately, your login failed. Maybe a typo?"))
   }
   if (data.remember) {
      // Set long running cookies for automatic login
      res.setCookie(User.COOKIE, user.name, 365);
      var ip = req.data.http_remotehost.clip(getProperty("cookieLevel", "4"), 
            "", "\\.");
      res.setCookie(User.HASHCOOKIE, (user.hash + ip).md5(), 365);   
   }
   user.touch();
   session.login(user);
   return user;
}

/**
 * 
 */
User.logout = function() {
  session.logout();
  res.setCookie(User.COOKIE, String.EMPTY);
  res.setCookie(User.HASHCOOKIE, String.EMPTY);
  User.getLocation();
  return;
}

/**
 * 
 * @param {String} requiredStatus
 * @returns {Boolean}
 */
User.require = function(requiredStatus) {
   var status = [User.BLOCKED, User.REGULAR, User.TRUSTED, User.PRIVILEGED];
   if (requiredStatus && session.user) {
      return status.indexOf(session.user.status) >= status.indexOf(requiredStatus);
   }
   return false;
}

/**
 * @returns {String}
 */
User.getCurrentStatus = function() {
   if (session.user) {
      return session.user.status;
   }
   return null;
}

/**
 * @returns {Membership}
 */
User.getMembership = function() {
   var membership;
   if (session.user) {
      membership = Membership.getByName(session.user.name);
   }
   return membership || new Membership;
}

/**
 * 
 * @param {String} url
 */
User.setLocation = function(url) {
   session.data.location = url || req.data.http_referer;
   //app.debug("Pushed location " + session.data.location);
   return;
}

/**
 * @returns {String}
 */
User.getLocation = function() {
   var url = session.data.location;
   delete session.data.location;
   //app.debug("Popped location " + url);
   return url;
}
