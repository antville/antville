/**
 * function checks if file fits to the minimal needs
 * @param Obj Object containing the properties needed for creating a new file
 * @param Obj User-Object creating this file
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */
function evalFile(param, creator) {
   if (param.uploadError) {
      // looks like the file uploaded has exceeded uploadLimit ...
      throw new Exception("fileFileTooBig");
   }
   if (!param.rawfile || param.rawfile.contentLength == 0) {
      // looks like nothing was uploaded ...
      throw new Exception("fileNoUpload");
   }
   var newFile = new file(creator);
   // if no alias given try to determine it
   if (!param.alias)
      newFile.alias = buildAliasFromFile(param.rawfile, this);
   else {
      if (!param.alias.isFileName())
         throw new Exception("noSpecialChars");
      newFile.alias = buildAlias(param.alias, this);
   }
   // store properties necessary for file-creation
   newFile.alttext = param.alttext;
   newFile.name = newFile.alias;
   newFile.filesize = param.rawfile.contentLength;
   newFile.mimetype = param.rawfile.contentType;
   newFile.description = param.description;
   var dir = this._parent.getStaticPath("files");
   newFile.name = param.rawfile.writeToFile(dir, newFile.name);
   if (!newFile.name)
      throw new Exception("fileSave");
   // the file is on disk, so we add the file-object
   if (!this.add(newFile))
      throw new Exception("fileCreate", newFile.alias);
   // send e-mail notification
   if (newFile.site.isNotificationEnabled())
      newFile.site.sendNotification("upload", newFile);
   return new Message("fileCreate", newFile.alias);
}


/**
 * delete a file
 * @param Obj file-object to delete
 * @return String Message indicating success or failure
 */

function deleteFile(fileObj) {
   // first remove the file from disk
   var f = File.get(this._parent.getStaticPath("files"), fileObj.name);
   f.remove();
   if (!this.remove(fileObj))
      throw new Exception("fileDelete");
   return new Message("fileDelete");
}

/**
 * function deletes all files
 */

function deleteAll() {
   for (var i=this.size();i>0;i--)
      this.deleteFile(this.get(i-1));
   return true;
}
