/**
 * create a new layout
 */
function create_action() {
   if (req.data.cancel)
      res.redirect(this.href());
   else if (req.data.create) {
      try {
         var result = this.evalNewLayout(req.data, session.user);
         res.message = result.toString();
         res.redirect(this.href());
      } catch (err) {
         res.message = err.toString();
      }
   }

   res.data.title = "Create a new layout for " + res.handlers.context.getTitle();
   res.data.action = this.href(req.action);
   res.data.body = this.renderSkinAsString("new");
   res.handlers.context.renderSkin("page");
}


/**
 * import action
 */
function import_action() {
   if (req.data.cancel)
      res.redirect(this.href());
   else if (req.data["import"]) {
      try {
         var result = this.evalImport(req.data, session.user);
         res.message = result.toString();
         res.redirect(this.href());
      } catch (err) {
         res.message = err.toString();
      }
   }
   res.data.title = "Import a new layout to " + res.handlers.context.getTitle();
   res.data.action = this.href(req.action);
   res.data.body = this.renderSkinAsString("import");
   res.handlers.context.renderSkin("page");
}
