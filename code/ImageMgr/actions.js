/**
 * main action
 */
function main_action() {
   this.renderImagelist(parseInt(req.data.start, 10));
   res.data.title = "Images of " + res.handlers.context.title;
   res.data.body = this.renderSkinAsString("main");
   this._parent.renderSkin("page");
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
         res.message = this.evalImg(req.data, session.user);
         res.redirect(this.href());
      } catch (err) {
         res.message = err.toString();
      }
   }
   
   res.data.action = this.href(req.action);
   res.data.title = "Add an image to " + this._parent.title;
   res.data.body = this.renderSkinAsString("new");
   this._parent.renderSkin("page");
}
