/**
 * check if user is allowed to edit this story
 */

function checkPermissions() {
   if (this.creator != user || user.isBlocked()) {
      res.message = "Sorry, you're not allowed to edit this image!";
      res.redirect(this.weblog.href());
   }
}