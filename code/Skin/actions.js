/**
 * delete action
 */
function delete_action() {
   if (req.data.cancel)
      res.redirect(this.layout.skins.href());
   else if (req.data.remove) {
      try {
         res.message = this.layout.skins.deleteSkin(this);
         res.redirect(this.layout.skins.href() + "#" + this.proto + this.name);
      } catch (err) {
         res.message = err.toString();
      }
   }

   res.data.action = this.href(req.action);
   res.data.title = res.handlers.context.getTitle();
   var sp = new Object();
   sp.what = "the skin &quot;" + this.name + "&quot; (created by " + this.creator.name + ")";
   res.data.body = this.renderSkinAsString("delete", sp);
   res.handlers.context.renderSkin("page");
}
