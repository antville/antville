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
   var membership = this.isUserMember(usr);
   if (!membership || (membership.level & MAY_EDIT_PREFS) == 0)
      return ("You're not allowed to edit the preferences!");
   return null;
}

/**
 * function checks if user is a member of this weblog
 * @param Obj Userobject
 * @return Obj null in case user is not a member, otherwise member-object
 */

function isUserMember(usr) {
   if (!usr)
      return null;
   return (this.members.get(usr.name));
}

/**
 * function checks if user is allowed to sign up
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isSubscribeDenied(usr) {
   if (this.isUserMember(usr))
      return ("You have already subscribed to this weblog!");
   else if (!this.isOnline())
      return ("This weblog is not public!");
   return null;
}

/**
 * check if user is allowed to unsubscribe
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isUnsubscribeDenied(usr) {
   var membership = this.isUserMember(usr);
   if (!membership)
      return ("You're not a subscriber of this weblog!");
   else if (membership.level > 0)
      return ("You cannot unsubscribe, because you are a " + getRole(membership.level) + "!");
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
