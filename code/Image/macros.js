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
 * macro rendering filesize
 */
function filesize_macro(param) {
   res.write((this.filesize / 1024).format("###,###") + " KB");
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
         renderImage(this.site.images.get(param.image), param);
      else
         res.write(param.text ? param.text : getMessage("generic.edit"));
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
         renderImage(this.site.images.get(param.image), param);
      else
         res.write(param.text ? param.text : getMessage("generic.delete"));
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
   delete param.what;
   delete param.as;
   param.src = img.getUrl();
   Html.openLink({href: url});
   renderImage(img, param);
   Html.closeLink();
   return;
}

/**
 * render the code for embedding this image
 */
function code_macro(param) {
   res.write("&lt;% ");
   res.write(this instanceof LayoutImage ? "layout.image" : "image");
   res.write(" name=\"" + this.alias + "\" %&gt;");
   return;
}

/**
 * render a link to delete action
 * calls image.deletelink_macro, but only
 * if the layout in path is the one this image
 * belongs to
 */
function replacelink_macro(param) {
   if (this.layout && path.Layout != this.layout) {
      if (session.user) {
         try {
            path.Layout.images.checkAdd(session.user, req.data.memberlevel);
         } catch (deny) {
            return;
         }
         Html.openLink({href: path.Layout.images.href("create") + "?alias=" + this.alias});
         if (param.image && this.site.images.get(param.image))
            renderImage(this.site.images.get(param.image), param);
         else
            res.write(param.text ? param.text : getMessage("generic.replace"));
         Html.closeLink();
      }
      return;
   }
   return;
}
