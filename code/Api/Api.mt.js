// The Antville Project
// http://code.google.com/p/antville
//
// Copyright 2007-2011 by Tobi Sch\u00e4fer.
//
// Copyright 2001\u20132007 Robert Gaggl, Hannes Walln\u00f6fer, Tobi Sch\u00e4fer,
// Matthias & Michael Platzer, Christoph Lincke.
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
// $Author$
// $Date$
// $URL$

/**
 * @fileOverview Methods that implement Movable Type's XML-RPC API.
 * See http://www.sixapart.com/pronet/breese/xmlrpc/movable_type_api/ for details.
 */

/** @namespace */
Api.mt = {};

/**
 * 
 * @param {Number} id
 * @param {String} name
 * @param {String} password
 * @param {Number} limit
 * @throws {Error}
 * @returns {Object[]}
 */
Api.mt.getRecentPostTitles = function(id, name, password, limit) {
   var site = Api.getSite(id);
   var user = Api.getUser(name, password);

   Api.constrain(site, user);
   if (!site.stories.getPermission("main")) {
      throw Error("Permission denied for user " + user.name + 
            " to get recent post titles from site " + site.name);
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

/**
 * 
 * @param {Number} id
 * @param {String} name
 * @param {String} password
 * @throws {Error}
 * @returns {Object[]}
 */
Api.mt.getCategoryList = function(id, name, password) {
   var site = Api.getSite(id);
   var user = Api.getUser(name, password);

   Api.constrain(site, user);
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

/**
 * 
 * @param {Number} id
 * @param {String} name
 * @param {String} password
 * @throws {Error}
 * @returns {Object[]}
 */
Api.mt.getPostCategories = function(id, name, password) {
   var story = Api.getStory(id);
   var user = Api.getUser(name, password);

   Api.constrain(story.site, user);
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

// FIXME: How do I post a new story?
/**
 * 
 * @param {Number} id
 * @param {String} name
 * @param {String} password
 * @throws {Error}
 * @returns {Boolean}
 */
Api.mt.publishPost = function(id, name, password) {
   var story = Api.getStory(id);
   var user = Api.getUser(name, password);

   Api.constrain(story.site, user);
   if (!story.getPermission("edit")) {
      throw Error("Permission denied for user " + name + 
            " to edit story #" + id);
   }

   story.mode = Story.FEATURED;
   return true;   
}

/**
 * 
 * @param {Number} id
 * @param {String} name
 * @param {String} password
 * @param {String[]} categories
 * @throws {Error}
 * @returns {Boolean}
 */
Api.mt.setPostCategories = function(id, name, password, categories) {
   if (!categories || !categories.length) {
      return;
   }

   var story = Api.getStory(id);
   var user = Api.getUser(name, password);

   Api.constrain(story.site, user);
   if (!story.getPermission("edit")) {
      throw Error("Permission denied for user " + name + 
            " to edit story #" + id);
   }

   story.setTags(categories);
   return true;
}

/**
 * 
 * @returns {Array}
 */
Api.mt.supportedTextFilters = function() {
   return [];
}

/**
 * 
 * @returns {Array}
 */
Api.mt.getTrackbackPings = function() {
   return [];
}

/**
 * 
 * @returns {String[]}
 */
Api.mt.supportedMethods = function() {
   var result = [];
   for (var method in Api.mt) {
      result.push(method);
   }
   return result.sort();
}
