/**
 * check if user is allowed to edit the memberlist of this weblog
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isEditMembersDenied(usr) {
   var membership = this.get(usr.name);
   if (!membership || (membership.level & MAY_EDIT_MEMBERS) == 0)
      return ("You're not allowed to edit memberships!");
   return null;
}

