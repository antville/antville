/**
 * save image as file on local disk
 * but before check if image should be resized
 * @param Node uploaded image
 * @return Boolean true in any case ...
 */

function saveImg(rawimage) {
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
      // finally we save the resized image
      img.saveAs(this.cache.saveTo + this.filename + "." + this.fileext);
   } else {
      // finally we save the not resized image
      rawimage.writeToFile(this.cache.saveTo,this.filename + "." + this.fileext);
   }
   return true; 
}


/**
 * function checks if new image-parameters are correct ...
 * @param Obj Object containing the form values
 * @param Obj User-Object modifying this image
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */

function evalImg(param,modifier) {
   var result = new Object();
   if (param.alias) {
      if (param.alias != this.alias && this.weblog.images.get(req.data.alias)) {
         // alias has changed, but is already existing
         result.message = "This name is already in use!";
         result.error = true;
      } else if (!isClean(param.alias)) {
         result.message = "Please do not use special characters in the name!";
         result.error = true;
      } else
         this.weblog.images.changeAlias(this,param.alias);
      this.alttext = param.alttext;
      this.modifier = modifier;
      if (this.thumbnail)
         this.thumbnail.alttext = this.alttext;
      result.message = "Changes saved successfully!";
      result.error = false;
   } else {
      result.message = "You must specify a name for this image!";
      result.error = true;
   }
   return (result);
}


/**
 * function returns file-extension according to mimetype of raw-image
 * returns false if mimetype is unknown
 * @param String Mimetype of image
 * @return String File-Extension to use
 */

function evalImgType(ct) {
   if (ct == "image/jpeg" || ct == "image/pjpeg")
      return ("jpg");
   else if (ct == "image/gif")
      return ("gif");
   else if (ct == "image/png")
      return ("png");
   else
      return null;
}

/**
 * function creates a thumbnail of this image
 * does nothing if the image uploaded is smaller than 100x100px
 * @param uploaded image
 * @return Boolean true in any case ...
 */

function createThumbnail(rawimage) {
   if (this.width < 100 && this.height < 100)
      return null;
   var thumbImg = new image();
   thumbImg.filename = this.filename + "_small";
   thumbImg.cache.saveTo = this.cache.saveTo;
   thumbImg.cache.maxwidth = 100;
   thumbImg.cache.maxheight = 100;
   thumbImg.saveImg(rawimage);
   thumbImg.weblog = this.weblog;
   thumbImg.alttext = this.alttext;
   thumbImg.creator = this.creator;
   thumbImg.createtime = this.createtime;
   thumbImg.alias = this.alias;
   thumbImg.parent = this;
   this.thumbnail = thumbImg;
   return true;
}

/**
 * function creates the call to the client-side popup-script
 * for image-object
 * @return String call of popup-script
 */

function popupUrl() {
   var url = "javascript:openPopup('" + getProperty("imgUrl") + this.weblog.alias + "/" + this.filename + "." + this.fileext;
   url += "'," + this.width + "," + this.height + ");";
   return (url);
}


/**
 * returns the url to the static image
 */
function getStaticUrl() {
  var url = getProperty("imgUrl");
  if (this.weblog)
    url += this.weblog.alias + "/";
  url += this.filename + "." + this.fileext;
  return(url);
}
