/**
 * save image as file on local disk
 * but before check if image should be resized
 */

function saveImg(rawimage) {
   if (rawimage && (!rawimage.contentType || !this.evalImgType(rawimage.contentType))) {
      // whatever the user has uploaded, it was no image! 
      this.cache.error = true; 
      res.message = "This was definetly no image!"; 
   } else {
      // determine filetype of image (one could do this also by checking the mimetype) 
      this.fileext = this.evalImgType(rawimage.contentType);
      var img = new Image(rawimage.getContent()); 
      // check if resizing is necessary 
      if (this.cache.maxwidth && this.cache.maxheight && img.width > this.cache.maxwidth && img.height > this.cache.maxheight) {
         var hfact = this.cache.maxwidth / img.width; 
         var vfact = this.cache.maxheight / img.height; 
         this.width = Math.round(img.width * (hfact < vfact ? hfact : vfact)); 
         this.height = Math.round(img.height * (hfact < vfact ? hfact : vfact)); 
         var doResize = true; 
      } else if (this.cache.maxwidth && img.width > this.cache.maxwidth) {
         var fact = this.cache.maxwidth / img.width; 
         this.width = this.cache.maxwidth; 
         this.height = Math.round(img.height * fact); 
         var doResize = true; 
      } else if (this.cache.maxheight && img.height > this.cache.maxheight) {
         var fact = this.cache.maxheight / img.height; 
         this.height = this.cache.maxheight; 
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


/**
 * function returns file-extension according to mimetype of raw-image
 * returns false if mimetype is unknown
 */

function evalImgType(ct) {
   if (ct == "image/jpeg" || ct == "image/pjpeg")
      return ("jpg");
   else if (ct == "image/gif")
      return ("gif");
   else if (ct == "image/png")
      return ("png");
   else
      return false;
}