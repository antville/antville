/**
 * constructor function for image objects
 */
function constructor(site, creator) {
   this.site = site;
   this.creator = creator;
   this.createtime = new Date();
}


/**
 * save image as file on local disk
 * but before check if image should be resized
 * @param Node uploaded image
 * @return Boolean true in any case ...
 */
function save(rawimage, dir, maxWidth, maxHeight) {
   // determine filetype of image (one could do this also by checking the mimetype) 
   this.fileext = this.evalImgType(rawimage.contentType);
   if (this.fileext == "ico") {
      // the image is an .ico, so we directory write it to disk and return
      rawimage.writeToFile(dir, this.filename + "." + this.fileext);
      return true;
   }
   var img = new Image(rawimage.getContent());
   this.width = img.getWidth();
   this.height = img.getHeight();
   var resize = false;
   var hfact = 1;
   var vfact = 1;
   if (maxWidth && this.width > maxWidth) {
      hfact = maxWidth / this.width; 
      resize = true;
   }
   if (maxHeight && this.height > maxHeight) {
      vfact = maxHeight / this.height; 
      resize = true;
   }

   if (resize) { 
      this.width = Math.ceil(this.width * (hfact < vfact ? hfact : vfact));
      this.height = Math.ceil(this.height * (hfact < vfact ? hfact : vfact));
      try {
         img.resize(this.width, this.height); 
         if (rawimage.contentType == 'image/gif' || this.fileext == "gif")
            img.reduceColors(256); 
      } catch (err) {
         throw new Exception("imageResize");
      }
   }
   // finally we try  to save the resized image
   try {
      if (resize)
         img.saveAs(dir + this.filename + "." + this.fileext);
      else
         rawimage.writeToFile(dir, this.filename + "." + this.fileext);
   } catch (err) {
      throw new Exception("imageSave");
   }
   return;
}


/**
 * function checks if new image-parameters are correct ...
 * @param Obj Object containing the form values
 * @param Obj User-Object modifying this image
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */

function evalImg(param, modifier) {
   this.alttext = param.alttext;
   this.modifier = modifier;
   this.modifytime = new Date();
   if (this.thumbnail) {
      this.thumbnail.alttext = this.alttext;
      this.thumbnail.modifytime = this.modifytime;
      this.thumbnail.modifier = this.modifier;
   }
   return new Message("update");
}


/**
 * function returns file-extension according to mimetype of raw-image
 * returns false if mimetype is unknown
 * @param String Mimetype of image
 * @return String File-Extension to use
 */

function evalImgType(ct) {
   switch (ct) {
      case "image/jpeg" :
         return "jpg";
         break;
      case "image/pjpeg" :
         return "jpg";
         break;
      case "image/gif" :
         return "gif";
         break;
      case "image/x-png" :
         return "png";
         break;
      case "image/png" :
         return "png";
         break;
      case "image/x-icon" :
         return "ico";
   }
}

/**
 * function creates a thumbnail of this image
 * does nothing if the image uploaded is smaller than 100x100px
 * @param uploaded image
 * @return Boolean true in any case ...
 */

function createThumbnail(rawimage, dir) {
   var thumb = new image(this.site, this.creator);
   thumb.filename = this.filename + "_small";
   thumb.save(rawimage, dir, THUMBNAILWIDTH);
   thumb.alttext = this.alttext;
   thumb.alias = this.alias;
   thumb.parent = this;
   this.thumbnail = thumb;
   return;
}

/**
 * function creates the call to the client-side popup-script
 * for image-object
 * @return String call of popup-script
 */

function popupUrl() {
   var url = "javascript:openPopup('" + this.getStaticUrl();
   url += "'," + this.width + "," + this.height + ");return false;";
   return (url);
}


/**
 * returns the url to the static image
 */
function getStaticUrl() {
   var url = new java.lang.StringBuffer();
   url.append(getProperty("imgUrl", "/static/images/"));
   if (this.site) {
      url.append(this.site.alias);
      url.append("/");
   }
   url.append(this.filename);
   url.append(".");
   url.append(this.fileext);
   return url.toString();
}
