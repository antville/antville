/**
 * function checks if image fits to the minimal needs
 * @param Obj Object containing the properties needed for creating a new image
 * @param Obj User-Object creating this image
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */

function evalImg(param,creator) {
   var result;
   if (param.uploadError) {
      // looks like the file uploaded has exceeded uploadLimit ...
      result = getError("imageFileTooBig");
   } else if (param.rawimage) {
      var newImg = new image();
      if (param.rawimage.contentLength == 0) {
         // looks like nothing was uploaded ...
         result = getError("imageNoUpload");
      } else if (param.rawimage && (!param.rawimage.contentType || !newImg.evalImgType(param.rawimage.contentType))) {
         // whatever the user has uploaded wasn't recognized as an image
         result = getError("imageNoImage");
      } else {
         // if no alias given try to determine it
         if (!param.alias)
            param.alias = buildAliasFromFile(param.rawimage);
         else if (!isClean(param.alias))
            result = getError("noSpecialChars");

         // check if alias is already in use
         if (this.get(param.alias)) {
            var nr = 1;
            while (this.get(param.alias + nr))
               nr++;
            param.alias = param.alias + nr;
         }
         // store properties necessary for saving image on disk
         newImg.filename = param.alias;
         newImg.cache.saveTo = getProperty("imgPath") + this._parent.alias + "/";
         // check if user wants to resize width
         newImg.cache.maxwidth = param.maxwidth ? parseInt(param.maxwidth,10) : null;
         // check if user wants to resize height
         newImg.cache.maxheight = param.maxheight ? parseInt(param.maxheight,10) : null;
         // save/resize the image
         if (newImg.saveImg(param.rawimage)) {
            // the fullsize-image is on disk, so we add the image-object (and create the thumbnail-image too)
            // result.error = this.addImg(param,creator,newImg);
            newImg.alias = param.alias;
            newImg.site = this._parent;
            newImg.alttext = param.alttext;
            newImg.creator = creator;
            newImg.createtime = new Date();
            this.add(newImg);
            // the fullsize-image is stored, so we check if a thumbnail should be created too
            if (newImg.width > 100 || newImg.height > 100)
              newImg.createThumbnail(param.rawimage);
            newImg.clearCache();
            result = getConfirm("imageCreate",newImg.alias);
         } else
            result = getError("error");
      }
   } else
      result = getError("imageNoUpload");
   return (result);
}

/**
 * alias of image has changed, so we remove it and add it again with it's new alias
 * @param Obj Image-object to modify
 * @param String new alias for image
 * @return Boolean true in any case ...
 */

function changeAlias(currImg,newAlias) {
   currImg.setParent(this);
   this.remove(currImg);
   this.set(currImg.alias,null);
   currImg.alias = newAlias;
   this.add(currImg);
   // if thumbnail exists, we have to change this alias too
   if (currImg.thumbnail)
      currImg.thumbnail.alias = newAlias;
   return true;
}


/**
 * delete an image
 * @param Obj Image-Object to delete
 * @return String Message indicating success or failure
 */

function deleteImage(currImg) {
   // first remove the image from disk (and the thumbnail, if existing)
   var f = new File(getProperty("imgPath") + currImg.site.alias, currImg.filename + "." + currImg.fileext);
   f.remove();
   if (currImg.thumbnail) {
      var thumb = currImg.thumbnail;
      f = new File(getProperty("imgPath") + thumb.site.alias, thumb.filename + "." + thumb.fileext);
      f.remove();
      thumb.parent = null;
      this.remove(thumb);
   }
   // then, remove the image-object
   if (this.remove(currImg))
      return (getMessage("confirm","imageDelete"));
   else
      return (getMessage("error","imageDelete"));
}

/**
 * function deletes all images
 */

function deleteAll() {
   for (var i=this.size();i>0;i--) {
      var img = this.get(i-1);
      this.deleteImage(img);
   }
   return true;
}
