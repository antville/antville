/**
 * function checks if user is allowed to view the
 * shortcut list of this site
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */

function isDenied(usr,level) {
   if (!this._parent.usercontrib && !level)
      return "shortcutEditDenied";
   return null;
}
