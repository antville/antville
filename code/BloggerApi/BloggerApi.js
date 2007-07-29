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

/*
 *   Functions that implement Blogger's XML-RPC API
 *   see http://www.blogger.com/developers/api/1_docs/ for further details
 *   blogger.getTemplate and blogger.setTemplate are not supported
 */

/**
 * blogger.getPost
 * returns a Blog Entry via its ID
 * @param appkey   String
 * @param postid   String
 * @param username String
 * @param password String
 * @return Object representing the Blog Entry
 *                with the following properties
 *                .userid            String
 *                .postid            String
 *                .dateCreated       Date
 *                .content           String
 */
BloggerApi.prototype.getPost = function(appkey, postid, username, password) {
   var usr = root.blogger.getUser(username, password);
   var entry = Story.getById(postid);
   if (!entry)
      throw("Couldn't find the entry with id " + postid);
   try {
      entry.checkEdit(usr, entry.site.members.getMembershipLevel(usr));
   } catch (deny) {
      throw ("You're not allowed to edit the entry with id " + postid);
   }
   var result = new Object();
   result.content = entry.content.get("text");
   result.userid = entry.creator.name;
   result.postid = entry._id;
   result.dateCreated = entry.createtime;
   return result;
};

/**
 *  blogger.newPost
 *  creates a new post, and optionally publishes it
 *  @param appkey   String
 *  @param blogid   String
 *  @param username String
 *  @param password String
 *  @param content  String
 *  @param publish  int, 0=no, 1=yes
 *  @return String representing the ID of the new entry
 */
BloggerApi.prototype.newPost = function(appkey, blogid, username, password, content, publish) {
   var usr = root.blogger.getUser(username, password);
   var blog = root.blogger.getBlog(blogid.toString());
   if (!blog)
      throw("Couldn't find the blog " + blogid);
   try {
      blog.stories.checkAdd(usr, blog.members.getMembershipLevel(usr));
      var param = new Object();
      param.http_remotehost = "bloggerAPI";
      root.blogger.parseBloggerAPIPosting (param, content);
      param.publish = publish;
      param.addToFront = true;
      param.discussions = true;
      var result = blog.stories.evalNewStory(param, usr);
      return result.id;
   } catch (e) {
      if (e instanceof DenyException)
         throw ("You don't have permission to post to this site");
      else
         throw(e.toString());
   }
   return;
};

/**
 *  blogger.editPost
 *  updates information about an existing post
 *  @param appkey   String
 *  @param postid   String
 *  @param username String
 *  @param password String
 *  @param content  String
 *  @param publish  int, 0=no, 1=yes
 *  @return Boolean true if successful
 */
BloggerApi.prototype.editPost = function(appkey, postid, username, password, content, publish) {
   var usr = root.blogger.getUser(username, password);
   var entry = Story.getById(postid);
   if (!entry)
      throw("Couldn't find the entry with id " + postid);
   // check if user is allowed to edit the entry
   try {
      entry.checkEdit(usr, entry.site.members.getMembershipLevel(usr));
   } catch (deny) {
      throw ("You're not allowed to edit the entry with id " + postid);
   }
   var param = new Object();
   root.blogger.parseBloggerAPIPosting(param, content);
   entry.title = param.content_title;
   entry.content.set("title", param.content_title);
   entry.content.set("text", param.content_text);
   entry.online = publish ? 2 : 0;
   entry.modifier = usr;
   entry.modifytime = new Date();
   entry.site.lastupdate = entry.modifytime;
   return true;
};

/**
 *  blogger.getRecentPosts
 *  returns a list of the most recent posts in the system
 *  @param appkey         String
 *  @param blogid         String
 *  @param username       String
 *  @param password       String
 *  @param numberOfPosts  int, default 20
 *  @return Array of Objects representing Blog Entries
 *                   with the following properties
 *                   .userid            String
 *                   .postid            String
 *                   .dateCreated       Date
 *                   .content           String
 */
