/**
 * wrapper to make style.skin public
 */

function stylesheet_action() {
   var skin = this.skins.fetchSkin("site", "style");
   // we also check if the prefs have been changed, lately:
   if (skin.isModified() || req.data.lastModified < this.modifytime) {
      res.contentType = "text/css";
      res.lastModified = new Date();
      this.renderSkin("style");
   }
   else 
      res.notModified();
}


/**
 * wrapper to make javascript.skin public
 */

function javascript_action() {
   var skin = this.skins.fetchSkin("site", "javascript");
   if (skin.isModified()) {
      res.contentType = "text/javascript";
      res.lastModified = new Date();
      this.renderSkin("javascript");
   }
   else 
      res.notModified();
}
