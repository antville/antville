/**
 * check if user is allowed to edit images
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isDenied(usr) {
   if (!this._parent.usercontrib && (req.data.memberlevel & MAY_ADD_IMAGE) == 0)
      return "imageAddDenied";
   return null;
}
