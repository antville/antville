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
   if (this.isDefaultLayout() || this.sharedBy.size() > 0) {
      res.message = new DenyException("layoutDelete");
      res.redirect(this._parent.href());
   }
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
 * download action
 */
function download_action() {
   if (req.data.cancel)
      res.redirect(this._parent.href());
   else if (req.data.full)
      res.redirect(this.href("download_full.zip"));
   else if (req.data.changesonly)
      res.redirect(this.href("download.zip"));
   
   res.data.action = this.href(req.action);
   res.data.title = "Download layout " + this.title;
   res.data.body = this.renderSkinAsString("download");
   res.handlers.context.renderSkin("page");
}


/**
 * create a Zip file containing the whole layout
 */
function download_full_zip_action() {
   try {
      var data = this.evalDownload(true);
      res.contentType = "application/zip";
      res.writeBinary(data);
   } catch (err) {
      res.message = new Exception("layoutDownload");
      res.redirect(this.href());
   }
   return;
}

/**
 * create a .zip file containing layout changes only
 */
function download_zip_action() {
   try {
      var data = this.evalDownload(false);
      res.contentType = "application/zip";
      res.writeBinary(data);
   } catch (err) {
      res.message = new Exception("layoutDownload");
      res.redirect(this.href());
   }
   return;
}
