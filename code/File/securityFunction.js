/**
 * check if user is allowed to edit this goodie
 */

function isEditDenied(usr) {
   if (this.creator != usr) {
      var membership = this.weblog.isUserMember(usr);
      if (!membership)
         return ("You're not a member of this weblog!");
      else if ((membership.level & MAY_EDIT_ANYGOODIE) == 0)
         return ("You're not allowed to do this!");
   }
   return null;
}
