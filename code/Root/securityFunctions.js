/**
 * permission check (called by hopobject.onRequest())
 * @param String name of action
 * @param Obj User object
 * @param Int Membership level
 * @return Obj Exception object or null
 */
function checkAccess(action, usr, level) {
   var deny = null;
   switch (action) {
      case "new" :
         checkIfLoggedIn(this.href("new"));
         deny = this.isAddSiteDenied(usr, level);
         break;
   }
   if (deny != null)
      deny.redirectTo = this.href();
   return deny;
}

/**
 * function checks if user is allowed to create a new weblog
 * @param Obj User-Object
 */
function isAddSiteDenied(usr) {
   // sysAdmins aren't restricted
   if (session.user.sysadmin)
      return null;

   switch (root.sys_limitNewSites) {
      case 2:
         if (!usr.sysadmin)
            return new Exception("siteCreateOnlyAdmins");
      case 1:
         if (!usr.trusted)
            return new Exception("siteCreateNotAllowed");
      default:
         if (root.sys_minMemberAge) {
            // check if user has been a registered member for long enough
            var regTime = Math.floor((new Date() - session.user.registered)/86400000);
            if (regTime < root.sys_minMemberAge)
               return new Exception("siteCreateMinMemberAge", [regTime, root.sys_minMemberAge]);
         } else if (root.sys_minMemberSince) {
            // check if user has registered before the defined timestamp
            if (session.user.registered > root.sys_minMemberSince)
               return new Exception("siteCreateMinMemberSince", formatTimestamp(root.sys_minMemberSince));
         }
         if (usr.sites.count()) {
            // check if user has to wait some more time before creating a new weblog
            var lastCreation = Math.floor((new Date() - usr.sites.get(0).createtime)/86400000);
            if (lastCreation < root.sys_waitAfterNewSite)
               return new Exception("siteCreateWait", [root.sys_waitAfterNewSite, root.sys_waitAfterNewSite - lastCreation]);
         }
   }
   return null;
}