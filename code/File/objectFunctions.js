/**
 * function checks if new property-values for a file are correct
 * @param Obj Object containing form-values
 * @param Obj User-Object modifying file
 * @return Obj Object containing two properties:
 *             - error (boolean): false
 *             - message (String): containing a message to user
 */

function evalFile(param,modifier) {
   this.description = param.description;
   this.modifier = modifier;
   this.modifytime = new Date();
   return (getConfirm("update"));
}
