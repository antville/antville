/**
 * display all images of a site or layout
 */
function main_action() {
   res.data.imagelist = renderList(this, "mgrlistitem", 10, req.data.page);
   res.data.pagenavigation = renderPageNavigation(this, this.href(), 10, req.data.page);
   res.data.title = "Images of " + this._parent.title;
   res.data.body = this.renderSkinAsString("main");
   res.handlers.context.renderSkin("page");
}

/**
 * display my images
 */
function myimages_action() {
   var ms = this._parent.members.get(session.user.name);
   res.data.imagelist = renderList(ms.images, "mgrlistitem", 10, req.data.page);
   res.data.pagenavigation = renderPageNavigation(ms.images, this.href(req.action), 10, req.data.page);
   res.data.title = "My images of " + this._parent.title;
   res.data.body = this.renderSkinAsString("main");
   res.handlers.context.renderSkin("page");
}

/**
 * action for creating new image objects
 */
function create_action() {
   if (req.data.cancel)
      res.redirect(this.href());
   else if (req.data.save) {
      // check if a url has been passed instead of a file upload. hw
      if ((!req.data.rawimage || req.data.rawimage.contentLength == 0) && req.data.url)
          req.data.rawimage = getURL(req.data.url);
      try {
         var result = this.evalImg(req.data, session.user);
         res.message = result.toString();
         session.data.referrer = null;
         res.redirect(result.url);
      } catch (err) {
         res.message = err.toString();
      }
   }

   res.data.action = this.href(req.action);
   res.data.title = "Add an image to " + this._parent.title;
   res.data.body = this.renderSkinAsString("new");
   res.handlers.context.renderSkin("page");
}
