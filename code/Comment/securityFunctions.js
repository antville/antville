/**
 * check if user is allowed to edit a comment
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isEditDenied(usr) {
   if (this.author != usr) {
      var membership = this.weblog.isUserMember(usr);
      if (!membership || (membership.level & MAY_EDIT_ANYCOMMENT) == 0)
         return ("Sorry, you're not allowed to edit a posting of somebody else!");
   }
   return null;
}
