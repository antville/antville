/**
 * render a link to image-edit
 * calls image.editlink_macro, but only
 * if the layout in path is the one this image
 * belongs to
 */
function editlink_macro(param) {
   if (path.layout == this.layout)
      image.prototype.editlink_macro.apply(this, [param]);
   return;
}


/**
 * render a link to delete action
 * calls image.deletelink_macro, but only
 * if the layout in path is the one this image
 * belongs to
 */
function deletelink_macro(param) {
   if (path.layout == this.layout)
      image.prototype.deletelink_macro.apply(this, [param]);
   return;
}

/**
 * render a link to delete action
 * calls image.deletelink_macro, but only
 * if the layout in path is the one this image
 * belongs to
 */
function replacelink_macro(param) {
   if (path.layout != this.layout) {
      if (session.user) {
         try {
            path.layout.images.checkAdd(session.user, req.data.memberlevel);
         } catch (deny) {
            return;
         }
         Html.openLink({href: path.layout.images.href("create") + "?alias=" + this.alias});
         if (param.image && this.site.images.get(param.image))
            this.site.renderImage(this.site.images.get(param.image), param);
         else
            res.write(param.text ? param.text : getMessage("manage.replace"));
         Html.closeLink();
      }
      return;
   }
   return;
}
