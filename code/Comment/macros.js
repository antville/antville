/**
 * macro renders a link to reply to a comment
 */
function replylink_macro(param) {
   if (this.site.preferences.getProperty("discussions") && req.action == "main") {
      Html.openLink({href: this.href("comment") +
                     (param.anchor ? "#" + param.anchor : "")});
      if (param.image && this.site.images.get(param.image))
         renderImage(this.site.images.get(param.image), param);
      else
         res.write(param.text ? param.text : getMessage("Comment.reply"));
      Html.closeLink();
   }
   return;
}

/**
 * macro renders the url of this comment
 */
function url_macro(param) {
   res.write(this.story.href() + "#" + this._id);
   return;
}

