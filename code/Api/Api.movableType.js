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

// Functions that implement Movable Type's XML-RPC API
// see http://www.sixapart.com/developers/xmlrpc/movable_type_api/

Api.movableType = {};

Api.movableType.getRecentPostTitles = function(id, name, password, limit) {
   var user = Api.getUser(name, password);
   var site = Api.getSite(id);

   // FIXME: This should become obsolete (needs refactoring of 
   // permission model or modification of URL entrypoint)
   res.handlers.site = site;
   res.handlers.membership = Membership.getByName(user.name);

   if (!site.stories.getPermission("main")) {
      throw Error("Permission denied for user " + user.name + 
            " to access site " + site.name);
   }

   var result = [];
   var stories = res.handlers.membership.stories;
   var max = Math.min(stories.size(), Number(limit) || Infinity, 20);
   for each (var story in stories.list(0, max)) {
      result.push({
         postid: story._id,
         username: story.creator.name,
         dateCreated: story.created,
         title: story.getTitle()	
      });
   }
   return result;
}

Api.movableType.getCategoryList = function(id, name, password) {
   var user = Api.getUser(name, password);
   var site = Api.getSite(id);

   // FIXME: This should become obsolete (needs refactoring of 
   // permission model or modification of URL entrypoint)
   res.handlers.site = site;
   res.handlers.membership = Membership.getByName(user.name);

   if (!site.stories.getPermission("main")) {
      throw Error("Permission denied for user " + user.name + 
            " to access site " + site.name);
   }
   
   var result = [];
   var tags = site.getTags("tags", Tags.ALL).list();
   for each (var tag in tags) {
     result.push({
        categoryId: tag.name, // FIXME: tag._id,
        categoryName: tag.name
     });
   }
   return result;
}

Api.movableType.getPostCategories = function(id, name, password) {
   var user = Api.getUser(name, password);
   var story = Story.getById(id);
   if (!story) {
      throw Error("Story #" + id + " does not exist on this server");
   }

   // FIXME: This should become obsolete (needs refactoring of 
   // permission model or modification of URL entrypoint)
   res.handlers.site = story.site;
   res.handlers.membership = Membership.getByName(user.name);
   if (!story.getPermission("main")) {
      throw Error("Permission denied for user " + name + 
            " to access story #" + id);
   }
   
   var result = [];
   for each (var tag in story.getTags()) {
      result.push({
         categoryId: tag,
         categoryName: tag,
         isPrimary: true
      });
   }
   return result;
}

// FIXME: What kind of stupid API is this?
Api.movableType.publishPost = function(id, name, password) {
   var user = Api.getUser(name, password);
   var story = Story.getById(id);
   if (!story) {
      throw Error("Story #" + id + " does not exist on this server");
   }

   // FIXME: This should become obsolete (needs refactoring of 
   // permission model or modification of URL entrypoint)
   res.handlers.site = story.site;
   res.handlers.membership = Membership.getByName(user.name);
   if (!story.getPermission("edit")) {
      throw Error("Permission denied for user " + name + 
            " to edit story #" + id);
   }

   story.mode = Story.FEATURED;
   return true;   
}

Api.movableType.setPostCategories = function(id, name, password, categories) {
   if (!categories || !categories.length) {
      return;
   }

   var user = Api.getUser(name, password);
   var story = Story.getById(id);
   if (!story) {
      throw Error("Story #" + id + " does not exist on this server");
   }

   // FIXME: This should become obsolete (needs refactoring of 
   // permission model or modification of URL entrypoint)
   res.handlers.site = story.site;
   res.handlers.membership = Membership.getByName(user.name);
   if (!story.getPermission("edit")) {
      throw Error("Permission denied for user " + name + 
            " to edit story #" + id);
   }

   story.setTags(categories);
   return true;
}

Api.movableType.supportedTextFilters = function() {
   return [];
}

Api.movableType.getTrackbackPings = function() {
   return [];
}

Api.movableType.supportedMethods = function() {
   var result = [];
   for (var method in Api.movableType) {
      result.push(method);
   }
   return result.sort();
}
