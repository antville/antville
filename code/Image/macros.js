/**
 * macro rendering alias of image
 */
function alias_macro(param) {
   if (param.as == "editor")
      Html.input(this.createInputParam("alias", param));
   else
      res.write(this.alias);
   return;
}

/**
 * macro rendering alternate text of image
 */
function alttext_macro(param) {
   if (param.as == "editor")
      Html.textArea(this.createInputParam("alttext", param));
   else
      res.write(this.alttext);
   return;
}

/**
 * macro renders the width of the image
 */
function width_macro(param) {
   res.write(this.width);
   return;
}

/**
 * macro renders the height of the image
 */
function height_macro(param) {
   res.write(this.height);
   return;
}

/**
 * macro renders the url to this image
 */
function url_macro(param) {
   res.write(this.getUrl());
   return;
}

/**
 * render a link to image-edit
 */
function editlink_macro(param) {
   if (session.user) {
      try {
         this.checkEdit(session.user, req.data.memberlevel);
      } catch (deny) {
         return;
      }
      Html.openLink({href: this.href("edit")});
      if (param.image && this.site.images.get(param.image))
         this.site.renderImage(this.site.images.get(param.image), param);
      else
         res.write(param.text ? param.text : "edit");
      Html.closeLink();
   }
   return;
}

/**
 * render a link to delete action
 */
function deletelink_macro(param) {
   if (session.user) {
      try {
         this.checkDelete(session.user, req.data.memberlevel);
      } catch (deny) {
         return;
      }
      Html.openLink({href: this.href("delete")});
      if (param.image && this.site.images.get(param.image))
         this.site.renderImage(this.site.images.get(param.image), param);
      else
         res.write(param.text ? param.text : "delete");
      Html.closeLink();
   }
   return;
}

/**
 * render the image-tag (link to main action if image
 * is a thumbnail)
 */
function show_macro(param) {
   var img = this;
   // if we have a thumbnail, display that
   if (param.as == "thumbnail" && this.thumbnail) {
      var url = this.href();
      img = this.thumbnail;
   } else
      var url = img.getUrl();
   delete(param.what);
   param.src = img.getUrl();
   Html.openLink({href: url});
   renderImage(img, param);
   Html.closeLink();
   return;
}

/**
 * macro renders the name of the gallery this image belongs to
 */
function gallery_macro(param) {
   if (!this.topic)
      return;
   if (!param.as || param.as == "text")
      res.write(this.topic);
   else if (param.as == "link") {
      var text = param.text ? param.text : this.topic;
      Html.link({href: path.site.images.topics.href(this.topic)}, text);
   } else if (param.as == "image") {
      if (!param.imgprefix)
         param.imgprefix = "topic_";
      var img = getPoolObj(param.imgprefix + this.topic, "images");
      if (!img)
         return;
      Html.openLink({href: path.site.topics.href(this.topic)});
      renderImage(img.obj, param)
      Html.closeLink();
   }
   return;
}

/**
 * render the code for embedding this image
 */
function code_macro(param) {
   res.write("&lt;% ");
   res.write(this instanceof layoutimage ? "layout.image" : "image");
   res.write(" name=\"" + this.alias + "\" %&gt;");
   return;
}
