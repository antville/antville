/**
 * function returns true/false whether story is online or not
 */

function isOnline() {
   if (parseInt(this.online,10))
      return true;
   return false;
}


/**
 * function evaluates changes to posting
 */

function updateComment() {
   if (this.author == user) {
      this.title = req.data.title;
      this.text = req.data.text;
      this.modifytime = new Date();
      res.message = "Changes were saved successfully!";
   } else
      res.message = "Sorry, you're not allowed to edit a posting of somebody else!";
   res.redirect(this.story.href());
}

/**
 * function adds a comment to a comment ...
 */

function addComment() {
   var r = new comment();
   if (req.data.text) {
      r.text = req.data.text;
      r.title = req.data.title;
      r.author = user;
      r.createtime = new Date();
      r.modifytime = new Date();
      r.weblog = this.weblog;
      r.story = this.story;
      r.online = 1;
      r.parent = this;
      this.add(r);
      this.weblog.lastupdate = new Date();
      res.redirect(this.story.href());
   }
   return (r);
}

/**
 * function deletes a comment
 */

function deleteComment(currComment) {
   currComment.setParent(this);
   this.remove(currComment);
   res.message = "The comment was deleted successfully!";
}

/**
 * function loops over replies 
 * and removes them
 */

function deleteReplies() {
   for (var j=this.size();j>0;j--)
      this.deleteComment(this.get(j-1));
}