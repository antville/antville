/**
 * permission check (called by hopobject.onRequest())
 * @param String name of action
 * @param Obj User object
 * @param Int Membership level
 * @return Obj Exception object or null
 */
function checkAccess(action, usr, level) {
   var deny = null;
   var url = this._parent.href();
   switch (action) {
      case "main" :
         checkIfLoggedIn(this.href(req.action));
         deny = this.isDenied(usr, level);
         break;
      case "create" :
         if (!usr && req.data.save)
            rescueText(req.data);
         checkIfLoggedIn(this.href(req.action));
         deny = this.isDenied(usr, level);
         break;
   }
   if (deny != null)
      deny.redirectTo = url;
   return deny;
}

/**
 * function checks if user is allowed to access the storymanager
 * of this site
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */

function isDenied(usr, level) {
   if (!this._parent.preferences.getProperty("usercontrib") && (level & MAY_ADD_STORY) == 0)
      return new Exception("storyAddDenied");
   return null;
}
