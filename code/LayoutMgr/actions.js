/**
 * main action
 */
function main_action() {
   if (req.data["activate"]) {
      this.setDefaultLayout(req.data["activate"]);
      res.redirect(this.href());
   }
   res.data.title = getMessage("LayoutMgr.mainTitle", {siteTitle: res.handlers.context.getTitle()});
   res.data.action = this.href();
   res.data.layoutlist = renderList(this, "mgrlistitem", 10, req.data.page);
   res.data.pagenavigation = renderPageNavigation(this, this.href(), 10, req.data.page);
   res.data.body = this.renderSkinAsString("main");
   res.handlers.context.renderSkin("page");
   return;
}

/**
 * choose a new root layout
 */
function create_action() {
   if (req.data.cancel)
      res.redirect(this.href());
   else if (req.data.create) {
      try {
         var result = this.evalNewLayout(req.data, session.user);
         res.message = result.toString();
         res.redirect(result.obj.href("edit"));
      } catch (err) {
         res.message = err.toString();
      }
   }

   // render a list of root layouts that are shareable
   res.data.layoutlist = renderList(root.layouts.shareable, "chooserlistitem", 5, req.data.page);
   res.data.pagenavigation = renderPageNavigation(root.layouts.shareable, this.href(req.action), 5, req.data.page);

   res.data.title = getMessage("LayoutMgr.createTitle", {siteTitle: res.handlers.context.getTitle()});
   res.data.action = this.href(req.action);
   res.data.body = this.renderSkinAsString("new");
   res.handlers.context.renderSkin("page");
   return;
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
   // render a list of root layouts that are shareable
   res.data.layoutlist = renderList(root.layouts.shareable, "chooserlistitem", 5, req.data.page);
   res.data.pagenavigation = renderPageNavigation(root.layouts.shareable, this.href(req.action), 5, req.data.page);

   res.data.title = getMessage("LayoutMgr.importTitle", {siteTitle: res.handlers.context.getTitle()});
   res.data.action = this.href(req.action);
   res.data.body = this.renderSkinAsString("import");
   res.handlers.context.renderSkin("page");
   return;
}
