/**
 * wrapper to make safejs.skin public
 * (contains js code safe from the user)
 */

function safescripts_action() {
   if (req.lastModified)
      res.notModified();
   else {
      res.contentType = "text/javascript";
      res.lastModified = new Date();
      this.renderSkin("safescripts");
   }
}


/**
 * wrapper to access colorpicker
 */

function colorpicker_action() {
   renderSkin("colorpicker");
}
