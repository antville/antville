/**
 * macro rendering alias of image
 */

function alias_macro(param) {
   if (param.as == "editor")
      Html.input(this.createInputParam("alias", param));
   else
      res.write(this.alias);
}


/**
 * macro rendering alternate text of image
 */

function alttext_macro(param) {
   if (param.as == "editor")
      Html.textArea(this.createInputParam("alttext", param));
   else
      res.write(this.alttext);
}

/**
 * macro renders the width of the image
 */

function width_macro(param) {
   res.write(this.width);
}

/**
 * macro renders the height of the image
 */

function height_macro(param) {
   res.write(this.height);
}

/**
 * macro renders the url to this image
 */

function url_macro(param) {
   res.write(getProperty("imgUrl"));
   if (this.site)
       res.write(this.site.alias + "/");
   res.write(this.filename + "." + this.fileext);
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
      Html.openLink(this.href("edit"));
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
         this.checkEdit(session.user, req.data.memberlevel);
      } catch (deny) {
         return;
      }
      Html.openLink(this.href("delete"));
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
   if (param.what == "thumbnail" && this.thumbnail) {
      var url = this.href();
      img = this.thumbnail;
   }
   else
      var url = img.getStaticUrl();
   delete(param.what);
   param.src = img.getStaticUrl();
   Html.openLink(url);
   renderImage(img, param);
   Html.closeLink();
}


/**
 * macro renders the name of the topic this story belongs to
 * either as link or plain text
 */
function topic_macro(param) {
   if (!this.topic)
      return;
   if (param.as == "link") {
      Html.link(path.site.images.topics.href(this.topic), this.topic);
   } else
      res.write(this.topic);
}
