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
 *   Functions that implement the metaWeblog-API, which partly includes and extends the Blogger-API
 *   see http://www.xmlrpc.com/metaWeblogApi for further details
 */

/**
 * metaWeblog.getPost
 * returns a Blog Entry via its ID
 * @param postid   String
 * @param username String
 * @param password String
 * @return Object representing the Blog Entry
 *                with the following properties
 *                .userid            String
 *                .postid            String
 *                .dateCreated       Date
 *                .title             String
 *                .description       String containing the body of this entry (Note: this used to be .content in the BLOGGER-API)
 *                .categories        Array of Strings, containing categories
 *                .link              String
 *                .permaLink         String, equals .link
 *                .flNotOnHomePage   Boolean, if true then entry just appears in topic
 *                .mt_excerpt        String [MT-API]
 *                .mt_text_more      String [MT-API]
 *                .mt_allow_comments int, 0=no, 1=yes [MT-API]
 *                .mt_allow_pings    int, 0=no, 1=yes [MT-API]
 *                .mt_convert_breaks String [MT-API]
 *                .mt_keywords       String [MT-API]
 */
MetaWeblogApi.prototype.getPost = function(postid, username, password) {
   var usr = root.blogger.getUser(username, password);
   var entry = Story.getById(postid);
   if (!entry)
      throw("Couldn't find the story with id " + postid);
   // check if user is allowed to edit this story
   try {
      entry.checkView(usr, entry.site.members.getMembershipLevel(usr));
   } catch (deny) {
      throw("You're not allowed to edit the story with id " + postid);
   }
   return this.convertStoryToStruct(entry);
};

/**
 *  metaWeblog.newPost
 *  creates a new post, and optionally publishes it
 *  @param blogid   String
 *  @param username String
 *  @param password String
 *  @param content  Object, which can contain the following properties
 *                  .title             String
 *                  .description       String
 *                  .dateCreated       String (ISO.8601)
 *                  .categories        Array of Strings, containing categories
 *                  .flNotOnHomePage   Boolean, if true then entry just appears in topic
 *                  .mt_allow_comments int, 0=no, 1=yes [MT-API]
 *                  .mt_allow_pings    int,    currently ignored [MT-API]
 *                  .mt_convert_breaks String, currently ignored [MT-API]
 *                  .mt_text_more      String, currently ignored [MT-API]
 *                  .mt_excerpt        String, currently ignored [MT-API]
 *                  .mt_keywords       String, currently ignored [MT-API]
 *                  .mt_tb_ping_urls   String, currently ignored [MT-API]
 *                  .mt_text_more      String, currently ignored [MT-API]
 *  @param publish  int, 0=no, 1=yes
 *  @return String representing the ID of the new Story
 */
MetaWeblogApi.prototype.newPost = function(blogid, username, password, content, publish) {
   var usr = root.blogger.getUser(username, password);
   var blog = root.blogger.getBlog(blogid.toString());
   if (!blog)
      throw("Couldn't find the blog " + blogid);
   try {
      blog.stories.checkAdd(usr, blog.members.getMembershipLevel(usr));
   } catch (deny) {
      throw("You don't have permission to post to this site");
   }
   var param = new Object();
   param.http_remotehost = "metaweblogAPI";
   param.content_title = content.title;
   param.content_text  = content.description;
   if (content.dateCreated)
     param.createtime = content.dateCreated.format("yyyy-MM-dd HH:mm");
   if (content.categories && content.categories.length>0)
      param.topic = content.categories[0];
   param.publish = publish;
   param.addToFront = (content.flNotOnHomePage && param.topic) ? false : true;
   param.discussions = content.discussions == 0 ? 0 : 1;
   try {
      var result = blog.stories.evalNewStory(param, usr);
      return result.id;
   } catch (e) {
      throw(e.toString());
   }
};

