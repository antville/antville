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

// Functions that implement Blogger's XML-RPC API
// see http://www.blogger.com/developers/api/1_docs/ for further details
// blogger.getTemplate and blogger.setTemplate are not supported

Api.Blogger = {};

Api.Blogger.util = {
   getContentParts: function(content) {
      content && (content = content.trim());
      content || (content = "");
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
}

Api.Blogger.getUserInfo = function(appKey, name, password) {
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

Api.Blogger.getUsersBlogs = function(appKey, name, password) {
   var user = Api.getUser(name, password);
   var result = [];
   user.forEach(function() {
      // FIXME: This should become obsolete (needs refactoring of 
      // permission model or modification of URL entrypoint)
      res.handlers.membership = this;
      res.handlers.site = this.site;
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

Api.Blogger.getRecentPosts = function(appKey, id, name, password, limit) {
   var user = Api.getUser(name, password);
   var site = Api.getSite(id);
   if (!site) { 
      throw Error("Site " + id + " does not exist on this server");
   }

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
   var max = Math.min(stories.size(), limit || Infinity, 20);
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

Api.Blogger.getPost = function(appKey, id, name, password) {
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

   return {
      content: story.title ? "<title>" + story.title + 
            "</title>" + story.text : story.text,
      userid: story.creator.name,
      postid: story._id,
      dateCreated: story.created
   }
}

Api.Blogger.newPost = function(appKey, id, name, password, content, publish) {
   var user = Api.getUser(name, password);
   var site = Api.getSite(id);
   if (!site) {
      throw Error("Site " + id + " does not exist on this server");
   }
   
   // FIXME: This should become obsolete (needs refactoring of 
   // permission model or modification of URL entrypoint)
   res.handlers.site = site;
   res.handlers.membership = Membership.getByName(user.name);   
   if (!site.stories.getPermission("create")) {
      throw Error("Permission denied for user " + user.name + 
            " to add a story to site " + site.name);
   }

   var parts = Api.Blogger.util.getContentParts(content);
   var story = new Story;
   story.site = site;
   story.creator = user;
   story.update({
      title: parts.title,
      text: parts.text,
      status: publish ? Story.PUBLIC : Story.CLOSED,
      mode: Story.FEATURED
   });
   
   return story._id;
}

Api.Blogger.editPost = function(appkey, id, name, password, content, publish) {
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

   var parts = Api.Blogger.util.getContentParts(content);
   story.update({
      title: parts.title,
      text: parts.text,
      status: publish ? Story.PUBLIC : Story.CLOSED,
      modifier: user,
      modified: new Date
   });
   return true;
}

Api.Blogger.deletePost = function(appKey, id, name, password, publish) {
   var user = Api.getUser(name, password);
   var story = Story.getById(id);
   if (!story) {
      throw Error("Story #" + id + " does not exist on this server");
   } else {
      // FIXME: This should become obsolete (needs refactoring of 
      // permission model or modification of URL entrypoint)
      res.handlers.site = story.site;
      res.handlers.membership = Membership.getByName(user.name);
      if (!story.getPermission("delete")) {
         throw Error("Permission denied for user " + name + 
               " to delete story #" + id);
      }
   }
   Story.remove.call(story);
   return true;
}
