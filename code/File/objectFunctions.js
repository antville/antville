/**
 * save goodie as file on local disk
 */

function saveGoodie(rawgoodie) {
   if (rawgoodie && !rawgoodie.contentType) {
      // whatever the user has uploaded, we won't accept it ;-)
      this.cache.error = true; 
      res.message = "What was that?"; 
   } else {
      rawgoodie.writeToFile(this.cache.saveTo,this.file);
   } 
   return; 
}


/** NOT IN USE!!!
 * function returns true if the mimetype of the goodie is acceptable
 * returns false if mimetype is unknown or now allowed

function evalGoodieType(ct) {
   if (ct.indexOf("audio") > -1)
      return true;
   return false;
}
*/

/**
 * function checks if new image-parameters are correct ...
 */

function evalGoodie() {
   if (req.data.alias) {
      if (req.data.alias != this.alias) {
         if (this.weblog.goodies.get(req.data.alias)) {
            // alias has changed, but is already existing
            res.message = "This name is already in use!";
            res.redirect(this.href("edit"));
         } else {
            this.weblog.goodies.changeAlias(this);
         }
      }
      this.description = req.data.description;
      res.message = "Changes saved successfully!";
      res.redirect(this.weblog.goodies.href());
   }
}


