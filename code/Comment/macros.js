/**
 * macro renders a link to reply to a comment
 */

function replylink_macro(param) {
   if (this.site.preferences.getProperty("discussions") && req.action == "main") {
      Html.openLink(this.href("comment") + (param.anchor ? "#" + param.anchor : ""));
      if (!param.image)
         res.write(param.text ? param.text : "reply");
      else
         renderImage(param);
      Html.closeLink();
   }
}

/**
 * macro renders the url of this comment
 */

function url_macro(param) {
   res.write(this.story.href() + "#" + this._id);
}

