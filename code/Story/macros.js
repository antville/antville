/**
 * macro rendering title of story
 */

function title_macro(param) {
   res.write(param.prefix);
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("title",param));
   else if (param.as == "link") {
      var linkParam = new HopObject();
      linkParam.linkto = "main";
      this.openLink(linkParam);
      if (this.title)
         res.write(this.title);
      else {
         // no title, so we show the first words of the story-text as link
         this.renderTextPreview(20);
      }
      this.closeLink();
   } else
      res.write(this.title);
   res.write(param.suffix);
}

/**
 * macro rendering text of story
 */

function text_macro(param) {
   res.write(param.prefix);
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
 * macro rendering online-status of story
 */

function online_macro(param) {
   res.write(param.prefix);
   if (param.as == "editor")
      this.renderInputCheckbox(this.createInputParam("online",param));
   else
      res.write(parseInt(this.online,10) ? "yes" : "no");
   res.write(param.suffix);
}

/**
 * macro rendering createtime of story
 */

function createtime_macro(param) {
   if (!this.createtime)
      return;
   res.write(param.prefix);
   res.write(this.weblog.formatTimestamp(this.createtime,param));
   res.write(param.suffix);
}

/**
 * macro rendering modifytime of story
 */

function modifytime_macro(param) {
   if (this.modifytime) {
      res.write(param.prefix);
      res.write(this.weblog.formatTimestamp(this.modifytime,param));
      res.write(param.suffix);
   }
}

/**
 * macro renders the name of the author
 */

function author_macro(param) {
   if (!this.author)
      return;
   res.write(param.prefix);
   if (param.as == "link" && this.author.url) {
      var linkParam = new HopObject();
      linkParam.to = this.author.url;
      this.openLink(linkParam);
      res.write(this.author.name);
      this.closeLink();
   } else
      res.write(this.author.name);
   res.write(param.suffix);
}

/**
 * macro renders the name of the modifier
 */

function modifier_macro(param) {
   if (!this.modifier)
      return;
   res.write(param.prefix);
   if (param.as == "link" && this.modifier.url) {
      var linkParam = new HopObject();
      linkParam.to = this.modifier.url;
      this.openLink(linkParam);
      res.write(this.modifier.name);
      this.closeLink();
   } else
      res.write(this.modifier.name);
   res.write(param.suffix);
}

/**
 * macro rendering a link to edit
 * if user is allowed to edit
 */

function editlink_macro(param) {
   res.write(param.prefix);
   if (this.isEditAllowed()) {
      var linkParam = new HopObject();
      linkParam.linkto = "edit";
      this.openLink(linkParam);
      if (param.image && this.weblog.images.get(param.image))
         this.weblog.renderImage(this.weblog.images.get(param.image),param);
      else
         res.write(param.text ? param.text : "edit");
      this.closeLink();
   }
   res.write(param.suffix);
}

/**
 * macro rendering a link to delete
 * if user is author of this story
 */

function deletelink_macro(param) {
   res.write(param.prefix);
   if (this.isDeleteAllowed()) {
      var linkParam = new HopObject();
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


/**
 * macro rendering link to comments
 * DEPRECATED
 * this is just left for compatibility with existing weblogs
 * use a simple like i.e. <% story.link to="comment" text="place your comment" %> instead
 */

function commentlink_macro(param) {
   res.write(param.prefix);
   this.renderSkin(param.useskin ? param.useskin : "commentlink");
   res.write(param.suffix);
}


/**
 * macro renders number of comments
 * options: text to use when no comment
 *          text to use when one comment
 *          text to use when more than one comment
 */

function commentcounter_macro(param) {
   if (this.weblog.hasDiscussions()) {
      res.write(param.prefix);
      var linkParam = new HopObject();
      linkParam.linkto = "main";
      if (this.allcomments.count() == 0) {
         res.write(this.allcomments.count() + " " + (param.no ? param.no : " comments"));
      } else if (this.allcomments.count() == 1) {
         this.openLink(linkParam);
         res.write(this.allcomments.count() + " " + (param.one ? param.one : " comments"));
         this.closeLink(linkParam);
      } else if (this.allcomments.count() > 1) {
         this.openLink(linkParam);
         res.write(this.allcomments.count() + " " + (param.more ? param.more : " comments"));
         this.closeLink(linkParam);
      }
      res.write(param.suffix);
   }
}

/**
 * macro loops over comments and renders them
 */

function comments_macro(param) {
   if (this.weblog.hasDiscussions() && this.count()) {
      res.write(param.prefix);
      for (var i=0;i<this.size();i++) {
         res.write("<a name=\""+this.get(i).__id__+"\"></a>");
         this.get(i).renderSkin("toplevel");
      }
      res.write(param.suffix);
   }
}

/**
 * macro checks if user is logged in and not blocked
 * if true, render form to add a comment
 */

function commentform_macro(param) {
   res.write(param.prefix);
   var c = new comment();
   c.renderSkin("edit");
   res.write(param.suffix);
}

/**
 * macro renders an image out of image-pool
 * either as plain image or as image-link
 * overrideable parameters: width,height,alttext,border
 * additional parameters: align, valign
 */

function image_macro(param) {
   if (param.name && this.weblog.images.get(param.name)) {
      res.write(param.prefix);
      if (param.linkto) {
         this.openLink(param);
         this.weblog.renderImage(this.weblog.images.get(param.name),param);
         this.closeLink(param);
      } else
         this.weblog.renderImage(this.weblog.images.get(param.name),param);
      res.write(param.suffix);
   }
}

/**
 * macro is a wrapper-macro for calling thumbnail-macro
 * of weblog
 */

function thumbnail_macro(param) {
   this.weblog.thumbnail_macro(param);
}


/**
 * macro renders the property of story that defines if
 * other users may edit this story
 */

function editableby_macro(param) {
   if (param.as == "editor" && (user == this.author || !this.author)) {
      res.write(param.prefix);
      ddParam = new HopObject();
      ddParam.name = "editableby";
      ddParam.add(this.createDDOption("Author only",3,(this.editableby == 3 ? true : false)));
      ddParam.add(this.createDDOption("Admins only",2,(this.editableby == 2 ? true : false)));
      ddParam.add(this.createDDOption("Contributors and Admins",1,(this.editableby == 1 ? true : false)));
      ddParam.add(this.createDDOption("Members, Contributors and Admins",0,(this.editableby == 0 ? true : false)));
      this.chooser(ddParam);
      res.write(param.suffix);
   } else {
      if (this.editableby == 0)
         res.write("Members, Contributors and Admins of " + this.weblog.title);
      else if (this.editableby == 1)
         res.write("Contributors and Admins of " + this.weblog.title)
      else if (this.editableby == 2)
         res.write("only Admins of " + this.weblog.title);
      else if (this.editableby == 3)
         res.write("Author only");
   }
}
