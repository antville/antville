/**
 * macro rendering title of comment
 */

function title_macro(param) {
   renderPrefix(param);
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("title",param));
   else
      res.write(this.title);
   renderSuffix(param);
}

/**
 * macro rendering text of comment
 */

function text_macro(param) {
   renderPrefix(param);
   if (param.as == "editor")
      this.renderInputTextarea(this.createInputParam("text",param));
   else {
      var text = createSkin(format(this.text));
      this.renderSkin(text);
   }
   renderSuffix(param);
}


/**
 * macro renders author of comment
 */

function author_macro(param) {
   renderPrefix(param);
   if (this.author.url) {
      var linkParam = new HopObject();
      linkParam.to = this.author.url;
      this.openLink(linkParam);
      res.write(this.author.name);
      this.closeLink();
   } else
      res.write(this.author.name);
   renderSuffix(param);
}

/**
 * macro renders createtime of comment
 */

function createtime_macro(param) {
   renderPrefix(param);
   res.write(this.weblog.formatTimestamp(this.createtime,param));
   renderSuffix(param);
}

/**
 * macro renders modifytime of comment
 */

function modifytime_macro(param) {
   if (this.modifytime) {
      renderPrefix(param);
      res.write(this.weblog.formatTimestamp(this.modifytime,param));
      renderSuffix(param);
   }
}

/**
 * macro renders a link for editing a posting
 * if user == author of posting
 */

function editlink_macro(param) {
   if (this.weblog.hasDiscussions() && this.author == user && path[path.length-1] != this) {
      renderPrefix(param);
      var linkParam = new HopObject();
      linkParam.linkto = "edit";
      this.openLink(linkParam);
      if (!param.image)
         res.write(param.text ? param.text : "edit");
      else
         this.renderImage(param);
      this.closeLink();
      renderSuffix(param);
   }
}

/**
 * macro renders a link to delete the comment
 * if user == weblog-admin
 */

function deletelink_macro(param) {
   if (this.weblog.hasDiscussions()) {
      if (this.weblog.isUserAdmin() && path[path.length-1] != this) {
         renderPrefix(param);
         var linkParam = new HopObject();
         linkParam.linkto = "delete";
         this.openLink(linkParam);
         if (!param.image)
            res.write(param.text ? param.text : "delete");
         else
            this.renderImage(param);
         this.closeLink();
      }
      renderSuffix(param);
   }
}

/**
 * macro renders a link to reply to a comment
 */

function replylink_macro(param) {
   if (this.weblog.hasDiscussions() && !user.isBlocked() && path[path.length-1] != this) {
      renderPrefix(param);
      var linkParam = new HopObject();
      linkParam.linkto = "reply";
      this.openLink(linkParam);
      if (!param.image)
         res.write(param.text ? param.text : "reply");
      else
         this.renderImage(param);
      this.closeLink();
      renderSuffix(param);
   }
}

/**
 * macro renders replies to this comment
 */

function replies_macro(param) {
   if (this.weblog.hasDiscussions()) {
      this.filter();
      if (this.count()) {
         renderPrefix(param);
         for (var i=0;i<this.size();i++)
            this.get(i).renderSkin("reply");
         renderSuffix(param);
      }
   }
}