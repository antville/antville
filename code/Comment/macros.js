/**
 * macro rendering title of comment
 */

function title_macro(param) {
   if (!this.title && !param.as)
      return;
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("title",param));
   else if (param.as == "link") {
      var linkParam = new Object();
      linkParam.linkto = "main";
      linkParam.urlparam = "#" + this._id;
      this.story.openLink(linkParam);
      if (this.title)
         res.write(this.title);
      else {
         // no title, so we show the first words of the comment-text as link
         renderTextPreview(this.text,20);
      }
      this.story.closeLink();   
   } else 
      res.write(this.title);
}

/**
 * macro renders a link to reply to a comment
 */

function replylink_macro(param) {
   if (this.weblog.hasDiscussions() && !isUserBlocked() && req.action == "main") {
      var linkParam = new Object();
      linkParam.linkto = "comment";
      this.openLink(linkParam);
      if (!param.image)
         res.write(param.text ? param.text : "reply");
      else
         this.renderImage(param);
      this.closeLink();
   }
}

/**
 * macro renders the url of this comment
 */

function url_macro(param) {
   res.write(this.story.href() + "#" + this._id);
}

