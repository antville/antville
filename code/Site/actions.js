/**
 * wrapper to make style.skin public
 */

function stylesheet_action() {
   res.dependsOn(this.modifytime);
   res.dependsOn(app.skinfiles["site"]["stylesheet"]);
   res.digest();
   res.contentType = "text/css";
   this.renderSkin("style");
   return;
}


/**
 * wrapper to make javascript.skin public
 */

function javascript_action() {
   res.dependsOn(this.modifytime);
   res.dependsOn(app.skinfiles["site"]["javascript"]);
   res.digest();
   res.contentType = "text/javascript";
   this.renderSkin("javascript");
   return;
}


/**
 * redirect requests for rss092 to rss
 */

function rss092_action() {
   this.rss_action();
}


/**
 * redirect requests for rss10 to rss
 */

function rss10_action() {
   this.rss_action();
}
