/**
 * display the images of the parent layout
 */
function parentimages_action() {
   if (!this._parent.parent) {
      res.message = new Exception("layoutNoParent");
      res.redirect(this.href());
   }
   res.data.imagelist = renderList(this._parent.parent.images, "preview", 10, req.data.page);
   res.data.pagenavigation = renderPageNavigation(this._parent.parent.images, this.href(req.action), 10, req.data.page);
   res.data.title = "Images of layout '" + this._parent.parent.title + "'";
   res.data.body = this.renderSkinAsString("main");
   res.handlers.context.renderSkin("page");
}
