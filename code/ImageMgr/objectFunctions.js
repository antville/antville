/**
 * function checks if image fits to the minimal needs
 * @param Obj Object containing the properties needed for creating a new image
 * @param Obj User-Object creating this image
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */

function evalImg(param, creator) {
   var newImg = new image(this._parent, creator);
   if (param.uploadError) {
      // looks like the file uploaded has exceeded uploadLimit ...
      throw new Exception("imageFileTooBig");
   } else if (!param.rawimage || param.rawimage.contentLength == 0) {
      // looks like nothing was uploaded ...
      throw new Exception("imageNoUpload");
   } else if (param.rawimage && (!param.rawimage.contentType || !newImg.evalImgType(param.rawimage.contentType))) {
      // whatever the user has uploaded wasn't recognized as an image
      throw new Exception("imageNoImage");
   }
   // if no alias given try to determine it
   if (!param.alias)
      newImg.alias = buildAliasFromFile(param.rawimage, this);
   else {
      if (!param.alias.isFileName())
         throw new Exception("noSpecialChars");
      newImg.alias = buildAlias(param.alias, this);
   }
   // store properties necessary for saving image on disk
   newImg.filename = newImg.alias;
   // check if user wants to resize image
   var maxWidth = param.maxwidth ? parseInt(param.maxwidth, 10) : null;
   var maxHeight = param.maxheight ? parseInt(param.maxheight, 10) : null;
   // save/resize the image
   var dir = getProperty("imgPath") + this._parent.alias + "/";
   newImg.save(param.rawimage, dir, maxWidth, maxHeight);
   // the fullsize-image is on disk, so we add the image-object (and create the thumbnail-image too)
   newImg.alttext = param.alttext;
   if (!this.add(newImg))
      throw new Exception("imageAdd");
   // the fullsize-image is stored, so we check if a thumbnail should be created too
   if (newImg.width > THUMBNAILWIDTH)
      newImg.createThumbnail(param.rawimage, dir);
   return new Message("imageCreate", newImg.alias);
}

/**
 * delete an image
 * @param Obj Image-Object to delete
 * @return String Message indicating success or failure
 */
function deleteImage(currImg) {
   // first remove the image from disk (and the thumbnail, if existing)
   var f = FileLib.get(getProperty("imgPath") + currImg.site.alias, currImg.filename + "." + currImg.fileext);
   f.remove();
   if (currImg.thumbnail) {
      var thumb = currImg.thumbnail;
      f = FileLib.get(getProperty("imgPath") + thumb.site.alias, thumb.filename + "." + thumb.fileext);
      f.remove();
      thumb.parent = null;
      if (!this.remove(thumb))
         throw new Exception("imageDelete");
   }
   // then, remove the image-object
   if (!this.remove(currImg))
      throw new Exception("imageDelete");
   return new Message("imageDelete");
}

/**
 * function deletes all images
 */
function deleteAll() {
   for (var i=this.size();i>0;i--)
      this.deleteImage(this.get(i-1));
   return true;
}
