/**
 * function checks if user is allowed to view the storylist
 * of this site
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isDenied(usr) {
   if (!this._parent.userMayContrib()) {
      var membership = this._parent.isUserMember(usr);
      if (!membership)
         return (getMsg("error","userNoMember"));
      else if ((membership.level & MAY_ADD_STORY) == 0)
         return (getMsg("error","pollAddDenied"));
   }
   return null;
}
