/**
 * check if user is allowed to edit images
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isDenied(usr) {
   if (!this._parent.userMayContrib()) {
      var membership = this._parent.isUserMember(usr);
      if (!membership)
         return (getMsg("error","userNoMember"));
      else if ((membership.level & MAY_ADD_IMAGE) == 0)
         return (getMsg("error","imageAddDenied"));
   }
   return null;
}
