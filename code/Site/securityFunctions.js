/**
 * check if site is online
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String String indicating that site is not public (or null if public)
 */

function isNotPublic(usr,level) {
   if (!this.online) {
      if (usr && usr.sysadmin)
         return null;
      else if (level != null)
         return null;
      return "siteNotPublic";
   }
   return null;

}

/**
 * check if user is allowed to edit the preferences of this site
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */

function isEditDenied(usr,level) {
   if (usr.sysadmin)
      return null;
   if ((level & MAY_EDIT_PREFS) == 0)
      return "siteEditDenied";
   return null;
}

/**
 * check if user is allowed to delete the site
 * (only SysAdmins or the creator of a site are allowed to delete it!)
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isDeleteDenied(usr) {
   if (!usr.sysadmin && usr != this.creator)
      return "siteDeleteDenied";
   return null;
}

/**
 * function checks if user is allowed to sign up
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */

function isSubscribeDenied(usr,level) {
   if (level != null)
      return "subscriptionExist";
   else if (!this.online)
      return "siteNotPublic";
   return null;
}

/**
 * check if user is allowed to unsubscribe
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isUnsubscribeDenied(usr,level) {
   if (level == null)
      return "subscriptionNoExist";
   else if (level > SUBSCRIBER)
      return "unsubscribeDenied";
   return null;
}