BloggerApi.prototype.getRecentPosts = function(appkey, blogid, username, password, numberOfPosts) {
   var usr = root.blogger.getUser(username, password);
   var blog = root.blogger.getBlog(blogid.toString());
   if (!blog)
      throw("Couldn't find the blog " + blogid);
   var level = blog.members.getMembershipLevel(usr);
   try {
      blog.checkView(usr, level);
   } catch (deny) {
      throw("You're not allowed to view the blog " + blogid);
   }

   var size = blog.stories.size();
   var limit = Math.min(numberOfPosts ? Math.min(numberOfPosts, 20) : 20, size);
   var posts = new Array();
   var idx = 0;
   while (posts.length < limit && idx < size) {
      var entry = blog.stories.get(idx++);
      try {
         entry.checkEdit(usr, level);
      } catch (deny) {
         continue;
      }
      var param = new Object();
      param.postid = entry._id;
      param.userid = entry.creator.name;
      param.dateCreated = entry.createtime;
      if (entry.title)
         param.content = "<title>"+entry.title+"</title>"+
             entry.content.get("text");
      else
         param.content = entry.content.get("text");
      posts[posts.length] = param;
   }
   return posts;
};

/**
 *  blogger.deletePost
 *  deletes an existing post
 *  @param appkey      String
 *  @param postid      String
 *  @param username    String
 *  @param password    String
 *  @param publish     int
 *  @return Boolean true if successful
 */
BloggerApi.prototype.deletePost = function(appkey, postid, username, password, publish) {
   var usr = root.blogger.getUser(username, password);
   var entry = Story.getById(postid);
   if (!entry)
      throw("Couldn't find the entry with id " + postid);
   // check if user is allowed to delete the entry
   try {
      entry.checkDelete(usr, entry.site.members.getMembershipLevel(usr));
      entry._parent.deleteStory(entry);
      return true;
   } catch (e) {
      if (e instanceof DenyException)
         throw ("You're not allowed to delete the entry with id " + postid);
      else
         throw(e.toString());
   }
   return;
};

/**
 *  blogger.getUsersBlogs
 *  returns a list of sites to which an author is a member of,
 *  and allowed to add/edit stories
 *  @param appkey      String
 *  @param username    String
 *  @param password    String
 *  @return Array of Object representing Blogs
 *                with the following properties:
 *                .url      String
 *                .blogid   String
 *                .blogName String
 */
BloggerApi.prototype.getUsersBlogs = function(appkey, username, password) {
   var usr = root.blogger.getUser(username, password);
   var result = new Array();
   for (var i=0;i<usr.size();i++) {
      var membership = usr.get(i);
      var blog = membership.site;
      try {
         blog.stories.checkAdd(usr, membership.level);
      } catch (deny) {
         continue;
      }
      var param = new Object();
      param.blogid = blog.alias;
      param.blogName = blog.title;
      param.url = blog.href();
      result.push(param);
   }
   return result;
};

/**
 *  blogger.getUserInfo
 *  returns information about a certain user
 *  no password authentification required
 *  @param appkey      String
 *  @param username    String
 *  @param password    String
 *  @return Object representing User
 *                 with the following properties:
 *                 .userid      String
 *                 .nickname    String
 *                 .email       String
 *                 .url         String
 *                 .firstname   String, not implemented
 *                 .lastname    String, not implemented
 */ 
BloggerApi.prototype.getUserInfo = function(appkey, username, password) {
   var usr = root.users.get(username);
   if (!usr)
      throw("User " + username + " does not exist on this server");
   var result = new Object();
   result.userid = username;
   result.nickname = username;
   result.email = usr.publishemail ? usr.email : null;
   result.url = usr.url;
   result.firstname = null;
   result.lastname = null;
   return result;
};

/**
 *  Utility function to parse the <title>title</title> out of a 
 *  Blogger API posting.
 */
BloggerApi.prototype.parseBloggerAPIPosting  = function(param, content) {
   if (!content.startsWith("<title>"))
      param.content_text = content;
   else {
      var endTitle = content.lastIndexOf ("</title>");
      if (endTitle > 0) {
         param.content_title = content.substring (7, endTitle);
         param.content_text = content.substring (endTitle+8); 
      } else
         param.content_text = content;
   }
};

/**
 *  Utility function that authenticates a user via username/password
 *  @param username    String
 *  @param password    String
 *  @return user Object
 */
BloggerApi.prototype.getUser = function(username, password) {
   var usr = root.users.get(username);
   if (!usr)
      throw("User " + username + " does not exist on this server");
   if (usr.password != password)
      throw("Authentication failed for user " + username);
   if (usr.blocked)
      throw("Sorry, your account has been disabled.");
   return usr;
};

/**
 *  Utility function that retrieves a site-object
 *  @param blogid    String
 *  @return site Object
 */
BloggerApi.prototype.getBlog = function(blogid) {
   var blog = root.get (blogid.toString());
   if (!blog)
      throw("The site " + blogid + " doesn't exist on this server.");
   else if (blog.blocked)
      throw("The site " + blogid + " was disabled.");
   return blog;
};
