// The Antville Project
// http://code.google.com/p/antville
//
// Copyright 2007-2011 by Tobi Schäfer.
//
// Copyright 2001–2007 Robert Gaggl, Hannes Wallnöfer, Tobi Schäfer,
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
 * @fileOverview Methods that implement Blogger's XML-RPC API.
 * See http://goo.gl/u8lZZ for further details.
 * The blogger.getTemplate and blogger.setTemplate methods are not supported
 */

/** @namespace */
Api.blogger = {};

/**
 * 
 * @param {String} content
 */
Api.blogger._getContentParts = function(content) {
   content && (content = content.trim());
   content || (content = String.EMPTY);
   var result = {};
   if (!content.startsWith("<title>")) {
      result.text = content;
   } else {
      var pos = content.lastIndexOf("</title>");
      if (pos > 0) {
         result.title = content.substring(7, pos);
         result.text = content.substring (pos + 8); 
      } else {
         result.text = content;
      }
   }
   return result;
}

/**
 * 
 * @param {String} appKey
 * @param {String} name
 * @param {String} password
 * @throws {Error}
 * @returns {Object} Properties: userid, nickname and url
 */
Api.blogger.getUserInfo = function(appKey, name, password) {
   var user = User.getByName(name);
   if (!user) {
      throw Error("User " + name + " does not exist on this server");
   }
   return {
      userid: name,
      nickname: name,
      url: user.url
   }
}

/**
 * 
 * @param {String} appKey
 * @param {String} name
 * @param {String} password
 * @returns {Object[]} A list of objects with the properties blogid, blogName and 
 * url
 */
Api.blogger.getUsersBlogs = function(appKey, name, password) {
   var user = Api.getUser(name, password);
   var result = [];
   user.forEach(function() {
      Api.constrain(this.site, user);
      if (this.site.stories.getPermission("create")) {
         result.push({
            blogid: this.site.name,
            blogName: this.site.title,
            url: this.site.href()
         });
      }
      return;
   });
   return result;
}

/**
 * 
 * @param {String} appKey
 * @param {Number} id
 * @param {String} name
 * @param {String} password
 * @param {Number} limit
 * @throws {Error}
 * @returns {Object[]} A list of objects with the properties postid, userid,
 * dateCreated and content
 */
Api.blogger.getRecentPosts = function(appKey, id, name, password, limit) {
   var site = Api.getSite(id);
   var user = Api.getUser(name, password);

   Api.constrain(site, user);
   if (!site.stories.getPermission("main")) {
      throw Error("Permission denied for user " + user.name + 
            " to get recent posts of site " + site.name);
   }

   var result = [];
   var stories = res.handlers.membership.stories;
   var max = Math.min(stories.size(), Number(limit) || Infinity, 20);
   for each (var story in stories.list(0, max)) {
      result.push({
         postid: story._id,
         userid: story.creator.name,
         dateCreated: story.created,
         content: story.title ? "<title>" + story.title + 
               "</title>" + story.text : story.text
      });
   }
   return result;
}

/**
 * 
 * @param {String} appKey
 * @param {Number} id
 * @param {String} name
 * @param {String} password
 * @throws {Error}
 * @returns {Object} Properties: content, userid, postid, dateCreated
 */
Api.blogger.getPost = function(appKey, id, name, password) {
   var story = Api.getStory(id);
   var user = Api.getUser(name, password);
   
   Api.constrain(story.site, user);
   if (!story.getPermission("main")) {
      throw Error("Permission denied for user " + name + 
            " to get post #" + id);
   }

   return {
      content: story.title ? html.elementAsString("title", story.title) + 
            story.text : story.text,
      userid: story.creator.name,
      postid: story._id,
      dateCreated: story.created
   }
}

/**
 * 
 * @param {String} appKey
 * @param {Number} id
 * @param {String} name
 * @param {String} password
 * @param {String} content
 * @param {Boolean} publish
 * @throws {Error}
 * @returns {Number} The ID of the new story
 */
Api.blogger.newPost = function(appKey, id, name, password, content, publish) {
   var site = Api.getSite(id);
   var user = Api.getUser(name, password);
   
   Api.constrain(site, user);
   if (!site.stories.getPermission("create")) {
      throw Error("Permission denied for user " + user.name + 
            " to add a post to site " + site.name);
   }

   var parts = Api.blogger._getContentParts(content);

   var story = Story.add(site, {
      title: parts.title,
      text: parts.text,
      status: publish ? Story.PUBLIC : Story.CLOSED,
      mode: Story.FEATURED
   });

   story.site = site;
   story.creator = user;
   return story._id;
}

/**
 * 
 * @param {String} appKey
 * @param {Number} id
 * @param {String} name
 * @param {String} password
 * @param {String} content
 * @param {Boolean} publish
 * @throws {Error}
 * @returns {Boolean} Always true
 */
Api.blogger.editPost = function(appkey, id, name, password, content, publish) {
   var story = Api.getStory(id);
   var user = Api.getUser(name, password);

   Api.constrain(story.site, user);
   if (!story.getPermission("edit")) {
      throw Error("Permission denied for user " + name + 
            " to edit post #" + id);
   }

   var parts = Api.blogger._getContentParts(content);
   story.update({
      title: parts.title,
      text: parts.text,
      status: publish ? Story.PUBLIC : Story.CLOSED,
      modifier: user,
      modified: new Date
   });
   return true;
}

/**
 * 
 * @param {String} appKey
 * @param {Number} id
 * @param {String} name
 * @param {String} password
 * @throws {Error}
 * @returns {Boolean} Always true
 */
Api.blogger.deletePost = function(appKey, id, name, password) {
   var story = Api.getStory(id);
   var user = Api.getUser(name, password);

   Api.constrain(story.site, user);
   if (!story.getPermission("delete")) {
      throw Error("Permission denied for user " + name + 
            " to delete story #" + id);
   }

   Story.remove.call(story);
   return true;
}
