/**
 * edit action
 */
function edit_action() {
   if (req.data.cancel)
      res.redirect(this.site.files.href());
   else if (req.data.save) {
      res.message = this.evalFile(req.data, session.user);
      res.redirect(this._parent.href());
   }
   
   res.data.action = this.href(req.action);
   res.data.title = "Edit file: " + this.alias;
   res.data.body = this.renderSkinAsString("edit");
   this.site.renderSkin("page");
}

/**
 * delete action
 */
function delete_action() {
   if (req.data.cancel)
      res.redirect(this.site.files.href());
   else if (req.data.remove) {
      try {
         var url = this._parent.href();
         res.message = this.site.files.deleteFile(this);
         res.redirect(url);
      } catch (err) {
         res.message = err.toString();
      }
   }
   
   res.data.action = this.href(req.action);
   res.data.title = "Delete file: " + this.alias;
   var sp = new Object();
   sp.what = "the file &quot;" + this.alias + "&quot;";
   res.data.body = this.renderSkinAsString("delete", sp);
   this.site.renderSkin("page");
}