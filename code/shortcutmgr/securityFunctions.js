/**
 * function checks if user is allowed to view the
 * shortcut list of this site
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isDenied(usr) {
   if (!this._parent.usercontrib && !req.data.memberlevel)
      return "shortcutEditDenied";
   return null;
}
