/**
 * check if user is allowed to edit images
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isDenied(usr) {
   if (!this._parent.userMayContrib()) {
      var membership = this._parent.isUserMember(usr);
      if (!membership)
         return ("You need to be a member of this weblog to do this!");
      else if ((membership.level & MAY_ADD_IMAGE) == 0)
         return ("You're not allowed to do this!");
   }
   return null;
}
