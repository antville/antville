/**
 * function checks if image fits to the minimal needs
 * @param Obj Object containing the properties needed for creating a new Image
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

   var newImg = new LayoutImage(creator);
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
   // save/resize the image
   var dir = this._parent.getStaticDir();
   newImg.save(param.rawimage, dir);
   // the fullsize-image is on disk, so we add the image-object (and create the thumbnail-image too)
   newImg.alttext = param.alttext;
   if (!this.add(newImg))
      throw new Exception("imageAdd");
   // the fullsize-image is stored, so we check if a thumbnail should be created too
   if (newImg.width > THUMBNAILWIDTH)
      newImg.createThumbnail(param.rawimage, dir);
   var result = new Message("imageCreate", newImg.alias);
   result.url = newImg.href();
   return result;
}

/**
 * loop over all images and dump the metadata into
 * an xml-encoded export format
 * @param Object Zip object to add the image to
 * @param Object Boolean true for full export
 *               (including any parent layout image)
 * @param Object java.util.Hashtable (optional)
 * @return Object java.util.Hashtable
 */
function dumpToZip(z, fullExport, exportLog) {
   // create the export log
   if (!exportLog)
      var exportLog = new java.util.Hashtable(20);
   
   for (var i=0;i<this.size();i++) {
      var img = this.get(i);
      if (exportLog.containsKey(img.alias))
         continue;
      var buf = new java.lang.String(Xml.writeToString(img.dumpToZip(z))).getBytes();
      z.addData(buf, "imagedata/" + img.alias + ".xml");
      exportLog.put(img.alias, true);
   }
   if (fullExport && this._parent.parent)
      this._parent.parent.images.dumpToZip(z, fullExport, exportLog);
   return exportLog;
}

/**
 * import the images that belong to a layout
 * @param Object JS object containing the image-metadata
 * @param Object JS object containing the image-files
 */
function evalImport(metadata, files) {
   for (var i in metadata) {
      var data = Xml.readFromString(new java.lang.String(metadata[i].data, 0, metadata[i].data.length));
      var newImg = this.importImage(this._parent, data);
      newImg.layout = this._parent;
      // finally, add the new Image to the collection of this LayoutImageMgr
      this.add(newImg);
   }
   // store the image files to the appropriate directory
   var dir = this._parent.getStaticDir().getAbsolutePath();
   var re = /[\\\/]/;
   for (var i in files) {
      var f = files[i];
      var arr = f.name.split(re);
      var fos = new java.io.FileOutputStream(dir + "/" + arr.pop());
      var outStream = new java.io.BufferedOutputStream(fos);
      outStream.write(f.data, 0, f.data.length);
      outStream.close();
   }
   return true;
}

/**
 * create a new Image based on the metadata passed
 * as argument
 * @param Object Layout-Object this image should belong to
 * @param Object JS object containing the image-metadata
 * @return Object created image object
 */
function importImage(layout, data) {
   // FIXME: replace the creator with a more intelligent solution ...
   var img = new LayoutImage(session.user);
   if (data.thumbnail) {
      img.thumbnail = this.importImage(layout, data.thumbnail);
      // FIXME: not sure if this is really necessary ...
      img.thumbnail.parent = img;
   }
   img.layout = layout;
   img.alias = data.alias;
   img.filename = data.filename;
   img.fileext = data.fileext;
   img.width = data.width;
   img.height = data.height;
   img.alttext = data.alttext;
   img.createtime = data.createtime;
   img.modifytime = data.modifytime;
   return img;
}

/**
 * returns additional and default images of this layout
 * packed into a single Array (items sorted by createtime,
 * additional images override those of the parent layout)
 * @return Array containing Image HopObjects
 */
function mergeImages() {
   var coll = [];
   // object to store the already added image aliases
   // used to avoid duplicate images in the list
   var keys = {};

   // private method to add a custom skin
   var addImages = function(mgr) {
      var size = mgr.size();
      for (var i=0;i<size;i++) {
         var img = mgr.get(i);
         var key = img.alias;
         if (!keys[key]) {
            keys[key] = img;
            coll.push(img);
         }
      }
   }
   var layout = this._parent;
   while (layout) {
      addImages(layout.images);
      layout = layout.parent;
   }
   coll.sort(new Function("a", "b", "return b.createtime - a.createtime"));
   return coll;
}

