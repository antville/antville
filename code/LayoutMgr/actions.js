/**
 * main action
 */
function main_action() {
   if (req.data["activate"]) {
      this.setDefaultLayout(req.data["activate"]);
      res.redirect(this.href());
   }
   res.data.title = "Layouts of " + res.handlers.context.getTitle();
   res.data.action = this.href();
   res.data.layoutlist = renderList(this, this.renderManagerView, 10, req.data.page);
   res.data.pagenavigation = renderPageNavigation(this, this.href(), 10, req.data.page);
   res.data.body = this.renderSkinAsString("main");
   res.handlers.context.renderSkin("page");
}

/**
 * choose a new root layout
 */
function choose_action() {
   if (req.data.cancel)
      res.redirect(this.href());
   else if (req.data.choose) {
      try {
         var result = this.chooseNewLayout(req.data, session.user);
         res.message = result.toString();
         res.redirect(this.href());
      } catch (err) {
         res.message = err.toString();
      }
   }

   // render a list of root layouts that are shareable
   res.data.layoutlist = renderList(root.layouts.shareable, "chooserlistitem", 10, req.data.page);
   res.data.pagenavigation = renderPageNavigation(root.layouts.shareable, this.href(req.action), 10, req.data.page);

   res.data.title = "Choose a new layout for " + res.handlers.context.getTitle();
   res.data.action = this.href(req.action);
   res.data.body = this.renderSkinAsString("choose");
   res.handlers.context.renderSkin("page");
}
