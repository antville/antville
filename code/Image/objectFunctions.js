/**
 * save image as file on local disk
 * but before check if image should be resized
 * input params:  - uploaded image
 *                - parameter-object
 * return param:  - parameter-object with add. props
 */

function saveImg(rawimage) {
   if (rawimage && (!rawimage.contentType || rawimage.contentType.indexOf("image/") < 0)) {
      // whatever the user has uploaded, it was no image! 
      this.cache.error = true; 
      res.message = "This was definetly no image!"; 
   } else {
      // determine filetype of image (one could do this also by checking the mimetype) 
      this.fileext = rawimage.name.substring(rawimage.name.lastIndexOf(".") + 1); 
      var img = new Image(rawimage.getContent()); 
      // check if resizing is necessary 
      if (this.cache.maxWidth && this.cache.maxHeight && img.width > this.cache.maxWidth && img.height > this.cache.maxHeight) {
         var hfact = this.cache.maxWidth / img.width; 
         var vfact = this.cache.maxHeight / img.height; 
         this.width = Math.round(img.width * (hfact < vfact ? hfact : vfact)); 
         this.height = Math.round(img.height * (hfact < vfact ? hfact : vfact)); 
         var doResize = true; 
      } else if (this.cache.maxWidth && img.width > this.cache.maxWidth) {
         var fact = this.cache.maxWidth / img.width; 
         this.width = this.cache.maxWidth; 
         this.height = Math.round(img.height * fact); 
         var doResize = true; 
      } else if (this.cache.maxHeight && img.height > this.cache.maxHeight) {
         var fact = this.cache.maxHeight / img.height; 
         this.height = this.cache.maxHeight; 
         this.width = Math.round(img.width * fact); 
         var doResize = true; 
      } else {
         // no resizing done
         this.width = img.width;
         this.height = img.height;
      }
      if (doResize) { 
         img.resize(this.width,this.height); 
         if (rawimage.contentType == 'image/gif')
            img.reduceColors(256); 
      }
      // finally we save the image 
      img.saveAs(this.cache.saveTo + this.filename + "." + this.fileext); 
   } 
   return; 
}


/**
 * function checks if new image-parameters are correct ...
 */

function evalImg() {
   if (req.data.alias) {
      if (req.data.alias != this.alias) {
         // alias has changed ...
         this.weblog.images.changeAlias(this);
      }
      this.alttext = req.data.alttext;
      res.message = "Changes saved successfully!";
      res.redirect(this.weblog.images.href());
   }
}