/**
 * check if story is ok; if true, save changed story
 */

function evalStory() {
   if (req.data.text) {
      this.title = req.data.title;
      this.text = req.data.text;
      this.online = req.data.online;
      this.modifytime = new Date();
      this.weblog.lastupdate = new Date();
      res.message = "The story was updated successfully!";
      res.redirect(this.weblog.href());
   } else
      res.message = "You need at least some text!";
}


/**
 * function returns true/false whether story is online or not
 */

function isOnline() {
   if (parseInt(this.online,10))
      return true;
   return false;
}

/**
 * function evaluates comment and adds it if ok
 */

function addComment() {
   if (user.uid && !user.isBlocked()) {
      var c = new comment();
      c.title = req.data.title;
      c.text = req.data.text;
      c.weblog = this.weblog;
      c.story = this;
      c.createtime = new Date();
      c.modifytime = new Date();
      c.author = user;
      c.online = 1;
      c.ipadress = req.data.http_remotehost;
      this.add(c);
      this.weblog.lastupdate = new Date();
   }
   res.redirect(this.href());
}

/**
 * function deletes a comment
 */

function deleteComment(currComment) {
   currComment.setParent(this);
   this.remove(currComment);
   res.message = "The comment was deleted successfully!";
   res.redirect(this.href());
}
