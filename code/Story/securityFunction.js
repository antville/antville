/**
 * check if user is allowed to edit this story
 */

function checkPermissions() {
   if (this.author != user || user.isBlocked()) {
      res.message = "Sorry, you're not allowed to edit this story!";
      res.redirect(this.weblog.href());
   }
}