/**
 * check if user is allowed to edit the preferences of this weblog
 */

function isEditAllowed() {
   if (!user.uid) {
      user.cache.referer = this.href("edit");
      return false;
   } else if (user.isBlocked()) {
      res.message = "Sorry, your account was disabled!";
      return false;
   } else if (this.owner != user) {
      res.message ="You're not allowed to edit a foreign weblog!";
      return false;
    }
    return true;
}

/**
 * check if user is allowed to add a story to this weblog
 */

function isAddAllowed() {
   if (!user.uid) {
      user.cache.referer = this.href("edit");
      return false;
   } else if (user.isBlocked()) {
      res.message = "Sorry, your account was disabled!";
      return false;
   } else if (this.owner != user) {
      res.message ="You're not allowed to add a story to a foreign weblog!";
      return false;
    }
    return true;
}
