/**
 * wrapper to make safejs.skin public
 * (contains js code safe from the user)
 */

function safejs_action() {
   if (req.lastModified)
      res.notModified();
   else {
      res.contentType = "text/javascript";
      res.lastModified = new Date();
      renderSkin("safejs");
   }
}
