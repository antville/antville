/**
 * check if user is allowed to post a comment to this story   
 * @param Obj Userobject   
 * @return String Reason for denial (or null if allowed)   
 */   
 
function isPostDenied(usr) {
   if (usr.sysadmin)
      return null;
   if (!this.site.online && !req.data.memberlevel)
      return "siteNotPublic";
   return null;   
}   
    
/**
 * check if user is allowed to edit a comment
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isEditDenied(usr) {
   if (this.creator != usr && (req.data.memberlevel & MAY_EDIT_ANYCOMMENT) == 0)
      return "commentEditDenied";
   return null;
}
