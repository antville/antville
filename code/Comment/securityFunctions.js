/**
 * check if user is allowed to post a comment to this story   
 * @param Obj Userobject   
 * @return String Reason for denial (or null if allowed)   
 */   
 
function isPostDenied(usr) {
   if (usr.isSysAdmin())
      return null;
   if (!this.site.isOnline() && !this.site.isUserMember(usr))
      return (getMsg("error","siteNotPublic"));
   return null;   
}   
    
/**
 * check if user is allowed to edit a comment
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isEditDenied(usr) {
   if (this.creator != usr) {
      var membership = this.site.isUserMember(usr);
      if (!membership || (membership.level & MAY_EDIT_ANYCOMMENT) == 0)
         return (getMsg("error","commentEditDenied"));
   }
   return null;
}
