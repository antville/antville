/**
 * function checks if goodie fits to the minimal needs
 * @param Obj Object containing the properties needed for creating a new goodie
 * @param Obj User-Object creating this goodie
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */

function evalGoodie(param,creator) {
   var result = new Object();
   result.error = true;

   if (param.uploadError) {
      // looks like the file uploaded has exceeded uploadLimit ...
      result.message = "File is too big to handle!";
   } else if (param.rawgoodie) {
      if (param.rawgoodie.contentLength == 0) {
         // looks like nothing was uploaded ...
         result.message = "Please upload a goodie and fill out the form ...";
      } else {
         var newGoodie = new goodie();
         // store extension of uploaded goodie in variable
         if (param.rawgoodie.name.lastIndexOf(".") > 0)
            var fileExt = param.rawgoodie.name.substring(param.rawgoodie.name.lastIndexOf("."));
         // first, check if alias already exists
         if (!param.alias)
            result.message = "You must enter a name for this goodie!";
         else if (this.get(param.alias))
            result.message = "There is already a goodie with this name!";
         else if (!isClean(param.alias))
            result.message = "Please do not use special characters in the name!";
         else if (!fileExt)
            result.message = "The file has no valid extension!";
         else {
            // store properties necessary for goodie-creation
            newGoodie.alias = param.alias;
            newGoodie.alttext = param.alttext;
            newGoodie.file = param.alias + fileExt;
            newGoodie.filesize = param.rawgoodie.contentLength;
            newGoodie.mimetype = param.rawgoodie.contentType;
            newGoodie.description = param.description;
            var saveTo = getProperty("goodiePath") + this._parent.alias + "/";
            // any errors?
            if (param.rawgoodie.writeToFile(saveTo,newGoodie.file)) {
               // the goodie is on disk, so we add the goodie-object
               newGoodie.creator = creator;
               newGoodie.createtime = new Date();
               if (this.add(newGoodie)) {
                  result.message = "The goodie " + newGoodie.alias + " was added successfully!";
                  result.error = false;
               } else
                  result.message = "Ooops! Adding the goodie " + newGoodie.alias + " failed!";
            } else
               result.message = "Couldn't store the file on disk!";
         }
      }
   }
   return (result);
}


/**
 * alias of goodie has changed, so we remove it and add it again with it's new alias
 * @param Obj goodie-object whose alias should be changed
 * @param String new alias of goodie
 * @return Boolean true in any case ...
 */

function changeAlias(currGoodie,newAlias) {
   this.remove(currGoodie);
   this.set(currGoodie.alias,null);
   currGoodie.alias = newAlias.alias;
   this.add(currGoodie);
   return true;
}

/**
 * delete a goodie
 * @param Obj goodie-object to delete
 * @return String Message indicating success or failure
 */

function deleteGoodie(currGoodie) {
   // first remove the goodie from disk
   var f = new File(getProperty("goodiePath") + currGoodie.weblog.alias, currGoodie.file);
   f.remove();
   if (this.remove(currGoodie))
      return ("The goodie was deleted successfully!");
   else
      return ("Ooops! Couldn't delete the goodie!");
}