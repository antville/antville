/**
 * check if user is allowed to edit a layout image
 * (overwrites image.checkEdit())
 * @see image/securityFunctions.js
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return Obj Exception or null (if allowed)
 */
function checkEdit(usr, level) {
   this.layout.images.checkAdd(usr, level);
   return;
}

/**
 * check if user is allowed to delete an image
 * (overwrites image.checkEdit())
 * @see image/securityFunctions.js
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return Obj Exception or null (if allowed)
 */
function checkDelete(usr, level) {
   this.layout.images.checkAdd(usr, level);
   return;
}