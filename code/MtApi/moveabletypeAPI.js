/*
 *   Functions that implement MovableType's XML-RPC API, which partly includes and extends the Blogger-API and the MetaWeblog-API
 *   see http://www.movabletype.org/docs/mtmanual_programmatic.html for further details
 */


/**
 *  mt.getRecentPostTitles
 *  returns a bandwidth-friendly list of the most recent posts in the system
 *  @param blogid         String
 *  @param username       String
 *  @param password       String
 *  @param numberOfPosts  int, default 20
 *  @return Array of Objects representing Blog Entries
 *                   with the following properties
 *                   .username          String
 *                   .postid            String
 *                   .dateCreated       Date
 *                   .title             String
 */
function getRecentPostTitles(blogid, username, password, numberOfPosts) {
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
      param.username = entry.creator ? entry.creator.username : null;
      param.postid = entry._id;
      param.title = entry.title;
      param.dateCreated = entry.createtime;
      posts[posts.length] = param;
   }
   return (posts);
}


/**
 *  mt.getCategoryList
 *  returns a list of all categories defined in the weblog
 *  @param blogid         String
 *  @param username       String
 *  @param password       String
 *  @return Array of Objects representing Categories
 *                   with the following properties
 *                   .categoryId    String
 *                   .categoryName  String, equals .categoryId
 */
function getCategoryList(blogid, username, password) {
   var usr = root.blogger.getUser(username,password);
   var blog = root.blogger.getBlog(blogid.toString());
   if (!blog)
      throwError ("Couldn't find the blog " + blogid);
   var level = blog.members.getMembershipLevel(usr);
   if (blog.isNotPublic(usr, level))
      trowError("You're not allowed to view the blog " + blogid);

   var arr = blog.topics.list();
   var topics = new Array();
   for (var i=0; i<arr.length; i++) {
     var param = new Object();
     param.categoryId = arr[i].groupname;
     param.categoryName = arr[i].groupname;
     topics[topics.length] = param;
   }
   return (topics);
}


/**
 *  mt.getPostCategories
 *  returns a list of all categories to which the post is assigned to
 *  Antville currently just supports one category per story
 *  @param postid         String
 *  @param username       String
 *  @param password       String
 *  @return Array of Objects representing Categories
 *                   with the following properties
 *                   .categoryId    String
 *                   .categoryName  String, equals .categoryId
 *                   .isPrimary     Boolean, always true in Antville
 */
function getPostCategories(postid, username, password) {
   var usr = root.blogger.getUser(username,password);
   var entry = root.storiesByID.get(postid.toString());
   if (!entry)
      throwError ("Couldn't find the story with id " + postid);
   var level = entry.site.members.getMembershipLevel(usr);
   if (entry.isViewDenied(usr, level))
      trowError("You are not allowed to view the story with id "+postid);
   var topics = new Array();
   if (entry.topic) {
     var param = new Object();
     param.categoryId = entry.topic;
     param.categoryName = entry.topic;
     param.isPrimary = true;
     topics[0] = param;
   }
   return (topics);
}


/**
 *  mt.setPostCategories
 *  sets the categories for a post
 *  Antville currently just supports one category per story
 *  @param postid         String
 *  @param username       String
 *  @param password       String
 *  @param categories     Array of Objects
 *                        with the following properties
 *                       .categoryId    String
 *                       .categoryName  String, equals .categoryId
 *                       .isPrimary     Boolean, will be ignored
 *  @return Boolean true if successful
 */
function setPostCategories(postid, username, password, categories) {
   var usr = root.blogger.getUser(username,password);
   var entry = root.storiesByID.get(postid.toString());
   if (!entry)
      throwError ("Couldn't find the story with id " + postid);
   var level = entry.site.members.getMembershipLevel(usr);
   if (entry.isEditDenied(usr, level))
      trowError("You are not allowed to edit the story with id "+postid);

   if (categories.length>0)
      entry.topic = categories[0].categoryId;
   else
      entry.topic = null;
   return (true);
}


/**
 *  mt.supportedMethods
 *  retrieve information about the XML-RPC methods supported by the server
 */
function supportedMethods() {
   var result = new Array();
   result[result.length] = "metaWeblog.getPost";
   result[result.length] = "metaWeblog.newPost";
   result[result.length] = "metaWeblog.editPost";
   result[result.length] = "blogger.deletePost";
   result[result.length] = "metaWeblog.getRecentPosts";
//   result[result.length] = "metaWeblog.newMediaObject";
   result[result.length] = "blogger.getUsersBlogs";
   result[result.length] = "blogger.getUserInfo";
   result[result.length] = "mt.getRecentPostTitles";
   result[result.length] = "mt.getCategoryList";
   result[result.length] = "mt.getPostCategories";
   result[result.length] = "mt.setPostCategories";
   result[result.length] = "mt.supportedMethods";
   result[result.length] = "mt.supportedTextFilters";
   result[result.length] = "mt.getTrackbackPings";
   result[result.length] = "mt.publishPost";
   return result;
}


/**
 *  mt.supportedTextFilters
 *  retrieves information about the text formatting plugins supported by the server
 *  Antville currently just returns an empty array
 */
function supportedTextFilters() {
   return new Array();
}


/**
 *  mt.getTrackbackPings
 *  retrieve the list of TrackBack pings posted to a particular entry
 *  Antville currently just returns an empty array
 */
function getTrackbackPings() {
   return new Array();
}


/**
 *  mt.publishPost
 *  switches the status of a story to online
 *  @param postid      String
 *  @param username    String
 *  @param password    String
 *  @return Boolean true if successful
 */
function publishPost(postid, username, password) {
   var usr = root.blogger.getUser(username,password);
   var entry = root.storiesByID.get(postid.toString());
   if (!entry)
      throwError ("Couldn't find the story with id " + postid);
   if (entry.isEditDenied(usr,entry.site.members.getMembershipLevel(usr)))
      throwError ("You're not allowed to edit the story with id " + postid);
   entry.publish = 2;
   return (true);
}
