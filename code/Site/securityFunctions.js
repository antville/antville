/**
 * check if weblog is online
 * @param Obj Userobject
 * @return String String indicating that weblog is not public (or null if public)
 */

function isNotPublic(usr) {
   if (!this.isOnline() && !this.isUserMember(usr))
      return("This weblog is not public!");
   return null;
}

/**
 * check if user is allowed to edit the preferences of this weblog
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isEditDenied(usr) {
   if (!usr.uid) {
      usr.cache.referer = this.href("edit");
      return ("Please login to edit the preferences of this weblog!");
   } else if (usr.isBlocked())
      return ("Sorry, your account was disabled!");
   else if (!this.isUserAdmin(usr))
      return ("You're not allowed to edit the preferences!");
   return null;
}

/**
 * check if user is allowed to edit the memberlist of this weblog
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isEditMembersDenied(usr) {
   if (!usr.uid) {
      usr.cache.referer = this.href("memberships");
      return ("Please login before!");
   } else if (usr.isBlocked())
      return ("Sorry, your account was disabled!");
   else if (!this.isUserAdmin(usr))
      return ("You're not allowed to edit memberships!");
   return null;
}

/**
 * function checks if the user is admin of this weblog
 * @param Obj Userobject
 * @return Boolean true if user is admin, false if not
 */

function isUserAdmin(usr) {
   if (!this.isUserMember(usr))
      return false;
   else if (!this.members.get(usr.name).isAdmin())
      return false;
   return true;
}

/**
 * function checks if user is a member of this weblog
 * @param Obj Userobject
 * @return Boolean true if user is contributor, false if not
 */

function isUserContributor(usr) {
   if (usr.uid && this.userMayContrib())
      return true;
   else if (this.isUserMember(usr) && this.members.get(usr.name).isContributor())
      return true;
   return false;
}

/**
 * function checks if user is a member of this weblog
 * @param Obj Userobject
 * @return Boolean true if user is member, false if not
 */

function isUserMember(usr) {
   if (!usr.uid || !this.members.get(usr.name))
      return false;
   return true;
}

/**
 * function checks if user is allowed to sign up
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isSignUpDenied(usr) {
   if (this.isUserMember(usr))
      return ("You are already a member of this weblog!");
   else if (!this.isOnline())
      return ("This weblog is not public!");
   else if (!this.userMaySignup())
      return ("Signing up was disabled!");
   else if (!usr.uid) {
      usr.cache.referer = this.href("signup");
      return ("Please login before!");
   } else if (usr.isBlocked())
      return ("Sorry, your account was disabled!");
   return null;
}


/**
 * function checks if normal users are allowed to
 * contrib to this weblog
 * @return Boolean true if members may contribute, false if not
 */

function userMayContrib() {
   if (parseInt(this.usercontrib,10))
      return true;
   return false;
}


/**
 * function checks if archive of weblog is enabled
 * @return Boolean true if archive is enabled, false if not
 */

function showArchive() {
   if (parseInt(this.archive))
      return true;
   return false;
}
