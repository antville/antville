/**
 * wrapper to make safejs.skin public
 * (contains js code safe from the user)
 */

function safescripts_action() {
   res.digest();
   res.contentType = "text/javascript";
   var param = new Object();
   // this is needed to enable sites with virtual domain hosting
   // using the colorpicker to circumvent domain-based script security:
   param.cpHost = path.site ? path.site.href() : root.href();
   root.renderSkin("safescripts", param);
   return;
}


/**
 * wrapper to access colorpicker
 */

function colorpicker_action() {
   renderSkin("colorpicker");
   return;
}


/**
 * redirect requests for rss10 to rss
 */

function rss10_action() {
   res.redirect(this.href("rss"));
   return;
}
