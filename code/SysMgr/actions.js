/**
 * wrapper to make style.skin public
 */

function stylesheet_action() {
   res.dependsOn(app.skinfiles["sysmgr"]["stylesheet"]);
   res.digest();
   res.contentType = "text/css";
   this.renderSkin("style");
   return;
}
