/**
 * function checks if user is allowed to access the storymanager
 * of this site
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */

function isDenied(usr,level) {
   if (!this._parent.usercontrib && (level & MAY_ADD_STORY) == 0)
      return "storyAddDenied";
   return null;
}
