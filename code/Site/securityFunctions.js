/**
 * check if weblog is online
 * return false if not
 */

function isNotPublic() {
   if (!this.isOnline() && !this.isUserMember())
      return("This weblog is not public!");
   return null;
}

/**
 * check if user is allowed to edit the preferences of this weblog
 */

function isEditDenied() {
   if (!user.uid) {
      user.cache.referer = this.href("edit");
      return ("Please login to edit the preferences of this weblog!");
   } else if (user.isBlocked())
      return ("Sorry, your account was disabled!");
   else if (!this.isUserAdmin())
      return ("You're not allowed to edit the preferences!");
   return null;
}

/**
 * check if user is allowed to edit the memberlist of this weblog
 */

function isEditMembersDenied() {
   if (!user.uid) {
      user.cache.referer = this.href("memberships");
      return ("Please login before!");
   } else if (user.isBlocked())
      return ("Sorry, your account was disabled!");
   else if (!this.isUserAdmin())
      return ("You're not allowed to edit memberships!");
   return null;
}

/**
 * function checks if the user is admin of this weblog
 */

function isUserAdmin() {
   if (!this.isUserMember())
      return false;
   else if (!this.members.get(user.name).isAdmin())
      return false;
   return true;
}

/**
 * function checks if user is a member of this weblog
 */

function isUserContributor() {
   if (user.uid && this.userMayContrib())
      return true;
   else if (this.isUserMember() && this.members.get(user.name).isContributor())
      return true;
   return false;
}

/**
 * function checks if user is a member of this weblog
 */

function isUserMember() {
   if (!user.uid || !this.members.get(user.name))
      return false;
   return true;
}

/**
 * function checks if user is allowed to sign up
 */

function isSignUpDenied() {
   if (this.isUserMember())
      return ("You are already a member of this weblog!");
   else if (!this.isOnline())
      return ("This weblog is not public!");
   else if (!this.userMaySignup())
      return ("Signing up was disabled!");
   else if (!user.uid) {
      user.cache.referer = this.href("signup");
      return ("Please login before!");
   } else if (user.isBlocked())
      return ("Sorry, your account was disabled!");
   return null;
}


/**
 * function checks if normal users are allowed to
 * contrib to this weblog
 */

function userMayContrib() {
   if (parseInt(this.usercontrib))
      return true;
   return false;
}


/**
 * function checks if archive of weblog is enabled
 */

function showArchive() {
   if (parseInt(this.archive))
      return true;
   return false;
}