/**
 * function checks if image fits to the minimal needs
 * @param Obj Object containing the properties needed for creating a new image
 * @param Obj User-Object creating this image
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */
function evalImg(param, creator) {
   if (param.uploadError) {
      // looks like the file uploaded has exceeded uploadLimit ...
      throw new Exception("imageFileTooBig");
   } else if (!param.rawimage || param.rawimage.contentLength == 0) {
      // looks like nothing was uploaded ...
      throw new Exception("imageNoUpload");
   } else if (param.rawimage && (!param.rawimage.contentType || !evalImgType(param.rawimage.contentType))) {
      // whatever the user has uploaded wasn't recognized as an image
      throw new Exception("imageNoImage");
   }
   var filesize = Math.round(param.rawimage.contentLength / 1024);
   if (this._parent.getDiskUsage() + filesize > this._parent.getDiskQuota()) {
      // disk quota has already been exceeded
      throw new Exception("siteQuotaExceeded");
   }

   var newImg = new image(creator);
   // if no alias given try to determine it
   if (!param.alias)
      newImg.alias = buildAliasFromFile(param.rawimage, this);
   else {
      if (!param.alias.isFileName())
         throw new Exception("noSpecialChars");
      newImg.alias = buildAlias(param.alias, this);
   }
   // check name of topic (if specified)
   var topicName = null;
   if (param.topic) {
      if (!param.topic.isURL())
         throw new Exception("topicNoSpecialChars");
      topicName = param.topic;
   } else if (param.addToTopic)
      topicName = param.addToTopic;
   newImg.topic = topicName;
   // store properties necessary for saving image on disk
   newImg.filename = newImg.alias;
   // check if user wants to resize image
   var maxWidth = param.maxwidth ? parseInt(param.maxwidth, 10) : null;
   var maxHeight = param.maxheight ? parseInt(param.maxheight, 10) : null;
   // save/resize the image
   var dir = this._parent.getStaticDir("images");
   newImg.save(param.rawimage, dir, maxWidth, maxHeight);
   // the fullsize-image is on disk, so we add the image-object (and create the thumbnail-image too)
   newImg.alttext = param.alttext;
   if (!this.add(newImg))
      throw new Exception("imageAdd");
   // the fullsize-image is stored, so we check if a thumbnail should be created too
   if (newImg.width > THUMBNAILWIDTH)
      newImg.createThumbnail(param.rawimage, dir);
   // send e-mail notification
   if (newImg.site && newImg.site.isNotificationEnabled())
      newImg.site.sendNotification("upload", newImg);
   newImg.site.diskusage += newImg.filesize;
   var result = new Message("imageCreate", newImg.alias);
   result.url = newImg.href();
   return result;
}

/**
 * delete an image
 * @param Obj Image-Object to delete
 * @return String Message indicating success or failure
 */
function deleteImage(imgObj) {
   // first remove the image from disk (and the thumbnail, if existing)
   var dir = imgObj.site ? imgObj.site.getStaticDir("images") : imgObj.layout.getStaticDir();
   var f = File.get(dir, imgObj.filename + "." + imgObj.fileext);
   f.remove();
   if (imgObj.thumbnail) {
      var thumb = imgObj.thumbnail;
      f = File.get(dir, thumb.filename + "." + thumb.fileext);
      f.remove();
      thumb.remove();
   }
   imgObj.site.diskusage -= imgObj.filesize;
   // then, remove the image-object
   imgObj.remove();
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