/**
 *  metaWeblog.editPost
 *  updates information about an existing post
 *  @param postid   String
 *  @param username String
 *  @param password String
 *  @param content  Object, which can contain the following properties
 *                  .title             String
 *                  .description       String
 *                  .dateCreated       String (ISO.8601)
 *                  .categories        Array of Strings, containing categories
 *                  .flNotOnHomePage   Boolean, if true then entry just appears in topic
 *                  .mt_allow_comments int, 0=no, 1=yes [MT-API]
 *                  .mt_allow_pings    int,    currently ignored [MT-API]
 *                  .mt_convert_breaks String, currently ignored [MT-API]
 *                  .mt_text_more      String, currently ignored [MT-API]
 *                  .mt_excerpt        String, currently ignored [MT-API]
 *                  .mt_keywords       String, currently ignored [MT-API]
 *                  .mt_tb_ping_urls   String, currently ignored [MT-API]
 *                  .mt_text_more      String, currently ignored [MT-API]
 *  @param publish  int, 0=no, 1=yes
 *  @return Boolean true if successful
 */
MetaWeblogApi.prototype.editPost = function(postid, username, password, content, publish) {
   var usr = root.blogger.getUser(username, password);
   var entry = Story.getById(postid);
   if (!entry)
      throw("Couldn't find the story with id " + postid);
   // check if user is allowed to edit the story
   try {
      entry.checkEdit(usr, entry.site.members.getMembershipLevel(usr));
   } catch (deny) {
      throw("You're not allowed to edit the story with id " + postid);
   }
   var param = new Object();
   param.content_title = content.title;
   param.content_text  = content.description;
   if (content.dateCreated)
     param.createtime = (content.dateCreated).format("yyyy-MM-dd HH:mm");
   if (content.categories && content.categories.length>0)
      param.topic = content.categories[0];
   param.publish = publish;
   param.addToFront = (content.flNotOnHomePage && param.topic) ? false : true;
   param.discussions = content.mt_allow_comments == 0 ? 0 : 1;
   try {
      entry.evalStory(param, usr);
      return true;
   } catch (e) {
      throw(e.toString());
   }
};

/**
 *  metaWeblog.getRecentPosts
 *  returns a list of the most recent posts in the system
 *  @param blogid         String
 *  @param username       String
 *  @param password       String
 *  @param numberOfPosts  int, default 20
 *  @return Array of Objects representing Blog Entries
 *                   with the following properties
 *                   .userid            String
 *                   .postid            String
 *                   .dateCreated       Date
 *                   .title             String
 *                   .description       String containing the body of this entry (Note: this used to be .content in the BLOGGER-API)
 *                   .link              String
 *                   .permaLink         String, equals .link
 *                   .mt_excerpt        String [MT-API]
 *                   .mt_text_more      String [MT-API]
 *                   .mt_allow_comments int, 0=no, 1=yes [MT-API]
 *                   .mt_allow_pings    int, 0=no, 1=yes [MT-API]
 *                   .mt_convert_breaks String [MT-API]
 *                   .mt_keywords       String [MT-API]
 *                   .antville_blogid   String
 */
MetaWeblogApi.prototype.getRecentPosts = function(blogid, username, password, numberOfPosts) {
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
      posts[posts.length] = this.convertStoryToStruct(entry);
   }
   return posts;
};

/**
 *  metaWeblog.getCategories
 *  returns a list of categories for a site
 *  @param blogid         String
 *  @param username       String
 *  @param password       String
 *  @return Array of Objects representing Categories
 *                   with the following properties
 *                   .description       String
 *                   .htmlUrl           String
 *                   .rssUrl            String
 */
MetaWeblogApi.prototype.getCategories = function(blogid, username, password) {
   var usr = root.blogger.getUser(username, password);
   var blog = root.blogger.getBlog(blogid.toString());
   if (!blog)
      throw("Couldn't find the blog " + blogid);
   var level = blog.members.getMembershipLevel(usr);
   try {
      blog.checkView(usr, level);
   } catch (deny) {
      trow("You're not allowed to view the blog " + blogid);
   }
   var arr = blog.topics.list();
   var topics = new Array();
   for (var i=0; i<arr.length; i++) {
     var param = new Object();
     param.description = arr[i].groupname;
     param.htmlUrl = arr[i].href();
     param.rssUrl = null;
     topics[topics.length] = param;
   }
   return topics;
};

