/**
 * function checks if user is allowed to view the storylist
 * of this weblog
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isDenied(usr) {
   var membership = this._parent.isUserMember(usr);
   if (!membership)
      return ("You're not a member of this weblog!");
   else if (!this._parent.userMayContrib() && (membership.level & MAY_ADD_STORY) == 0)
      return ("You're not allowed to do this!");
   return null;
}
