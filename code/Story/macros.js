/**
 * macro rendering title of story
 */

function title_macro(param) {
   if (!this.title && !param.as)
      return;
   res.write(param.prefix);
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("title",param));
   else if (param.as == "link") {
      var linkParam = new Object();
      linkParam.linkto = "main";
      this.openLink(linkParam);
      if (this.title)
         res.write(this.title);
      else {
         // no title, so we show the first words of the story-text as link
         renderTextPreview(this.getText(),20);
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
         res.write(this.getText());
      else
         renderTextPreview(this.getText(),param.limit);
   }
   res.write(param.suffix);
}

/**
 * macro rendering online-status of story
 */

function online_macro(param) {
   res.write(param.prefix);
   if (param.as == "editor") {
      var options = new Array("no","just in topic","yes");
      res.write(simpleDropDownBox("online",options,this.online));
   } else {
      if (!this.isOnline())
         res.write("offline");
      else if (parseInt(this.online,10) < 2) {
         res.write("online in ");
         var linkParam = new Object();
         this.weblog.space.get(this.topic).openLink(linkParam);
         res.write(this.topic);
         this.closeLink();
      } else
         res.write("online in weblog");
   }
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
 * macro renders the name of the modifier
 */

function modifier_macro(param) {
   if (!this.modifier)
      return;
   res.write(param.prefix);
   if (param.as == "link" && this.modifier.url) {
      var linkParam = new Object();
      linkParam.to = this.modifier.url;
      this.openLink(linkParam);
      res.write(this.modifier.name);
      this.closeLink();
   } else
      res.write(this.modifier.name);
   res.write(param.suffix);
}

/**
 * macro renders the url of this story
 */

function url_macro(param) {
   res.write(param.prefix);
   res.write(this.href());
   res.write(param.prefix);
}

/**
 * macro rendering a link to edit
 * if user is allowed to edit
 */

function editlink_macro(param) {
   if (!this.isEditDenied(user)) {
      res.write(param.prefix);
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
 * macro rendering a link to delete
 * if user is author of this story
 */

function deletelink_macro(param) {
   if (!this.isDeleteDenied(user)) {
      res.write(param.prefix);
      var linkParam = new Object();
      linkParam.linkto = "delete";
      this.openLink(linkParam);
      if (param.image && this.weblog.images.get(param.image))
         this.weblog.renderImage(this.weblog.images.get(param.image),param);
      else
         res.write(param.text ? param.text : "delete");
      this.closeLink();
      res.write(param.suffix);
   }
}

/**
 * macro renders a link to
 * toggle the online-status of this story
 */

function onlinelink_macro(param) {
   if (!this.isEditDenied(user)) {
      res.write(param.prefix);
      var linkParam = new Object();
      linkParam.linkto = "edit";
      linkParam.urlparam = "?set=" + (this.isOnline() ? "offline" : "online");
      this.openLink(linkParam);
      if (param.image && this.weblog.images.get(param.image))
         this.weblog.renderImage(this.weblog.images.get(param.image),param);
      else
         res.write(this.isOnline() ? "set offline" : "set online");
      this.closeLink();
      res.write(param.suffix);
   }
}

/**
 * macro renders a link to the story
 */

function viewlink_macro(param) {
   if (this.isViewDenied(user))
      return;
   res.write(param.prefix);
   var linkParam = new Object();
   linkParam.linkto = "main";
   this.openLink(linkParam);
   if (param.image && this.weblog.images.get(param.image))
      this.weblog.renderImage(this.weblog.images.get(param.image),param);
   else
      res.write(param.text ? param.text : "view");
   this.closeLink();
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
 *          action to link to (default: main)
 */

function commentcounter_macro(param) {
   if (this.weblog.hasDiscussions()) {
      res.write(param.prefix);
      var linkParam = new Object();
      linkParam.linkto = (param.linkto ? param.linkto : "main");
      if (this.allcomments.count() == 0) {
         res.write(this.allcomments.count() + " " + (param.no ? param.no : " comments"));
      } else {
         this.openLink(linkParam);
         if (this.allcomments.count() == 1)
            res.write(this.allcomments.count() + " " + (param.one ? param.one : " comments"));
         else if (this.allcomments.count() > 1)
            res.write(this.allcomments.count() + " " + (param.more ? param.more : " comments"));
         this.closeLink();
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
         res.write("<a name=\"" + this.get(i)._id + "\"></a>");
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
   if (user.uid) {
      var c = new comment();
      c.renderSkin("edit");
   } else {
      var linkParam = new Object();
      linkParam.to = "login";
      this.weblog.members.openLink(linkParam);
      res.write (param.text ? param.text : "login to add your comment!");
      this.closeLink();
   }
   res.write(param.suffix);

}

/**
 * macro left for backwards-compatibility
 * calls global image_macro()
 */

function image_macro(param) {
   image_macro(param);
}

/**
 * macro left for backwards-compatibility
 * calls global image_macro()
 */

function thumbnail_macro(param) {
   thumbnail_macro(param);
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
      // ddParam.add(this.createDDOption("Admins",2,(this.editableby == 2 ? true : false)));
      ddParam.add(this.createDDOption("-----","",false));
      ddParam.add(this.createDDOption("Contributors",1,(this.editableby == 1 ? true : false)));
      ddParam.add(this.createDDOption("Members and Contributors",0,(this.editableby == 0 ? true : false)));
      this.chooser(ddParam);
      res.write(param.suffix);
   } else {
      if (this.editableby == 0)
         res.write("Members and Contributors of " + this.weblog.title);
      else if (this.editableby == 1)
         res.write("Contributors of " + this.weblog.title);
      else
         res.write("Admins of " + this.weblog.title);
   }
}
