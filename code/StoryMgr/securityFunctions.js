/**
 * function checks if user is allowed to view the storylist
 * of this site
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isDenied(usr) {
   if (!this._parent.usercontrib && (req.data.memberlevel & MAY_ADD_STORY) == 0)
      return "storyAddDenied";
   return null;
}
