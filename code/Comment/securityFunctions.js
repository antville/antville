/**
 * check if user is allowed to edit a comment
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isEditDenied(usr) {
   if (this.author != usr && !this.weblog.isUserAdmin(usr))
      return ("Sorry, you're not allowed to edit a posting of somebody else!");
   else if (!this.weblog.hasDiscussions())
      return ("Sorry, discussions were disabled for this weblog!");
   return null;
}
