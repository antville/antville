/**
 * function checks if goodie fits to the minimal needs
 * @param Obj Object containing the properties needed for creating a new goodie
 * @param Obj User-Object creating this goodie
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */

function evalGoodie(param,creator) {
   var result;
   if (param.uploadError) {
      // looks like the file uploaded has exceeded uploadLimit ...
      result = getError("goodieFileTooBig");
   } else if (param.rawgoodie) {
      if (param.rawgoodie.contentLength == 0) {
         // looks like nothing was uploaded ...
         result = getError("goodieNoUpload");
      } else {
         var newGoodie = new goodie();
         // store extension of uploaded goodie in variable
         if (param.rawgoodie.name.lastIndexOf(".") > 0)
            var fileExt = param.rawgoodie.name.substring(param.rawgoodie.name.lastIndexOf("."));
         // first, check if alias already exists
         if (!param.alias)
            result = getError("goodieNameMissing");
         else if (this.get(param.alias))
            result = getError("goodieExisting");
         else if (!isClean(param.alias))
            result = getError("noSpecialChars");
         else if (!fileExt)
            result = getError("fileInvalidExtension");
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
                  result = getConfirm("goodieCreate",newGoodie.alias);
               } else
                  result = getError("goodieCreate",newGoodie.alias);
            } else
               result = getError("fileSave");
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
      return (getMsg("confirm","goodieDelete"));
   else
      return (getMsg("error","goodieDelete"));
}

/**
 * function deletes all goodies
 */

function deleteAll() {
   for (var i=this.size();i>0;i--) {
      var goodie = this.get(i-1);
      this.deleteGoodie(goodie);
   }
   return true;
}