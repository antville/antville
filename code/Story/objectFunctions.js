/**
 * check if story is ok; if true, save changed story
 */

function evalStory() {
   if (req.data.text) {
      if (user == this.author && req.data.editableby != null && req.data.editableby != "")
         this.editableby = parseInt(req.data.editableby,10);
      this.title = req.data.title;
      this.text = req.data.text;
      this.online = parseInt(req.data.online,10);
      this.modifytime = new Date();
      this.modifier = user;
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
   if (user.uid && !user.isBlocked() && req.data.submit != "cancel") {
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
 * function deletes a whole thread
 */

function deleteComment(currComment) {
   for (var i=currComment.size();i>0;i--)
      currComment.deleteComment(currComment.get(i-1));
   currComment.setParent(this);
   this.remove(currComment);
   res.message = "The comment was deleted successfully!";
}
