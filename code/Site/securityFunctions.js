/**
 * function checks if user is allowed to add a story to this weblog
 */

function checkPermissions() {
   if (!user.uid) {
      res.message = "Please login before editing a new story!";
      user.cache.referer = this.href("create");
      res.redirect(this.members.href("login"));
   } else if (this.owner != user) {
      res.message = "Sorry, you're not allowed to add a story!";
      res.redirect(this.href());
   }
}
