/**
 * function checks if file fits to the minimal needs
 * @param Obj Object containing the properties needed for creating a new file
 * @param Obj User-Object creating this file
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */

function evalFile(param,creator) {
   var result;
   if (param.uploadError) {
      // looks like the file uploaded has exceeded uploadLimit ...
      result = getError("fileFileTooBig");
   } else if (param.rawfile) {
      if (param.rawfile.contentLength == 0) {
         // looks like nothing was uploaded ...
         result = getError("fileNoUpload");
      } else {
         var newFile = new file();
         // store extension of uploaded file in variable
         if (param.rawfile.name.lastIndexOf(".") > 0)
            var fileExt = param.rawfile.name.substring(param.rawfile.name.lastIndexOf("."));
         // first, check if alias already exists
         if (!param.alias)
            result = getError("fileNameMissing");
         else if (this.get(param.alias))
            result = getError("fileExisting");
         else if (!isClean(param.alias))
            result = getError("noSpecialChars");
         else if (!fileExt)
            result = getError("fileInvalidExtension");
         else {
            // store properties necessary for file-creation
            newFile.alias = param.alias;
            newFile.site = this._parent;
            newFile.alttext = param.alttext;
            newFile.name = param.alias + fileExt;
            newFile.filesize = param.rawfile.contentLength;
            newFile.mimetype = param.rawfile.contentType;
            newFile.description = param.description;
            var saveTo = getProperty("filePath") + this._parent.alias + "/";
            // any errors?
            if (param.rawfile.writeToFile(saveTo,newFile.name)) {
               // the file is on disk, so we add the file-object
               newFile.creator = creator;
               newFile.createtime = new Date();
               if (this.add(newFile)) {
                  result = getConfirm("fileCreate",newFile.alias);
               } else
                  result = getError("fileCreate",newFile.alias);
            } else
               result = getError("fileSave");
         }
      }
   }
   return (result);
}


/**
 * alias of file has changed, so we remove it and add it again with it's new alias
 * @param Obj file-object whose alias should be changed
 * @param String new alias of file
 * @return Boolean true in any case ...
 */

function changeAlias(currFile,newAlias) {
   this.remove(currFile);
   this.set(currFile.alias,null);
   currFile.alias = newAlias.alias;
   this.add(currFile);
   return true;
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
      return (getMsg("confirm","fileDelete"));
   else
      return (getMsg("error","fileDelete"));
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