/**
 * macro renders a link to reply to a comment
 */

function replylink_macro(param) {
   if (this.site.hasDiscussions() && !isUserBlocked() && req.action == "main") {
      openLink(this.href("comment"));
      if (!param.image)
         res.write(param.text ? param.text : "reply");
      else
         renderImage(param);
      closeLink();
   }
}

/**
 * macro renders the url of this comment
 */

function url_macro(param) {
   res.write(this.story.href() + "#" + this._id);
}

