/**
 * function checks if new property-values for a file are correct
 * @param Obj Object containing form-values
 * @param Obj User-Object modifying file
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */

function evalFile(param,modifier) {
   var result;
   if (param.alias) {
      if (param.alias != this.alias) {
         if (this.site.files.get(param.alias)) {
            // alias has changed, but is already existing
            result = getError("nameInUse");
         } else
            this.site.files.changeAlias(this,param.alias);
      }
      this.description = param.description;
      this.modifier = modifier;
      this.modifytime = new Date();
      result = getConfirm("update");
   } else
      result = getError("fileNameMissing");
   return (result);
}
