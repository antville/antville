/**
 * function checks if user is allowed to edit her/his profile
 */

function checkPermissions() {
   if (!user.uid) {
      res.message = "Please login before editing your profile!";
      user.cache.referer = this.href("edit");
      res.redirect(this.href("login"));
   }
}
