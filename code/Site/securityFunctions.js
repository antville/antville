/**
 * permission check (called by hopobject.onRequest())
 * @param String name of action
 * @param Obj User object
 * @param Int Membership level
 * @return Obj Exception object or null
 */
function checkAccess(action, usr, level) {
   var deny = null;
   var url = this.members.href("login");
   switch (action) {
      case "main" :
         deny = this.isAccessDenied(usr, level);
         break;
      case "edit" :
         checkIfLoggedIn();
         deny = this.isEditDenied(usr, level);
         url = this.href();
         break;
      case "permissions" :
         checkIfLoggedIn();
         deny = this.isEditDenied(usr, level);
         url = this.href();
         break;
      case "delete" :
         checkIfLoggedIn();
         deny = this.isAccessDenied(usr, level);
         url = this.href();
         break;
      case "getfile" :
         deny = this.isAccessDenied(usr, level);
         break;
      case "mostread" :
         deny = this.isAccessDenied(usr, level);
         break;
      case "referrers" :
         deny = this.isAccessDenied(usr, level);
         break;
      case "search" :
         deny = this.isAccessDenied(usr, level);
         break;
      case "subscribe" :
         checkIfLoggedIn();
         deny = this.isSubscribeDenied(usr, level);
         break;
      case "unsubscribe" :
         checkIfLoggedIn();
         deny = this.isUnsubscribeDenied(usr, level);
         app.log("level: " + deny);
         break;
   }
   if (deny != null)
      deny.redirectTo = url;
   return deny;
}


/**
 * check if a user is allowed to access a site
 * @param Obj Userobject
 * @param Int Permission-Level
 */
function isAccessDenied(usr, level) {
   if (!this.online) {
      // if not logged in or not logged in with sufficient permissions
      if (!usr || (level < CONTRIBUTOR && !usr.sysadmin))
         return new Exception("siteAccessDenied");
   }
   return null;
}


/**
 * check if user is allowed to edit the preferences of this site
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
function isEditDenied(usr, level) {
   if (usr.sysadmin)
      return null;
   if ((level & MAY_EDIT_PREFS) == 0)
      return new Exception("siteEditDenied");
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
      return new Exception("siteDeleteDenied");
   return null;
}


/**
 * function checks if user is allowed to sign up
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
function isSubscribeDenied(usr, level) {
   if (level != null)
      return new Exception("subscriptionExist");
   else if (!this.online)
      return new Exception("siteAccessDenied");
   return null;
}


/**
 * check if user is allowed to unsubscribe
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */
function isUnsubscribeDenied(usr, level) {
   if (level == null)
      return new Exception("subscriptionNoExist");
   else if (level == ADMIN) {
      // Admins are not allowed to remove a subscription
      return new Exception("unsubscribeDenied");
   }
   return null ;
}
