/**
 * check if user is allowed to edit this file
 */

function isEditDenied(usr) {
   if (this.creator != usr) {
      var membership = this.site.isUserMember(usr);
      if (!membership)
         return (getMsg("error","userNoMember"));
      else if ((membership.level & MAY_EDIT_ANYFILE) == 0)
         return (getMsg("error","fileEditDenied"));
   }
   return null;
}
