/**
 * constructor function
 */
function constructor(creator) {
   this.requestcnt = 0;
   this.creator = creator;
   this.createtime = new Date();
}


/**
 * function checks if new property-values for a file are correct
 * @param Obj Object containing form-values
 * @param Obj User-Object modifying file
 * @return Obj Object containing two properties:
 *             - error (boolean): false
 *             - message (String): containing a message to user
 */
function evalFile(param, modifier) {
   this.description = param.description;
   this.modifier = modifier;
   this.modifytime = new Date();
   return new Message("update");
}

/**
 * return the url of the file
 */
function getUrl() {
   var buf = this.site.getStaticUrl("files/");
   buf.append(this.name);
   return buf.toString();
}
