/**
 * wrapper to make style.skin public
 */

function stylesheet_action() {
   var skin = this.skins.fetchSkin("site", "style");
   if (skin.isModified()) {
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



/**
 * wrapper to make cp_javascript.skin public
 */

function cp_javascript_action() {
   var skin = this.skins.fetchSkin("site", "cp_javascript");
   if (skin.isModified()) {
      res.contentType = "text/javascript";
      res.lastModified = new Date();
      this.renderSkin("cp_javascript");
   }
   else 
      res.notModified();
}
