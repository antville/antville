/**
 * main action simply redirects to "view" url
 */
function main_action() {
   res.redirect(this.site.href("getfile") + "?name=" + this.alias);
   return;
}


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
   res.data.title = getMessage("Asset.editTitle", {fileAlias: this.alias});
   res.data.body = this.renderSkinAsString("edit");
   this.site.renderSkin("page");
   return;
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
   res.data.title = getMessage("Asset.deleteTitle", {fileAlias: this.alias});
   var skinParam = {
      description: getMessage("Asset.deleteDescription"),
      detail: this.alias
   };
   res.data.body = this.renderSkinAsString("delete", skinParam);
   this.site.renderSkin("page");
   return;
}
