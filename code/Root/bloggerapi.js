/*
 *  Functions that implement Blogger's XML-RPC API.
 */

/** 
 * Create a new post after checking user credentials.
 */
function newPost (appkey, blogid, username, password, content, publish) {
    this.checkAccessPermission (blogid, null, username, password);
    var user = getUser (username);
    var blog = this.get (blogid.toString());    
    var param = new Object();
    param.text = content;
    param.online = publish ? 2 : 0;
    var result = blog.stories.evalNewStory(param,user);
    return (result.id);
}

/** 
 * Update an existing posting.
 */
function editPost (appkey, postid, username, password, content, publish) {
    this.checkAccessPermission (null, postid.toString(), username, password);
    var user = getUser (username);
    var s = this.storiesByID.get (postid.toString());
    s.text = content;
    s.online = publish ? 2 : 0;
    s.modifytime = new Date();
    s.weblog.lastupdate = s.modifytime;
    return true;
}

/**
 * Delete an existing posting. [ts]
 */
function deletePost(appkey, postid, username, password, publish) {
    this.checkAccessPermission(null, postid.toString(), username, password);
    var user = getUser(username);
    var s = this.storiesByID.get(postid.toString());
    var blog = s.weblog;
    var result = blog.stories.deleteStory(s);
    return(!result.error);
}


/**
 * This function checks if a user with given credentials may post to a weblog (if 
 * blogid is not null) or edit a story (if postid is not null). If not, an error is thrown.
 */
function checkAccessPermission (blogid, postid, username, password) {
    var user = getUser (username);
    if (!user)
        throwError ("User "+username+" does not exist on this server");
    if (user.password != password)
        throwError ("Authentication failed for user "+username);
    if (user.isBlocked())
        throwError ("Sorry, you can't post to this weblog");
    if (!blogid && !postid)
        throwError ("Invalide blog or post id: "+blogid);
    if (blogid) {
        var blog = this.get (blogid.toString());
        if (!blog)
            throwError ("Weblog "+blogid+" not found on this server");
        if (!blog.userMayContrib()) {
            var status = blog.members.get (username);
            writeln ("STATUS: "+status);
            if (!status || (status.level & MAY_ADD_STORY) == 0)
                throwError ("You don't have permission to post to this weblog");
        }
    } else if (postid) {
        var s = this.storiesByID.get (postid);
        if (!s) 
            throwError ("Story not found for ID "+postid);
        // for now, assume story is only editable by its author
        if (s.author != user)
            throwError ("Not allowed to edit story");
    }
}
