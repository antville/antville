/**
 * function checks if user is allowed to view the
 * shortcut list of this site
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isDenied(usr) {
   if (!this._parent.userMayContrib()) {
      var membership = this._parent.isUserMember(usr);
      if (!membership)
         return (getMsg("error","userNoMember"));
   }
   return null;
}
