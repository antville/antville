/**
 * constructor function for image objects
 */
function constructor(creator) {
   this.creator = creator;
   this.createtime = new Date();
   return this;
}

/**
 * save image as file on local disk
 * but before check if image should be resized
 * @param Object uploaded image
 * @param Object File-Object representing the destination directory
 * @param Int maximum width
 * @param Int maximum height
 */
function save(rawimage, dir, maxWidth, maxHeight) {
   // determine filetype of image (one could do this also by checking the mimetype)
   this.fileext = evalImgType(rawimage.contentType);
   if (this.fileext == "ico") {
      // the image is an .ico, so we directory write it to disk and return
      rawimage.writeToFile(dir.getPath(), this.filename + "." + this.fileext);
      return true;
   }
   var img = new Helma.Image(rawimage.getContent());
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
         img.saveAs(dir.getPath() + "/" + this.filename + "." + this.fileext);
      else
         rawimage.writeToFile(dir.getPath(), this.filename + "." + this.fileext);
   } catch (err) {
      app.log("Error in image.save(): can't save image to "+dir);
      throw new Exception("imageSave");
   }
   var f = new Helma.File(dir.getPath(), this.filename + "." + this.fileext);
   this.filesize = f.getLength();
   return;
}


/**
 * function checks if new Image-parameters are correct ...
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
   // check name of topic (if specified)
   var topicName = null;
   if (param.topic) {
      if (!param.topic.isURL())
         throw new Exception("topicNoSpecialChars");
      topicName = param.topic;
   } else if (param.addToTopic)
      topicName = param.addToTopic;
   this.topic = topicName;
   return new Message("update");
}


/**
 * function creates a thumbnail of this image
 * does nothing if the image uploaded is smaller than 100x100px
 * @param uploaded image
 * @return Boolean true in any case ...
 */

function createThumbnail(rawimage, dir) {
   var thumb = (this.site ? new Image(this.creator) : new LayoutImage(this.creator));
   thumb.site = this.site;
   thumb.layout = this.layout;
   thumb.filename = this.filename + "_small";
   thumb.save(rawimage, dir, THUMBNAILWIDTH);
   thumb.alttext = this.alttext;
   thumb.alias = this.alias;
   thumb.parent = this;
   this.thumbnail = thumb;
   return;
}

/**
 * return the call to the client-side popup-script
 * for image-object
 * @return String call of popup-script
 */
function getPopupUrl() {
   res.push();
   res.write("javascript:openPopup('");
   res.write(this.getUrl());
   res.write("',");
   res.write(this.width);
   res.write(",");
   res.write(this.height);
   res.write(");return false;");
   return res.pop();
}


/**
 * return the url of the image
 */
function getUrl() {
   res.push();
   this.site.staticUrl("images/");
   res.write(this.filename);
   res.write(".");
   res.write(this.fileext);
   return res.pop();
}

/**
 * return the image file on disk
 * @return Object File object
 */
function getFile() {
   return File.get(this.site.getStaticPath(), this.filename + "." + this.fileext);
}


/**
 * dump an image to a zip file passed as argument
 * @return Object HopObject containing the metadata of the image(s)
 */
function dumpToZip(z) {
   var data = new HopObject();
   if (this.thumbnail)
      data.thumbnail = this.thumbnail.dumpToZip(z);
   data.alias = this.alias;
   data.filename = this.filename;
   data.fileext = this.fileext;
   data.width = this.width;
   data.height = this.height;
   data.alttext = this.alttext;
   data.createtime = this.createtime;
   data.modifytime = this.modifytime;
   data.exporttime = new Date();
   data.creator = this.creator ? this.creator.name : null;
   data.modifier = this.modifier ? this.modifier.name : null;
   // add the image file to the zip archive
   z.add(this.getFile(), "images");
   return data;
}
