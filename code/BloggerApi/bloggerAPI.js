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
function getPost(appkey, postid, username, password) {
   var usr = root.blogger.getUser(username,password);
   var entry = root.storiesByID.get(postid.toString());
   if (!entry)
      throwError ("Couldn't find the entry with id " + postid);
   if (entry.isEditDenied(usr,entry.site.members.getMembershipLevel(usr)))
      throwError ("You're not allowed to edit the entry with id " + postid);
   var result = new Object();
   result.content = entry.getContentPart("text");
   result.userid = entry.creator.name;
   result.postid = entry._id;
   result.dateCreated = entry.createtime;
   return (result);
}


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
function newPost (appkey, blogid, username, password, content, publish) {
   var usr = root.blogger.getUser(username,password);
   var blog = root.blogger.getBlog(blogid.toString());
   if (!blog)
      throwError ("Couldn't find the blog " + blogid);
   if (blog.stories.isDenied(usr,blog.members.getMembershipLevel(usr)))
      throwError ("You don't have permission to post to this weblog");

   var param = new Object();
   root.blogger.parseBloggerAPIPosting (param, content);
   param.online = publish ? 2 : 0;
   var result = blog.stories.evalNewStory(new story(), param, usr);
   if (result.error)
      throwError (result.message);
   return (result.id);
}


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
function editPost (appkey, postid, username, password, content, publish) {
   var usr = root.blogger.getUser(username,password);
   var entry = root.storiesByID.get(postid.toString());
   if (!entry)
      throwError ("Couldn't find the entry with id " + postid);
   // check if user is allowed to edit the entry
   if (entry.isEditDenied(usr,entry.site.members.getMembershipLevel(usr)))
      throwError ("You're not allowed to edit the entry with id " + postid);
   var param = new Object();
   root.blogger.parseBloggerAPIPosting (param, content);
   entry.title = param.content_title;
   entry.setContentPart("title",param.content_title);
   entry.setContentPart("text",param.content_text);
   entry.online = publish ? 2 : 0;
   entry.modifier = usr;
   entry.modifytime = new Date();
   entry.site.lastupdate = entry.modifytime;
   return true;
}


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
function getRecentPosts(appkey, blogid, username, password, numberOfPosts) {
   var usr = root.blogger.getUser(username,password);
   var blog = root.blogger.getBlog(blogid.toString());
   if (!blog)
      throwError ("Couldn't find the blog " + blogid);
   var level = blog.members.getMembershipLevel(usr);
   if (blog.isNotPublic(usr, level))
      trowError("You're not allowed to view the blog " + blogid);

   var size = blog.stories.size();
   var limit = Math.min(numberOfPosts ? Math.min(numberOfPosts,20) : 20,size);
   var posts = new Array();
   var idx = 0;
   while (posts.length < limit && idx < size) {
      var entry = blog.stories.get(idx++);
      if (entry.isEditDenied(usr,level))
         continue;
      var param = new Object();
      param.postid = entry._id;
      param.userid = entry.creator.name;
      param.dateCreated = entry.createtime;
      if (entry.title)
         param.content = "<title>"+entry.title+"</title>"+
             entry.getContentPart("text");
      else
         param.content = entry.getContentPart("text");
      posts[posts.length] = param;
   }
   return (posts);
}


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
function deletePost(appkey, postid, username, password, publish) {
   var usr = root.blogger.getUser(username,password);
   var entry = root.storiesByID.get(postid.toString());
   if (!entry)
      throwError ("Couldn't find the entry with id " + postid);
   // check if user is allowed to delete the entry
   if (entry.isDeleteDenied(usr,entry.site.members.getMembershipLevel(usr)))
      throwError ("You're not allowed to delete the entry with id " + postid);
   var result = entry._parent.deleteStory(entry);
   return (!result.error);
}


/**
 *  blogger.getUsersBlogs
 *  returns a list of weblogs to which an author is a member of,
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
function getUsersBlogs(appkey, username, password) {
   var usr = root.blogger.getUser(username,password);
   var result = new Array();
   for (var i=0;i<usr.size();i++) {
      var membership = usr.get(i);
      var blog = membership.site;
      if (blog.stories.isDenied(usr,membership.level))
         continue;
      var param = new Object();
      param.blogid = blog.alias;
      param.blogName = blog.title;
      param.url = blog.href();
      result[result.length] = param;
   }
   return (result);
}


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
function getUserInfo(appkey, username, password) {
   var usr = root.users.get(username);
   if (!usr)
      throwError ("User " + username + " does not exist on this server");
   var result = new Object();
   result.userid = username;
   result.nickname = username;
   result.email = usr.publishemail ? usr.email : null;
   result.url = usr.url;
   result.firstname = null;
   result.lastname = null;
   return result;
}


/**
 *  Utility function to parse the <title>title</title> out of a 
 *  Blogger API posting.
 */
function parseBloggerAPIPosting (param, content) {
   if (content.indexOf ("<title>") != 0)
      param.content_text = content;
   else {
      var endTitle = content.lastIndexOf ("</title>");
      if (endTitle > 0) {
         param.content_title = content.substring (7, endTitle);
         param.content_text = content.substring (endTitle+8); 
      } else
         param.content_text = content;
   }
}


/**
 *  Utility function that authenticates a user via username/password
 *  @param username    String
 *  @param password    String
 *  @return user Object
 */
function getUser(username, password) {
   var usr = root.users.get(username);
   if (!usr)
      throwError ("User " + username + " does not exist on this server");
   if (usr.password != password)
      throwError ("Authentication failed for user " + username);
   if (usr.blocked)
      throwError ("Sorry, your account has been disabled.");
   return (usr);
}


/**
 *  Utility function that retrieves a site-object
 *  @param blogid    String
 *  @return site Object
 */
function getBlog(blogid) {
   var blog = root.get (blogid.toString());
   if (!blog)
      throwError ("The weblog " + blogid + " doesn't exist on this server.");
   else if (blog.blocked)
      throwError ("The weblog " + blogid + " was disabled.");
   return (blog);
}
