/**
 * render additional navigation if the parent of a layout
 * also contains images
 */
function navigation_macro(param) {
   if (!this._parent.parent || !this._parent.parent.images.size())
      return;
   this.renderSkin(param.skin ? param.skin : "navigation");
}
