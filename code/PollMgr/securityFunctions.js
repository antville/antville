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
         case "main" :
            checkIfLoggedIn(this.href(req.action));
            var url = this._parent.href();
            this.checkAdd(usr, level);
            break;
         case "open" :
            checkIfLoggedIn(this.href(req.action));
            var url = this._parent.href();
            this.checkAdd(usr, level);
            break;
         case "mypolls" :
            checkIfLoggedIn(this.href(req.action));
            var url = this._parent.href();
            this.checkAdd(usr, level);
            break;
         case "create" :
            checkIfLoggedIn();
            var url = this.href();
            this.checkAdd(usr, level);
            break;
      }
   } catch (deny) {
      res.message = deny.toString();
      res.redirect(url);
   }
   return;
}

/**
 * function checks if user is allowed to view the storylist
 * of this site
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
function checkAdd(usr, level) {
   if (!this._parent.preferences.getProperty("usercontrib") && (level & MAY_ADD_STORY) == 0)
      throw new DenyException("pollAdd");
   return;
}
