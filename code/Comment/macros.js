/**
 * macro rendering title of comment
 */

function title_macro(param) {
   res.write(param.prefix)
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("title",param));
   else if (param.as == "link") {
      var linkParam = new Object();
      linkParam.linkto = "main";
			linkParam.urlparam = "#"+this._id;
      this.story.openLink(linkParam);
      if (this.title)
         res.write(this.title);
      else {
         // no title, so we show the first words of the comment-text as link
         this.renderTextPreview(20);
      }
      this.story.closeLink();   
   } else 
      res.write(this.title);
   res.write(param.suffix);
}

/**
 * macro rendering text of comment
 */

function text_macro(param) {
   res.write(param.prefix)
   if (param.as == "editor")
      this.renderInputTextarea(this.createInputParam("text",param));
   else {
      if (!param.limit)
         this.renderSkin(createSkin(format(this.text)));
      else {
         this.renderTextPreview(param.limit);
         res.write("&nbsp;...");
      }
   }
   res.write(param.suffix);
}


/**
 * macro renders author of comment
 */

function author_macro(param) {
   res.write(param.prefix)
   if (param.as == "link" && this.author.url) {
      var linkParam = new Object();
      linkParam.to = this.author.url;
      this.openLink(linkParam);
      res.write(this.author.name);
      this.closeLink();
   } else
      res.write(this.author.name);
   res.write(param.suffix);
}

/**
 * macro renders createtime of comment
 */

function createtime_macro(param) {
   res.write(param.prefix)
   res.write(this.weblog.formatTimestamp(this.createtime,param));
   res.write(param.suffix);
}

/**
 * macro renders modifytime of comment
 */

function modifytime_macro(param) {
   if (this.modifytime) {
      res.write(param.prefix)
      res.write(this.weblog.formatTimestamp(this.modifytime,param));
      res.write(param.suffix);
   }
}

/**
 * macro renders a link for editing a posting
 * if user == author of posting
 */

function editlink_macro(param) {
   if (!this.isEditDenied() && path[path.length-1] != this) {
      res.write(param.prefix)
      var linkParam = new Object();
      linkParam.linkto = "edit";
      this.openLink(linkParam);
      if (param.image && this.weblog.images.get(param.image))
         this.weblog.renderImage(this.weblog.images.get(param.image),param);
      else
         res.write(param.text ? param.text : "edit");
      this.closeLink();
      res.write(param.suffix);
   }
}

/**
 * macro renders a link to delete the comment
 * if user == weblog-admin
 */

function deletelink_macro(param) {
   if (this.weblog.hasDiscussions()) {
      if (this.weblog.isUserAdmin() && path[path.length-1] != this) {
         res.write(param.prefix)
         var linkParam = new Object();
         linkParam.linkto = "delete";
         this.openLink(linkParam);
         if (param.image && this.weblog.images.get(param.image))
            this.weblog.renderImage(this.weblog.images.get(param.image),param);
         else
            res.write(param.text ? param.text : "delete");
         this.closeLink();
      }
      res.write(param.suffix);
   }
}

/**
 * macro renders a link to reply to a comment
 */

function replylink_macro(param) {
   if (this.weblog.hasDiscussions() && !user.isBlocked() && path[path.length-1] != this) {
      res.write(param.prefix)
      var linkParam = new Object();
      linkParam.linkto = "reply";
      this.openLink(linkParam);
      if (!param.image)
         res.write(param.text ? param.text : "reply");
      else
         this.renderImage(param);
      this.closeLink();
      res.write(param.suffix);
   }
}

/**
 * macro renders replies to this comment
 */

function replies_macro(param) {
   if (this.weblog.hasDiscussions()) {
      if (this.count()) {
         res.write(param.prefix)
         for (var i=0;i<this.size();i++) {
            res.write("<a name=\""+this.get(i)._id+"\"></a>");
            this.get(i).renderSkin("reply");
				 }
         res.write(param.suffix);
      }
   }
}
