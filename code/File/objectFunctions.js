/**
 * function checks if new property-values for goodie are correct
 * @param Obj Object containing form-values
 * @param Obj User-Object modifying goodie
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */

function evalGoodie(param,modifier) {
   var result = new Object();
   if (param.alias) {
      if (param.alias != this.alias) {
         if (this.weblog.goodies.get(param.alias)) {
            // alias has changed, but is already existing
            result.message = "This name is already in use!";
            result.error = true;
         } else
            this.weblog.goodies.changeAlias(this,param.alias);
      }
      this.description = param.description;
      this.modifier = modifier;
      this.modifytime = new Date();
      result.message = "Changes saved successfully!";
      result.error = false;
   } else {
      result.message = "You must specify a name for this goodie!";
      result.error = true;
   }
   return (result);
}
