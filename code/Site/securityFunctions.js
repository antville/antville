/**
 * check if site is online
 * @param Obj Userobject
 * @return String String indicating that site is not public (or null if public)
 */

function isNotPublic(usr) {
   if (!this.isOnline()) {
      if (usr && usr.isSysAdmin())
         return null;
      else if (usr && this.isUserMember(usr))
         return null;
      return (getMsg("error","siteNotPublic"));
   }
   return null;

}

/**
 * check if user is allowed to edit the preferences of this site
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isEditDenied(usr) {
   if (usr.isSysAdmin())
      return null;
   var membership = this.isUserMember(usr);
   if (!membership || (membership.level & MAY_EDIT_PREFS) == 0)
      return (getMsg("error","siteEditDenied"));
   return null;
}

/**
 * check if user is allowed to delete the site
 * (only SysAdmins or the creator of a site are allowed to delete it!)
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isDeleteDenied(usr) {
   if (!usr.isSysAdmin() && usr != this.creator)
      return (getMsg("error","siteDeleteDenied"));
   return null;
}

/**
 * function checks if user is a member of this site
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
      return (getMsg("error","subscriptionExist"));
   else if (!this.isOnline())
      return (getMsg("error","siteNotPublic"));
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
      return (getMsg("error","subscriptionNoExist"));
   else if (membership.level > 0)
      return (getMsg("error","unsubscribeDenied",getRole(membership.level)));
   return null;
}

/**
 * function checks if normal users are allowed to
 * contribute to this site
 * @return Boolean true if members may contribute, false if not
 */

function userMayContrib() {
   if (parseInt(this.usercontrib,10))
      return true;
   return false;
}


/**
 * function checks if archive of site is enabled
 * @return Boolean true if archive is enabled, false if not
 */

function showArchive() {
   if (parseInt(this.archive))
      return true;
   return false;
}

/**
 * function checks if site is blocked
 * @return Boolean true if site is blocked, otherwise false
 */

function isBlocked() {
   if (parseInt(this.blocked))
      return true;
   return false;
}