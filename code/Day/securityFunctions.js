/**
 * permission check (called by hopobject.onRequest())
 * @param String name of action
 * @param Obj User object
 * @param Int Membership level
 * @return Obj Exception object or null
 */
function checkAccess(action, usr, level) {
   if (!path.Site.online)
      checkIfLoggedIn();
   try {
      path.Site.checkView(usr, level);
   } catch (deny) {
      res.message = deny.toString();
      res.redirect(root.href());
   }
   return;
}