/**
 * macro rendering title of story
 */

function title_macro(param) {
   res.write(param.prefix)
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("title",param));
   else if (param.as == "link") {
      var linkParam = new HopObject();
      linkParam.linkto = "main";
      this.openLink(linkParam);
      res.write(this.title);
      this.closeLink();
   } else
      res.write(this.title);
   res.write(param.suffix);
}

/**
 * macro rendering text of story
 */

function text_macro(param) {
   res.write(param.prefix)
   if (param.as == "editor")
      this.renderInputTextarea(this.createInputParam("text",param));
   else {
     var text = createSkin(format(this.text));
     if (!param.limit) {
       this.renderSkin(text);
		 } else {
			 var text = stripTags(this.renderSkinAsString(text));
			 var limit = (param.limit > text.length) ? text.length : param.limit;
       res.write(text.substring(0,limit)); // stripping all HTML tags
		 }
   }
   res.write(param.suffix);
}

/**
 * macro rendering online-status of story
 */

function online_macro(param) {
   res.write(param.prefix)
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
   res.write(param.prefix)
   res.write(this.weblog.formatTimestamp(this.createtime,param));
   res.write(param.suffix);
}

/**
 * macro rendering modifytime of story
 */

function modifytime_macro(param) {
   if (this.modifytime) {
      res.write(param.prefix)
      res.write(this.weblog.formatTimestamp(this.modifytime,param));
      res.write(param.suffix);
   }
}

/**
 * macro renders the name of the author
 */

function author_macro(param) {
   res.write(param.prefix)
   res.write(this.author.name);
   res.write(param.suffix);
}

/**
 * macro rendering a link to edit
 * if user is allowed to edit
 */

function editlink_macro(param) {
   res.write(param.prefix)
   if (this.author == user) {
      var linkParam = new HopObject();
      linkParam.linkto = "edit";
      this.openLink(linkParam);
      if (!param.image)
         res.write(param.text ? param.text : "edit");
      else
         this.renderImage(param);
      this.closeLink();
   }
   res.write(param.suffix);
}

/**
 * macro rendering a link to delete
 * if user is author of this story
 */

function deletelink_macro(param) {
   res.write(param.prefix)
   if (this.author == user) {
      var linkParam = new HopObject();
      linkParam.linkto = "delete";
      this.openLink(linkParam);
      if (!param.image)
         res.write(param.text ? param.text : "delete");
      else
         this.renderImage(param);
      this.closeLink();
   }
   res.write(param.suffix);
}


/**
 * macro rendering link to comments
 */

function commentlink_macro(param) {
   if (path[path.length-1] != this && this.weblog.hasDiscussions()) {
      res.write(param.prefix)
      this.renderSkin(param.useskin ? param.useskin : "commentlink");
      res.write(param.suffix);
   }
}

/**
 * macro renders number of comments
 * options: text to use when no comment
 *          text to use when one comment
 *          text to use when more than one comment
 */

function commentcounter_macro(param) {
   if (this.weblog.hasDiscussions()) {
      res.write(param.prefix)
      this.filter();
      if (this.count() == 0) {
         res.write(this.count() + (param.no ? param.no : " threads"));
      } else if (this.count() == 1) {
         res.write(this.count() + (param.one ? param.one : " thread"));
      } else if (this.count() > 1) {
         res.write(this.count() + (param.more ? param.more : " threads"));
      }
      res.write(param.suffix);
   }
}

/**
 * macro loops over comments and renders them
 */

function comments_macro(param) {
   if (this.weblog.hasDiscussions() && this.count()) {
      res.write(param.prefix)
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
   if (this.weblog.hasDiscussions()) {
      res.write(param.prefix)
      if (user.uid && !user.isBlocked()) {
         var c = new comment();
         c.renderSkin("edit");
      } else if (!user.isBlocked())
         res.write("<A HREF=\"" + this.weblog.members.href("login") + "\">Login to add your comment</A>");
      res.write(param.suffix);
   }
}

/**
 * macro renders an image out of image-pool
 * either as plain image or as image-link
 * overrideable parameters: width,height,alttext,border
 * additional parameters: align, valign
 */

function image_macro(param) {
   if (param && param.name && this.weblog.images.get(param.name)) {
      res.write(param.prefix)
      if (param.linkto) {
         this.openLink(param);
         this.weblog.renderImage(this.weblog.images.get(param.name),param);
         this.closeLink(param);
      } else
         this.weblog.renderImage(this.weblog.images.get(param.name),param);
      res.write(param.suffix);
   }
}
