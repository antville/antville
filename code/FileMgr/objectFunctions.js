/**
 * function checks if file fits to the minimal needs
 * @param Obj Object containing the properties needed for creating a new file
 * @param Obj User-Object creating this file
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */

function evalFile(param,creator) {
   if (param.uploadError) {
      // looks like the file uploaded has exceeded uploadLimit ...
      return (getError("fileFileTooBig"));
   } else if (param.rawfile) {
      if (param.rawfile.contentLength == 0) {
         // looks like nothing was uploaded ...
         return (getError("fileNoUpload"));
      } else {
         var newFile = new file();
         // if no alias given try to determine it
         if (!param.alias)
            param.alias = buildAliasFromFile(param.rawfile);
         else if (!isCleanForName(param.alias))
            return (getError("noSpecialChars"));
         // check if alias is already in use
         if (this.get(param.alias)) {
            var nr = 1;
            while (this.get(param.alias + nr))
               nr++;
            param.alias = param.alias + nr;
         }
         // store properties necessary for file-creation
         newFile.alias = param.alias;
         newFile.site = this._parent;
         newFile.alttext = param.alttext;
         newFile.name = param.alias;
         newFile.filesize = param.rawfile.contentLength;
         newFile.mimetype = param.rawfile.contentType;
         newFile.description = param.description;
         var saveTo = getProperty("filePath") + this._parent.alias + "/";
         newFile.name = param.rawfile.writeToFile(saveTo,newFile.name);
         if (newFile.name) {
            // the file is on disk, so we add the file-object
            newFile.creator = creator;
            newFile.createtime = new Date();
            if (this.add(newFile)) {
               return (getConfirm("fileCreate",newFile.alias));
            } else
               return (getError("fileCreate",newFile.alias));
         } else
            return (getError("fileSave"));
      }
   }
}


/**
 * delete a file
 * @param Obj file-object to delete
 * @return String Message indicating success or failure
 */

function deleteFile(currFile) {
   // first remove the file from disk
   var f = new File(getProperty("filePath") + currFile.site.alias, currFile.name);
   f.remove();
   if (this.remove(currFile))
      return (getMessage("confirm","fileDelete"));
   else
      return (getMessage("error","fileDelete"));
}

/**
 * function deletes all files
 */

function deleteAll() {
   for (var i=this.size();i>0;i--) {
      var f = this.get(i-1);
      this.deleteFile(f);
   }
   return true;
}