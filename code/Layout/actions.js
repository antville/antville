/**
 * main action
 */
function main_action() {
   res.data.title = "Layout '" + this.title + "'";
   res.data.body = this.renderSkinAsString("main");
   res.handlers.context.renderSkin("page");
}

/**
 * edit action
 */
function edit_action() {
   if (req.data.cancel)
      res.redirect(this.href());
   else if (req.data.save) {
      try {
         res.message = this.evalLayout(req.data, session.user);
         res.redirect(this._parent.href());
      } catch (err) {
         res.message = err.toString();
      }
   }

   res.data.action = this.href(req.action);
   res.data.title = "Edit layout: " + this.title;
   res.data.body = this.renderSkinAsString("edit");
   res.handlers.context.renderSkin("page");
}

/**
 * action to test-drive this layout in the current session.
 */
function startTestdrive_action() {
   session.data.layout = this;
   if (req.data.http_referer)
      res.redirect(req.data.http_referer);
   else
      res.redirect(res.handlers.context.href());
}

/**
 * stop a layout test and resume normal browsing.
 */
function stopTestdrive_action() {
   session.data.layout = null;
   res.message = new Message("layoutStopTestdrive");
   if (req.data.http_referer)
      res.redirect(req.data.http_referer);
   else
      res.redirect(res.handlers.context.href());
}

/**
 * action deletes this layout
 */
function delete_action() {
   if (req.data.cancel)
      res.redirect(this._parent.href());
   else if (req.data.remove) {
      var href = this._parent.href();
      try {
         res.message = this._parent.deleteLayout(this);
         res.redirect(href);
      } catch (err) {
         res.message = err.toString();
         res.redirect(href);
      }
   }

   res.data.action = this.href(req.action);
   res.data.title = res.handlers.context.getTitle();
   var skinParam = {what: "the layout '" + this.title +
                    "' (created by " + this.creator.name + ")"};
   res.data.body = this.renderSkinAsString("delete", skinParam);
   res.handlers.context.renderSkin("page");
}

/**
 * create a .zip file containing the whole layout (including
 * skins, images and properties)
 */
function download_action() {
   if (this.parent) {
      res.message = new DenyException("layoutExport", this.title);
      res.redirect(this.href());
   }
   try {
      // create the zip file
      var z = new Zip();
      // first, dump the layout and add it to the zip file
      this.dumpToZip(z);
      // next, loop over all images and add their metadata
      // into the directory "imagedata" in the zip file
      this.images.dumpToZip(z);
      // third, add the whole directory containing the image
      // files to the zip file
      z.add(this.getStaticDir(), 9, "images");
      // fourth, loop over all skins and add them to
      // the zip archive too
      this.skins.dumpToZip(z);

      // finally, write the zip file directly to response
      var data = z.close();
      res.contentType = "application/x-zip";
      res.writeBinary(data);
   } catch (err) {
      throw err;
      return;
      res.message = new Exception("layoutExport", this.title);
      res.redirect(this.href());
   }
   return;
}
