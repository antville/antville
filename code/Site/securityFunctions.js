/**
 * permission check (called by hopobject.onRequest())
 * @param String name of action
 * @param Obj User object
 * @param Int Membership level
 * @return Obj Exception object or null
 */
function checkAccess(action, usr, level) {
   var url = this.members.href("login");
   try {
      switch (action) {
         case "main" :
            if (!this.online)
               checkIfLoggedIn();
            url = root.href();
            this.checkView(usr, level);
            break;
         case "edit" :
            checkIfLoggedIn();
            url = this.href();
            this.checkEdit(usr, level);
            break;
         case "delete" :
            checkIfLoggedIn();
            url = this.href();
            this.checkView(usr, level);
            break;
         case "getfile" :
            if (!this.online)
               checkIfLoggedIn();
            url = root.href();
            this.checkView(usr, level);
            break;
         case "mostread" :
            if (!this.online)
               checkIfLoggedIn();
            url = root.href();
            this.checkView(usr, level);
            break;
         case "referrers" :
            if (!this.online)
               checkIfLoggedIn();
            url = root.href();
            this.checkView(usr, level);
            break;
         case "search" :
            if (!this.online)
               checkIfLoggedIn();
            url = root.href();
            this.checkView(usr, level);
            break;
         case "subscribe" :
            checkIfLoggedIn();
            this.checkSubscribe(usr, level);
            break;
         case "unsubscribe" :
            checkIfLoggedIn();
            this.checkUnsubscribe(usr, level);
            break;
      }
   } catch (deny) {
      res.message = deny.toString();
      res.redirect(url);
   }
   return;
}


/**
 * check if a user is allowed to view a site
 * @param Obj Userobject
 * @param Int Permission-Level
 */
function checkView(usr, level) {
   if (!this.online) {
      // if not logged in or not logged in with sufficient permissions
      if (!usr || (level < CONTRIBUTOR && !usr.sysadmin))
         throw new DenyException("siteView");
   }
   return;
}


/**
 * check if user is allowed to edit the preferences of this site
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
function checkEdit(usr, level) {
   if (!usr.sysadmin && (level & MAY_EDIT_PREFS) == 0)
      throw new DenyException("siteEdit");
   return null;
}


/**
 * check if user is allowed to delete the site
 * (only SysAdmins or the creator of a site are allowed to delete it!)
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */
function checkDelete(usr) {
   if (!usr.sysadmin && usr != this.creator)
      throw new DenyException("siteDelete");
   return;
}


/**
 * function checks if user is allowed to sign up
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
function checkSubscribe(usr, level) {
   if (level != null)
      throw new Exception("subscriptionExist");
   else if (!this.online)
      throw new DenyException("siteView");
   return;
}


/**
 * check if user is allowed to unsubscribe
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */
function checkUnsubscribe(usr, level) {
   if (level == null)
      throw new Exception("subscriptionNoExist");
   else if (level == ADMIN) {
      // Admins are not allowed to remove a subscription
      throw new DenyException("unsubscribe");
   }
   return;
}
