/**
 * function checks if user is allowed to create a new weblog
 * @param Obj User-Object
 */

function isAddSiteDenied(usr) {
   if (isUserSysAdmin())
      return null;
   if (root.sys_limitNewSites == 2)
      return (getError("siteCreateOnlyAdmins"));

   if (!isUserTrusted()) {
      if (root.sys_limitNewSites == 1)
         return (getError("siteCreateNotAllowed"));
      else if (!root.sys_limitNewSites) {
         if (root.sys_minMemberAge) {
            // check if user has been a registered member for long enough
            var regTime = Math.floor((new Date() - session.user.registered)/86400000);
            if (regTime < root.sys_minMemberAge)
               return (getError("siteCreateMinMemberAge",new Array(regTime,root.sys_minMemberAge)));
         } else if (root.sys_minMemberSince) {
            // check if user has registered before the defined timestamp
            if (session.user.registered > root.sys_minMemberSince)
               return (getError("siteCreateMinMemberSince",formatTimestamp(root.sys_minMemberSince)));
         }
         // check if user has to wait some more time before creating a new weblog
         if (usr.sites.count()) {
            var lastCreation = Math.floor((new Date() - usr.sites.get(0).createtime)/86400000);
            if (lastCreation < root.sys_waitAfterNewSite)
               return (getError("siteCreateWait",new Array(root.sys_waitAfterNewSite,root.sys_waitAfterNewSite - lastCreation)));
         }
      }
   }
   return null;
}