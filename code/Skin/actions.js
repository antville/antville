/**
 * delete action
 */
function delete_action() {
   if (req.data.cancel)
      res.redirect(path.skinset.href("skins"));
   else if (req.data.remove) {
      try {
         res.message = path.skinset.deleteSkin(this);
         res.redirect(path.skinset.href("skins"));
      } catch (err) {
         res.message = err.toString();
      }
   }
   
   res.data.action = this.href(req.action);
   res.data.title = path.skinset.getParent().title;
   var sp = new Object();
   sp.what = "the skin &quot;" + this.name + "&quot; (created by " + this.creator.name + ")";
   res.data.body = this.renderSkinAsString("delete", sp);
   path.skinmgr._parent.renderSkin("page");
}
