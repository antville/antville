/**
 * wrapper to access colorpicker
 */

function colorpicker_action() {
   this.renderSkin("colorpicker");
}


/**
 * wrapper to make style.skin public
 */

function stylesheet_action() {
   res.contentType = "text/css";
   this.renderSkin("style");
}


/**
 * wrapper to make javascript.skin public
 */

function javascript_action() {
   res.contentType = "text/javascript";
   this.renderSkin("javascript");
}
