/**
 * check if user is allowed to edit images
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */

function isDenied(usr,level) {
   if (!this._parent.usercontrib && (level & MAY_ADD_IMAGE) == 0)
      return "imageAddDenied";
   return null;
}
