/**
 * This function returns true if a skin was created or modified
 * lately, otherwise it returns false.
 * @return Boolean
 */

function isModified() {
   if (this && req.lastModified) {
      // checking for both createtime and modifytime since
      // modifytime was not set in previous versions:
      if (this.createtime && !this.modifytime || req.lastModified > this.modifytime)
         return(false);
   }
   return(true);
}
