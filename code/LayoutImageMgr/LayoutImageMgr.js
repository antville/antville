//
// The Antville Project
// http://code.google.com/p/antville
//
// Copyright 2001-2007 by The Antville People
//
// Licensed under the Apache License, Version 2.0 (the ``License'');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an ``AS IS'' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// $Revision$
// $LastChangedBy$
// $LastChangedDate$
// $URL$
//

/**
 * display all images of a site or layout
 */
LayoutImageMgr.prototype.main_action = function() {
   res.data.imagelist = renderList(this.mergeImages(), "mgrlistitem", 10, req.data.page);
   res.data.pagenavigation = renderPageNavigation(this, this.href(), 10, req.data.page);
   res.data.title = getMessage("LayoutMgr.mainTitle", {layoutTitle: this._parent.title});
   res.data.body = this.renderSkinAsString("main");
   res.handlers.context.renderSkin("page");
   return;
};

/**
 * display the images of the parent layout
 */
LayoutImageMgr.prototype.default_action = function() {
   if (!this._parent.parent) {
      res.message = new Exception("layoutNoParent");
      res.redirect(this.href());
   }
   res.data.imagelist = renderList(this._parent.parent.images, "mgrlistitem", 10, req.data.page);
   res.data.pagenavigation = renderPageNavigation(this._parent.parent.images, this.href(req.action), 10, req.data.page);
   res.data.title = getMessage("LayoutMgr.listParentImagesTitle", {parentLayoutTitle: this._parent.parent.title});
   res.data.body = this.renderSkinAsString("main");
   res.handlers.context.renderSkin("page");
   return;
};

/**
 * display the images of this layout
 */
LayoutImageMgr.prototype.additional_action = function() {
   res.data.imagelist = renderList(this, "mgrlistitem", 10, req.data.page);
   res.data.pagenavigation = renderPageNavigation(this, this.href(req.action), 10, req.data.page);
   res.data.title = getMessage("LayoutMgr.listImagesTitle", {parentLayoutTitle: this._parent.title});
   res.data.body = this.renderSkinAsString("main");
   res.handlers.context.renderSkin("page");
   return;
};
/**
 * render additional navigation if the parent of a layout
 * also contains images
 */
LayoutImageMgr.prototype.navigation_macro = function(param) {
   if (!this._parent.parent || !this._parent.parent.images.size())
      return;
   this.renderSkin(param.skin ? param.skin : "navigation");
   return;
};
/**
 * function checks if image fits to the minimal needs
 * @param Obj Object containing the properties needed for creating a new Image
 * @param Obj User-Object creating this image
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */
LayoutImageMgr.prototype.evalImg = function(param, creator) {
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
};

/**
 * loop over all images and dump the metadata into
 * an xml-encoded export format
 * @param Object Zip object to add the image to
 * @param Object Boolean true for full export
 *               (including any parent layout image)
 * @param Object java.util.Hashtable (optional)
 * @return Object java.util.Hashtable
 */
LayoutImageMgr.prototype.dumpToZip = function(z, fullExport, log) {
   // create the export log
   if (!log)
      var log = {};
   var img, data, file;
   var size = this.size();
   for (var i=0;i<size;i++) {
      img = this.get(i);
      if (log[img.alias])
         continue;
      if (data = img.dumpToZip(z)) {
         var buf = new java.lang.String(Xml.writeToString(data)).getBytes();
         z.addData(buf, "imagedata/" + img.alias + ".xml");
         log[img.alias] = true;
      }
   }
   if (fullExport && this._parent.parent)
      this._parent.parent.images.dumpToZip(z, fullExport, log);
   return log;
};

/**
 * import the images that belong to a layout
 * @param Object JS object containing the image-metadata
 * @param Object JS object containing the image-files
 */
LayoutImageMgr.prototype.evalImport = function(metadata, files) {
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
};

/**
 * create a new Image based on the metadata passed
 * as argument
 * @param Object Layout-Object this image should belong to
 * @param Object JS object containing the image-metadata
 * @return Object created image object
 */
LayoutImageMgr.prototype.importImage = function(layout, data) {
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
};

/**
 * returns additional and default images of this layout
 * packed into a single Array (items sorted by createtime,
 * additional images override those of the parent layout)
 * @return Array containing Image HopObjects
 */
LayoutImageMgr.prototype.mergeImages = function() {
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
};

/**
 * check if user is allowed to add pictures
 * (overwrites ImageMgr.checkAdd())
 * @see ImageMgr/securityFunctions.js
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
LayoutImageMgr.prototype.checkAdd = function(usr, level) {
   if (this._parent.site) {
      if ((level & MAY_EDIT_LAYOUTS) == 0)
         throw new DenyException("layoutEdit");
   } else if (!usr.sysadmin)
      throw new DenyException("imageAdd");
   return;
};
