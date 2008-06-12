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

Api.constrain = function(site, user) {
   res.handlers.site = site;
   res.handlers.membership = Membership.getByName(user.name);
   return;
}

Api.dispatch = function() {
   var handler = Api[this];
   var method = arguments[0];
   if (!method.startsWith("_")) {
      if (handler && method && handler[method]) {
         var args = Array.prototype.splice.call(arguments, 1);
         return handler[method].apply(null, args);
      }
   }
   throw Error("Method " + this + "." + method + "() is not implemented");
   return;
}

Api.getUser = function(name, password) {
   var user = User.getByName(name);
   if (!user) {
      throw Error("User " + name + " does not exist on this server");
   } else if (user.hash !== String(password + user.salt).md5()) {
      throw Error("Authentication failed for user " + name);
   } else if (user.status === User.BLOCKED) {
      throw Error("The user account " + name + " is currently blocked");
   }
   return user;
}

Api.getSite = function(name) {
   var site = Site.getByName(String(name));
   if (!site) {
      throw Error("Site " + name + " does not exist on this server");
   } else if (site.status === Site.BLOCKED) {
      throw Error("The site " + name + " is blocked");
   }
   return site;
}

Api.getStory = function(id) {
   var story = Story.getById(id);
   if (!story) {
      throw Error("Story #" + id + " does not exist on this server");
   }
   return story;
}

Api.prototype.main_action = function() {
   res.data.title = "Supported Application Programming Interfaces";
   res.data.body = this.renderSkinAsString("Api#main");
   res.handlers.site.renderSkin("Site#page");
}

Api.prototype.blogger_action_xmlrpc = function(method) {
   return Api.dispatch.apply("blogger", arguments);
}

Api.prototype.movableType_action_xmlrpc = function(method) {
   return Api.dispatch.apply("movableType", arguments);
}

Api.prototype.metaWeblog_action_xmlrpc = function() {
   return Api.dispatch.apply("metaWeblog", arguments);
}
