/**
 * main action
 */
function main_action() {
   res.data.title = "View image: " + this.alias;
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
      res.message = this.evalImg(req.data, session.user);
      res.redirect(this.href());
   }

   res.data.action = this.href(req.action);
   res.data.title = "Edit image: " + this.alias;
   res.data.body = this.renderSkinAsString("edit");
   res.handlers.context.renderSkin("page");
}


/**
 * delete action
 */
function delete_action() {
   if (req.data.cancel)
      res.redirect(path.imagemgr.href());
   else if (req.data.remove) {
      try {
         var url = this._parent.href();
         res.message = this._parent.deleteImage(this);
         res.redirect(url);
      } catch (err) {
         res.message = err.toString();
      }
   }

   res.data.action = this.href(req.action);
   res.data.title = "Delete image: " + this.alias;
   var sp = new Object();
   sp.what = "the image &quot;" + this.alias + "&quot;";
   res.data.body = this.renderSkinAsString("delete", sp);
   res.handlers.context.renderSkin("page");
}