/**
 *  metaWeblog.newMediaObject
 *  uploads a file to the webserver
 *  @param blogid     String
 *  @param username   String
 *  @param password   String
 *  @param fileObject Object, containing the following properties
 *                    .bits base64, the base64-encoded contents of the file
 *                    .name String containing the filename
 *                    .type String representing a MIME-type
 *                    .description String (optional) description of the object
 *                    .antville_maxheight Integer (optional), just applies for images
 *                    .antville_maxwidth Integer (optional), just applies for images
 *  @return Object containing the following properties
 *                    .url String containing the URL of the uploaded file
 *                    .antville_alias Sting containing the alias of the uploaded file
 *                    .antville_message String human readable message indicating success
 *                    .antville_macro String a macro which can be embedded into storys to insert this object
 *                    .antville_thumbmacro String (optional) a macro to display a thumbnail
 *                    .antville_popupmacro String (optional) a macro to display the image as a popup
 *                    .antville_staticUrl String (optional) url of the Image
 *                    .antville_popupUrl String (optional) javascript code to open a popup with the image
 *                    .antville_width Int (optional) the width of the image
 *                    .antville_height Int (optional) the height of the image
 */
MetaWeblogApi.prototype.newMediaObject = function(blogid, username, password, fileObject) {
   var usr = root.blogger.getUser(username, password);
   var blog = root.blogger.getBlog(blogid.toString());
   if (!blog)
      throw("Couldn't find the blog " + blogid);
   var level = blog.members.getMembershipLevel(usr);
   var param = new Object();
   var ret = new Object();
   if (fileObject.type.toLowerCase().startsWith("image/")) {
      // handle new image
      try {
         blog.images.checkAdd(usr, level);
         param.rawimage = new Packages.helma.util.MimePart(fileObject.name, fileObject.bits, fileObject.type);
         param.maxheight = fileObject.antville_maxheight;
         param.maxwidth = fileObject.antville_maxwidth;
         param.alttext = fileObject.description;
         var result = blog.images.evalImg(param, usr);
         var mediaObject = result.obj;
         ret.antville_alias = mediaObject.alias;
         ret.antville_staticUrl = mediaObject.getUrl();
         ret.antville_popupUrl = mediaObject.getPopupUrl();
         ret.antville_width = mediaObject.width;
         ret.antville_height = mediaObject.height;
         ret.antville_macro = "<% image name=\"" + blog.alias + "/" + mediaObject.alias + "\" %>";
         if (mediaObject.thumbnail) {
            ret.antville_popupmacro = "<% image name=\"" + blog.alias + "/" + mediaObject.alias + "\" as=\"popup\" %>";
            ret.antville_thumbmacro = "<% image name=\"" + blog.alias + "/" + mediaObject.alias + "\" as=\"thumbnail\" %>";
         }
      } catch (e) {
         if (e instanceof DenyException)
            throw("You're not allowed to upload images to the blog " + blog.alias);
         else
            throw("Error while creating new Media Object: " + e.toString());
      }
   } else {
      // handle new file
      try {
         blog.files.checkAdd(usr, level);
         param.rawfile = new Packages.helma.util.MimePart(fileObject.name, fileObject.bits, fileObject.type);
         param.description = fileObject.description;
         var result = blog.files.evalFile(param, usr);
         var mediaObject = result.obj;
         ret.antville_macro = "<% file name=\"" + blog.alias + "/" + mediaObject.alias + "\" %>";
      } catch (e) {
         if (e instanceof DenyException)
            throw("You're not allowed to upload files to the blog " + blog.alias);
         else
            throw("Error occured while creating new Media Object: " + e.toString());
      }
   }
   ret.url = mediaObject.getUrl();
   ret.antville_message = result.toString();
   return ret;
};

/**
 *  Utility function which creates an Object
 *  representing a blog entry
 */
MetaWeblogApi.prototype.convertStoryToStruct  = function(entry) {
   var obj = new Object();
   obj.userid = entry.creator ? entry.creator.name : null;
   obj.postid = entry._id;
   obj.dateCreated = entry.createtime;
   obj.title = entry.content.get("title");
   obj.description = entry.content.get("text");
   obj.categories = entry.topic ? new Array(entry.topic) : new Array();
   obj.flNotOnHomePage = entry.online==1 ? true : false;
   obj.link = entry.href();
   obj.permaLink = obj.link;
   obj.mt_excerpt = null;
   obj.mt_text_more = null;
   obj.mt_allow_comments = entry.discussions ? 1 : 0;
   obj.mt_allow_pings = 0;
   obj.mt_convert_breaks = null;
   obj.mt_keywords = null;
   obj.antville_blogid = entry.site.alias;
   return obj;
};
