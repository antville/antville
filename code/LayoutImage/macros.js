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
