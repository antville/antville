/**
 * delete action
 */
function delete_action() {
   if (req.data.cancel)
      res.redirect(this.site.skins.href());
   else if (req.data.remove) {
      try {
         res.message = this.site.skins.deleteSkin(this);
         res.redirect(this.site.skins.href());
      } catch (err) {
         res.message = err.toString();
      }
   }
   
   res.data.action = this.href(req.action);
   res.data.title = this.site.title;
   var sp = new Object();
   sp.what = "the skin &quot;" + this.name + "&quot; (created by " + this.creator.name + ")";
   res.data.body = this.renderSkinAsString("delete", sp);
   this.site.renderSkin("page");
}