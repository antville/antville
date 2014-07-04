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
 * @fileOverview Defines the Api prototype.
 */

/**
 *
 * @param {Site} site
 * @param {User} user
 */
Api.constrain = function(site, user) {
   res.handlers.site = site;
   res.handlers.membership = Membership.getByName(user.name);
   return;
}

/** @ignore */
Api.dispatch = function() {
}

/**
 *
 * @param {String} name
 * @param {String} password
 * @throws {Error}
 * @returns {User}
 */
Api.getUser = function(name, password) {
   var user = User.getByName(name);
   if (!user) {
      throw Error("User " + name + " does not exist on this server");
   } else if (user.hash !== String(password + user.salt).md5()) {
      throw Error("Authentication failed for user " + name);
   } else if (user.status === User.BLOCKED) {
      throw Error("The user account " + name + " is currently blocked");
   }
   session.login(user);
   return user;
}

/**
 *
 * @param {String} name
 * @throws {Error}
 * @returns {Site}
 */
Api.getSite = function(name) {
   var site = Site.getByName(String(name));
   if (!site) {
      throw Error("Site " + name + " does not exist on this server");
   } else if (site.status === Site.BLOCKED) {
      throw Error("The site " + name + " is blocked");
   }
   return site;
}

/**
 *
 * @param {Number} id
 * @throws {Error}
 * @returns {Story}
 */
Api.getStory = function(id) {
   var story = Story.getById(id);
   if (!story) {
      throw Error("Story #" + id + " does not exist on this server");
   }
   return story;
}

/**
 * @name Api
 * @constructor
 * @extends HopObject
 */

/**
 * @returns {Boolean}
 */
Api.prototype.getPermission = function(){
   return true;
}

Api.prototype.main_action = function() {
   res.data.title = gettext("Application Programming Interfaces");
   res.data.body = this.renderSkinAsString("$Api#main");
   res.handlers.site.renderSkin("Site#page");
   return;
}

Api.prototype.callback_action = function() {
   var ping = function(data) {
      if (data.type !== "Story" && data.type !== "Comment") {
         return;
      }
      var remote = new Remote("http://rpc.weblogs.com/RPC2");
      var call = remote.weblogUpdates.ping(data.site, data.origin);
      if (call.error || call.result.flerror) {
         app.debug("Error invoking weblogs.com ping() method for " +
               data.site + ": " + call.error || call.result.message);
      } else {
         app.debug(call.result);
      }
      return;
   };

   if (req.isGet()) {
      res.data.title = gettext("Default Callback Url");
      res.data.body = this.renderSkinAsString("$Api#callback",
            {name: req.action, code: ping.toString()});
      res.handlers.site.renderSkin("Site#page");
   } else if (req.isPost()) {
      app.debug("Invoked default callback with POST params: " + req.postParams);
      app.invokeAsync(this, ping, [req.postParams], 1000);
   }
   return;
}

/**
 *
 * @param {String} methodName
 * @throws {Error}
 */
Api.prototype.main_action_xmlrpc = function(methodName) {
   if (!methodName) {
      return false;
   }
   var parts = methodName.split(".");
   var method = parts[1];
   if (method && !method.startsWith("_")) {
      var handler = Api[parts[0]];
      if (handler && handler[method]) {
         var args = Array.prototype.splice.call(arguments, 1);
         return handler[method].apply(null, args);
      }
   }
   throw Error("Method " + methodName + "() is not implemented");
   return;
}
