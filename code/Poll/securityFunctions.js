/**
 * permission check (called by hopobject.onRequest())
 * @param String name of action
 * @param Obj User object
 * @param Int Membership level
 * @return Obj Exception object or null
 */
function checkAccess(action, usr, level) {
   try {
      switch (action) {
         case "edit" :
            checkIfLoggedIn();
            this.checkEdit(usr, level);
            break;
         case "delete" :
            checkIfLoggedIn();
            this.checkDelete(usr, level);
            break;
         case "results" :
            this.site.checkView(usr, level);
            break;
         case "toggle" :
            checkIfLoggedIn();
            this.checkDelete(usr, level);
            break;
      }
   } catch (deny) {
      res.message = deny.toString();
      res.redirect(this.site.polls.href());
   }
   return;
}

/**
 * check if user is allowed to vote in a poll
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
function checkVote(usr, level) {
   this.site.checkView(usr, level);
   if (this.closed)
      throw new DenyException("pollClosed");
   return;
}


/**
 * check if user is allowed to edit a poll
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
function checkEdit(usr, level) {
   if (this.votes.size() > 0)
      throw new DenyException("pollEdit");
   if (this.creator != usr && (level & MAY_EDIT_ANYSTORY) == 0)
      throw new DenyException("pollEdit");
   return;
}


/**
 * check if user is allowed to delete a poll
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
function checkDelete(usr, level) {
   if (this.creator != usr && (level & MAY_DELETE_ANYSTORY) == 0)
      throw new DenyException("pollDelete");
   return;
}