/**
 * main action
 */
function main_action() {
   res.data.title = getMessage("Image.viewTitle", {imageAlias: this.alias});
   res.data.body = this.renderSkinAsString("main");
   res.handlers.context.renderSkin("page");
   return;
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
   res.data.title = getMessage("Image.editTitle", {imageAlias: this.alias});
   res.data.body = this.renderSkinAsString("edit");
   res.handlers.context.renderSkin("page");
   return;
}


/**
 * delete action
 */
function delete_action() {
   if (req.data.cancel)
      res.redirect(path.ImageMgr.href());
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
   res.data.title = getMessage("Image.deleteTitle", {imageAlias: this.alias});
   var skinParam = {
      description: getMessage("Image.deleteDescription"),
      detail: this.alias
   };
   res.data.body = this.renderSkinAsString("delete", skinParam);
   res.handlers.context.renderSkin("page");
   return;
}
