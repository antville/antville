/**
 * macro rendering title of comment
 */

function title_macro(param) {
   if (!this.title && !param.as)
      return;
   if (param.as == "editor")
      renderInputText(this.createInputParam("title",param));
   else if (param.as == "link") {
      param.linkto = "main";
      param.anchor = this._id;
      openMarkupElement("a",this.story.createLinkParam(param));
      if (this.title)
         res.write(this.title);
      else {
         // no title, so we show the first words of the comment-text as link
         renderTextPreview(this.text,20);
      }
      closeLink();   
   } else 
      res.write(this.title);
}

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

