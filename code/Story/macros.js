/**
 * macro rendering title of story
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
 * macro rendering text of story
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
 * macro rendering online-status of story
 */

function online_macro(param) {
   renderPrefix(param);
   if (param.as == "editor")
      this.renderInputCheckbox(this.createInputParam("online",param));
   else
      res.write(parseInt(this.online,10) ? "yes" : "no");
   renderSuffix(param);
}

/**
 * macro rendering createtime of story
 */

function createtime_macro(param) {
   renderPrefix(param);
   if (param.as == "editor")
      this.renderDateDropdown(this.createInputParam("createtime",param));
   else {
      res.write(param.format ? this.createtime.format(param.format) : this.createtime.format("yyyy.MM.dd HH:mm"));
   }
   renderSuffix(param);
}


/**
 * macro rendering a link to edit
 * if user is allowed to edit
 */

function editlink_macro(param) {
   renderPrefix(param);
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
   renderSuffix(param);
}

/**
 * macro rendering a link to delete
 * if user is owner of this story
 */

function deletelink_macro(param) {
   renderPrefix(param);
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
   renderSuffix(param);
}


/**
 * macro rendering link to comments
 */

function commentlink_macro(param) {
   if (path[path.length-1] != this && this.weblog.hasDiscussions()) {
      renderPrefix(param);
      this.renderSkin(param.useskin ? param.useskin : "commentlink");
      renderSuffix(param);
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
      renderPrefix(param);
      this.filter();
      if (this.count() == 0) {
         res.write(this.count() + (param.no ? param.no : " threads"));
      } else if (this.count() == 1) {
         res.write(this.count() + (param.one ? param.one : " thread"));
      } else if (this.count() > 1) {
         res.write(this.count() + (param.more ? param.more : " threads"));
      }
      renderSuffix(param);
   }
}

/**
 * macro loops over comments and renders them
 */

function comments_macro(param) {
   if (this.weblog.hasDiscussions() && this.count()) {
      renderPrefix(param);
      for (var i=0;i<this.size();i++) {
         this.get(i).renderSkin("toplevel");
      }
      renderSuffix(param);
   }
}

/**
 * macro checks if user is logged in and not blocked
 * if true, render form to add a comment
 */

function commentform_macro(param) {
   if (this.weblog.hasDiscussions()) {
      renderPrefix(param);
      if (user.uid && !user.isBlocked()) {
         var c = new comment();
         c.renderSkin("edit");
      } else if (!user.isBlocked())
         res.write("<A HREF=\"" + this.weblog.members.href("login") + "\">Login to add your comment</A>");
      renderSuffix(param);
   }
}

/**
 * macro renders an image out of image-pool
 * either as plain image or as image-link
 * overrideable parameters: width,height,alttext,border
 * additional parameters: align, valign
 */

function image_macro(param) {
   if (param && param.name) {
      renderPrefix(param);
      this.weblog.renderImage(param);
      renderSuffix(param);
   }
}