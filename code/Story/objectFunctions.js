/**
 * check if story is ok; if true, save changed story
 */

function evalStory() {
   if (req.data.text) {
      if (user == this.author && req.data.editableby != null && req.data.editableby != "")
         this.editableby = parseInt(req.data.editableby,10);
      else
         this.editableby = 2;
      this.title = req.data.title;
      this.text = req.data.text;
      this.online = parseInt(req.data.online,10);
      this.modifytime = new Date();
      this.modifier = user;
      if (req.data.topic)
         this.topic = req.data.topic;
      else
         this.topic = null;
      this.weblog.lastupdate = new Date();
      res.message = "The story was updated successfully!";
      if (user.cache.referer) {
         var redirTo = user.cache.referer;
         user.cache.referer = null;
      }
      // href() may not yet work if we changed the topic
      // so we build the redirect URL manually
      if (this.topic)
         res.redirect(path.weblog.space.href()+this.topic+"/"+this._id);
      else
         res.redirect(path.weblog.href()+this.day+"/"+this._id);
      // res.redirect(redirTo ? redirTo : this.weblog.stories.href());
   } else
      res.message = "You need at least some text!";
}

/**
 * function sets story either online or offline
 */

function toggleOnline(newStatus) {
   if (newStatus == "online") {
      this.online = 1;
      this.weblog.lastupdate = new Date();
   } else if (newStatus == "offline")
      this.online = 0;
   res.redirect(this.weblog.stories.href());
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
   if (user.uid && !user.isBlocked() && (req.data.submit != "cancel" &&  !req.data.cancel)) {
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
