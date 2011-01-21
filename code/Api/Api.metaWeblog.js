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
 * @fileOverview Methods that implement the MetaWeblog XML-RPC API.
 * See http://www.xmlrpc.com/metaWeblogApi for further details.
 */

/** @namespace */
Api.metaWeblog = {}

/**
 * @param {Story} story
 * @returns {Object}
 */
Api.metaWeblog._getStruct = function(story) {
   return {
      userid: story.creator.name,
      postid: story._id,
      dateCreated: story.created,
      title: story.getTitle(),
      description: story.text,
      categories: story.getTags(),
      flNotOnHomePage: story.mode === Story.HIDDEN ? true : false,
      link: story.href(),
      permaLink: story.href(),
      mt_excerpt: null, // FIXME: What are these "mt_" prefixed properties?
      mt_text_more: null,
      mt_allow_comments: story.commentMode === Story.OPEN ? 1 : 0,
      mt_allow_pings: 0,
      mt_convert_breaks: null,
      mt_keywords: null
   }
}

/**
 * 
 * @param {Number} id
 * @param {String} name
 * @param {String} password
 * @param {Number} limit
 * @throws {Error}
 * @returns {Object[]}
 */
Api.metaWeblog.getRecentPosts = function(id, name, password, limit) {
   var site = Api.getSite(id);
   var user = Api.getUser(name, password);

   Api.constrain(site, user);
   if (!site.stories.getPermission("main")) {
      throw Error("Permission denied for user " + user.name + 
            " to get recent posts from site " + site.name);
   }

   var result = [];
   var stories = res.handlers.membership.stories;
   var max = Math.min(stories.size(), Number(limit) || Infinity, 20);
   for each (var story in stories.list(0, max)) {
      result.push(Api.metaWeblog._getStruct(story));
   }
   return result;
}

/**
 * 
 * @param {Number} id
 * @param {String} name
 * @param {String} password
 * @throws {Error}
 * @returns {Object}
 */
Api.metaWeblog.getPost = function(id, name, password) {
   var story = Api.getStory(id);
   var user = Api.getUser(name, password);
   Api.constrain(story.site, user);
   if (!story.getPermission("main")) { 
      throw Error("Permission denied for user " + name + 
            " to get post #" + id);
   }
   return Api.metaWeblog._getStruct(story);
}

/**
 * 
 * @param {Number} id
 * @param {String} name
 * @param {String} password
 * @param {String} content
 * @param {Boolean} publish
 * @throws {Error}
 * @returns {Number}
 */
Api.metaWeblog.newPost = function(id, name, password, content, publish) {
   var site = Api.getSite(id);
   var user = Api.getUser(name, password);
   
   Api.constrain(site, user);
   if (!site.stories.getPermission("create")) {
      throw Error("Permission denied for user " + user.name + 
            " to add a post to site " + site.name);
   }
   
   var story = new Story;
   story.site = site;
   story.creator = user;
   story.update({
      title: content.title,
      text: content.description,
      status: publish ? Story.PUBLIC : Story.CLOSED,
      mode: content.flNotOnHomePage ? Story.HIDDEN : Story.FEATURED,
      commentMode: content.discussions === 0 ? Story.CLOSED : Story.OPEN,
      tags: content.categories
   });
   site.stories.add(story);
   return story._id;
}

/**
 * 
 * @param {Number} id
 * @param {String} name
 * @param {String} password
 * @param {String} content
 * @param {Boolean} publish
 * @throws {Error}
 * @returns {Boolean}
 */
Api.metaWeblog.editPost = function(id, name, password, content, publish) {
   var story = Api.getStory(id);
   var user = Api.getUser(name, password);

   Api.constrain(story.site, user);
   if (!story.getPermission("edit")) {
      throw Error("Permission denied for user " + name + 
            " to edit post #" + id);         
   }

   story.update({
      title: content.title,
      text: content.description,
      status: publish ? Story.PUBLIC : Story.CLOSED,
      mode: content.flNotOnHomePage ? Story.HIDDEN : Story.FEATURED,
      commentMode: content.discussions || content.mt_allow_comments ? 
            Story.OPEN : Story.CLOSED,
      tags: content.categories
   });
   return true;
}

/**
 * 
 * @param {Number} id
 * @param {String} name
 * @param {String} password
 * @throws {Error}
 * @returns {Object[]}
 */
Api.metaWeblog.getCategories = function(id, name, password) {
   var site = Api.getSite(id);
   var user = Api.getUser(name, password);

   Api.constrain(site, user);
   if (!site.stories.getPermission("main")) {
      throw Error("Permission denied for user " + user.name + 
            " to get categories from site " + site.name);
   }

   var result = [];
   var tags = site.getTags("tags", Tags.ALL).list();
   for each (var tag in tags) {
     result.push({
        description: tag.name,
        htmlUrl: tag.href(),
        rssUrl: tag.href("rss")
     });
   }
   return result;
}

/**
 * 
 * @param {Number} id
 * @param {String} name
 * @param {String} password
 * @param {String} media
 * @throws {Error}
 * @returns {Object}
 */
Api.metaWeblog.newMediaObject = function(id, name, password, media) {
   var site = Api.getSite(id);
   var user = Api.getUser(name, password);

   Api.constrain(site, user);

   var result = {};
   var data = {};
   if (media.type && media.type.toLowerCase().startsWith("image/")) {
      if (!site.images.getPermission("create")) {
         throw Error("Permission denied for user " + user.name + 
               " to add a media object to site " + site.name);
      }
      data.file = new Packages.helma.util.MimePart(media.name, 
            media.bits, media.type);
      data.file_origin = media.name;
      data.description = media.description;   
      var image = new Image;
      image.site = site;
      image.creator = user;
      image.update(data);
      site.images.add(image);
      result.url = image.getUrl();
   } else {
      if (!site.files.getPermission("create")) {
         throw Error("Permission denied for user " + user.name + 
               " to add a media object to site " + site.name);
      }
      data.file = new Packages.helma.util.MimePart(media.name, 
            media.bits, media.type);
      data.file_origin = media.name;
      data.description = media.description;
      var file = new File;
      file.site = site;
      file.creator = file.modifier = user;
      file.update(data);
      site.files.add(file);
      result.url = file.getUrl();
   }
   
   return result;
}
