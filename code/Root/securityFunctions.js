/**
 * permission check (called by hopobject.onRequest())
 * @param String name of action
 * @param Obj User object
 * @param Int Membership level
 * @return Obj Exception object or null
 */
function checkAccess(action, usr, level) {
   try {
      switch (action) {
         case "new" :
            checkIfLoggedIn(this.href("new"));
            this.checkAdd(usr, level);
            break;
      }
   } catch (deny) {
      res.message = deny.toString();
      res.redirect(this.href());
   }
   return;
}

/**
 * function checks if user is allowed to create a new site
 * @param Obj User-Object
 */
function checkAdd(usr) {
   // sysAdmins aren't restricted
   if (session.user.sysadmin)
      return null;

   switch (root.sys_limitNewSites) {
      case 2:
         if (!usr.sysadmin)
            throw new DenyException("siteCreateOnlyAdmins");
      case 1:
         if (!usr.trusted)
            throw new DenyException("siteCreateNotAllowed");
      default:
         if (root.sys_minMemberAge) {
            // check if user has been a registered member for long enough
            var regTime = Math.floor((new Date() - session.user.registered)/ONEDAY);
            if (regTime < root.sys_minMemberAge)
               throw new DenyException("siteCreateMinMemberAge", [regTime, root.sys_minMemberAge]);
         } else if (root.sys_minMemberSince) {
            // check if user has registered before the defined timestamp
            if (session.user.registered > root.sys_minMemberSince)
               throw new DenyException("siteCreateMinMemberSince", formatTimestamp(root.sys_minMemberSince));
         }
         if (usr.sites.count()) {
            // check if user has to wait some more time before creating a new site
            var lastCreation = Math.floor((new Date() - usr.sites.get(0).createtime)/ONEDAY);
            if (lastCreation < root.sys_waitAfterNewSite)
               throw new DenyException("siteCreateWait", [root.sys_waitAfterNewSite, root.sys_waitAfterNewSite - lastCreation]);
         }
   }
   return;
}
