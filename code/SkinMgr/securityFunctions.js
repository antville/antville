/**
 * function checks if user is allowed to edit skins of this weblog
 */

function checkPermissions() {
   if (!user.uid) {
      res.message = "Please login before!";
      user.cache.referer = this.href();
      res.redirect(this.__parent__.members.href("login"));
   } else if (this.__parent__.owner != user) {
      res.message = "Sorry, you're not allowed to edit skins";
      res.redirect(this.href());
   }
}
