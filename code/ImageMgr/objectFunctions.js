/**
 * function checks if image fits to the minimal needs 
 */

function evalNewImg() {
   var newImg = new image();

   var rawimage = req.get("rawimage");
   if (req.get("uploadError")) {
      // looks like the file uploaded has exceeded uploadLimit ...
      res.message = "File too big to handle!";

   } else if (rawimage) {
      if (rawimage.contentLength == 0) {
         // looks like nothing was uploaded ...
         res.message = "Please upload an image and fill out the form ...";
      } else {
         // first, check if alias already exists
         if (!req.data.alias)
            res.message = "You must enter a name for this image!";
         else if (this.get(req.data.alias))
            res.message = "There is already an image with this name!";
         else if (!isClean(req.data.alias))
            res.message = "Please do not use special characters in the name!";
         else {
            // store properties necessary for image-creation
            newImg.filename = req.data.alias;
            newImg.cache.saveTo = getProperty("imgPath") + this._parent.alias + "/";
 
            // check if user wants to resize width
            if (req.data.maxwidth)
               newImg.cache.maxwidth = parseInt(req.data.maxwidth,10);
            else
               newImg.cache.maxwidth = null;
            // check if user wants to resize height
            if (req.data.maxheight)
               newImg.cache.maxheight = parseInt(req.data.maxheight,10);
            else
               newImg.cache.maxheight = null;
            // save/resize the image
            newImg.saveImg(rawimage);
            // any errors?
            if (!newImg.cache.error) {
               // the fullsize-image is on disk, so we add the image-object (and create the thumbnail-image too)
               this.addImg(newImg);
               // the fullsize-image is stored, so we check if a thumbnail should be created too
               if (req.data.thumbnail) {
                  newImg.createThumbnail(rawimage);
               }
               res.redirect(this.href());
            } 
         }
      }
   }
   return (newImg);
}




/**
 * function adds an image to pool
 */

function addImg(newImg) {
   newImg.alias = req.data.alias;
   newImg.alttext = req.data.alttext;
   newImg.creator = user;
   newImg.createtime = new Date();
   if (this.add(newImg))
      res.message = "The image " + newImg.alias + " was added successfully!";
   else
      res.message = "Ooops! Adding the image " + newImg.alias + " failed!";
   return;
}

/**
 * alias of image has changed, so we remove it and add it again with it's new alias
 */

function changeAlias(currImg) {
   // var oldAlias = currImg.alias;
   currImg.setParent(this);
   this.remove(currImg);
   this.set(currImg.alias,null);
   currImg.alias = req.data.alias;
   this.add(currImg);
   // if thumbnail exists, we have to change this alias too
   if (currImg.thumbnail)
      currImg.thumbnail.alias = currImg.alias;
   return;
}


/**
 * delete an image
 */

function deleteImage(currImg) {
   currImg.setParent(this);
   // first we try to remove the image from disk (and the thumbnail, if existing)
   var f = new File(getProperty("imgPath") + currImg.weblog.alias, currImg.filename + "." + currImg.fileext);
   if (f.remove()) {
      if (currImg.thumbnail) {
         f = new File(getProperty("imgPath") + currImg.weblog.alias, currImg.thumbnail.filename + "." + currImg.thumbnail.fileext);
         f.remove();
         currImg.thumbnail.setParent(this);
         this.remove(currImg.thumbnail);
      }
      if (this.remove(currImg))
         res.message = "The image was deleted successfully!";
      else
         res.message = "Ooops! Couldn't delete the image!";
   } else
      res.message = "Ooops! Couldn't remove the image from disk!";
   res.redirect(this.href("main"));
}