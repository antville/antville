/**
 * function checks if user is allowed to add/edit images of this weblog
 */

function checkPermissions() {
   if (!user.uid) {
      res.message = "Please login before!";
      user.cache.referer = this.href();
      res.redirect(this.__parent__.members.href("login"));
   } else if (this.__parent__.owner != user) {
      res.message = "Sorry, you're not allowed to edit images";
      res.redirect(this.href());
   }
}
