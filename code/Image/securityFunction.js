/**
 * check if user is allowed to edit this image
 */

function isEditDenied(usr) {
   if (this.creator != usr) {
      var membership = this.site.isUserMember(usr);
      if (!membership)
         return (getMsg("error","userNoMember"));
      else if ((membership.level & MAY_EDIT_ANYIMAGE) == 0)
         return (getMsg("error","imageEditDenied"));
   }
   return null;
}