/**
 * permission check (called by hopobject.onRequest())
 * @param String name of action
 * @param Obj User object
 * @param Int Membership level
 * @return Obj Exception object or null
 */
function checkAccess(action, usr, level) {
   var deny = path.site.isAccessDenied(usr, level);
   if (deny)
      deny.redirectTo = path.site.members.href("login");
   return null;
}