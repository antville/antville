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
ImageMgr.prototype.main_action = function() {
   switch (this.getContext()) {
      case "Site":
      res.data.imagelist = renderList(this, "mgrlistitem", 10, req.data.page);
      res.data.title = getMessage("ImageMgr.listTitle", {parentTitle: this._parent.title});
      break;
      case "Layout":
      res.data.imagelist = renderList(this.mergeImages(), "mgrlistitem", 10, req.data.page);
      res.data.title = getMessage("LayoutMgr.mainTitle", {layoutTitle: this._parent.title});
      break;
   }
   res.data.pagenavigation = renderPageNavigation(this, this.href(), 10, req.data.page);
   res.data.body = this.renderSkinAsString("main");
   res.handlers.context.renderSkin("page");
   return;
};

/**
 * display my images
 */
ImageMgr.prototype.myimages_action = function() {
   var ms = this._parent.members.get(session.user.name);
   res.data.imagelist = renderList(ms.images, "mgrlistitem", 10, req.data.page);
   res.data.pagenavigation = renderPageNavigation(ms.images, this.href(req.action), 10, req.data.page);
   res.data.title = getMessage("ImageMgr.listMyImageTitle", {parentTitle: this._parent.title});
   res.data.body = this.renderSkinAsString("main");
   res.handlers.context.renderSkin("page");
   return;
};

/**
 * action for creating new Image objects
 */
ImageMgr.prototype.create_action = function() {
   if (req.data.cancel)
      res.redirect(this.href());
   else if (req.data.save) {
      // check if a url has been passed instead of a file upload. hw
      if ((!req.data.rawimage || req.data.rawimage.contentLength == 0) && req.data.url)
          req.data.rawimage = getURL(req.data.url);
      try {
         var result = this.evalImg(req.data, session.user);
         res.message = result.toString();
         session.data.referrer = null;
         res.redirect(result.url);
      } catch (err) {
         res.message = err.toString();
      }
   }

   res.data.action = this.href(req.action);
   res.data.title = getMessage("ImageMgr.addImage", {parentTitle: this._parent.title});
   res.data.body = this.renderSkinAsString("new");
   res.handlers.context.renderSkin("page");
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
ImageMgr.prototype.evalImg = function(param, creator) {
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
   
   /* FIXME
   var filesize = Math.round(param.rawimage.contentLength / 1024);
   if (this._parent.getDiskUsage() + filesize > this._parent.getDiskQuota()) {
      // disk quota has already been exceeded
      throw new Exception("siteQuotaExceeded");
   }
   */

   var newImg = new Image(creator);
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
   
   switch (this.getContext()) {
      case "Site":
      // check if user wants to resize image
      var maxWidth = param.maxwidth ? parseInt(param.maxwidth, 10) : null;
      var maxHeight = param.maxheight ? parseInt(param.maxheight, 10) : null;
      // save/resize the image
      var dir = this._parent.getStaticDir("images");
      newImg.save(param.rawimage, dir, maxWidth, maxHeight);
      // send e-mail notification
      if (newImg.site && newImg.site.isNotificationEnabled()) {
         newImg.site.sendNotification("upload", newImg);
      }
      break;

      case "Layout":
      var dir = this._parent.getStaticDir();
      newImg.save(param.rawimage, dir);
   }
   
   // the fullsize-image is on disk, so we add the image-object (and create the thumbnail-image too)
   newImg.alttext = param.alttext;
   if (!this.add(newImg)) {
      throw new Exception("imageAdd");
   }

   // Set the tags of the image
   Story.prototype.setTags.call(newImg, param.tags || param.tags_array);
  
   // the fullsize-image is stored, so we check if a thumbnail should be created too
   if (newImg.width > THUMBNAILWIDTH) {
      newImg.createThumbnail(param.rawimage, dir);
   }
   // FIXME: newImg.site.diskusage += newImg.filesize;
   var result = new Message("imageCreate", newImg.alias, newImg);
   result.url = newImg.href();
   return result;
};

/**
 * delete an image
 * @param Obj Image-Object to delete
 * @return String Message indicating success or failure
 */
ImageMgr.prototype.deleteImage = function(imgObj) {
   // first remove the image from disk (and the thumbnail, if existing)
   switch (this.getContext()) {
      case "Site":
      var dir = imgObj.parent.getStaticDir("images");
      break;
      case "Layout":
      var dir = imgObj.parent.getStaticDir();
      break;
   }
   var f = new Helma.File(dir, imgObj.filename + "." + imgObj.fileext);
   f.remove();
   if (imgObj.thumbnail) {
      var thumb = imgObj.thumbnail;
      f = new Helma.File(dir, thumb.filename + "." + thumb.fileext);
      f.remove();
      thumb.remove();
   }
   if (imgObj.site)
      imgObj.site.diskusage -= imgObj.filesize;
   // Remove the tags of the image
   Story.prototype.setTags.call(imgObj, null);
   // Finally, remove the image iself
   imgObj.remove();
   return new Message("imageDelete");
};

/**
 * function deletes all images
 */
ImageMgr.prototype.removeChildren = function() {
   while (this.size() > 0) {
      this.deleteImage(this.get(0));
   }
   return true;
};

/**
 * permission check (called by hopobject.onRequest())
 * @param String name of action
 * @param Obj User object
 * @param Int Membership level
 * @return Obj Exception object or null
 */
ImageMgr.prototype.checkAccess = function(action, usr, level) {
   checkIfLoggedIn(this.href(req.action));
   try {
      this.checkAdd(session.user, res.data.memberlevel);
   } catch (deny) {
      res.message = deny.toString();
      res.redirect(this._parent.href());
   }
   return;
};

/**
 * check if user is allowed to add images
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
ImageMgr.prototype.checkAdd = function(usr, level) {
   switch (this.getContext()) {
      case "Site":
      if (!this._parent.properties.get("usercontrib") && 
          (level & MAY_ADD_IMAGE) == 0) {
         throw new DenyException("imageAdd");
      } else if (this._parent.site) {
         if ((level & MAY_EDIT_LAYOUTS) == 0) {
            throw new DenyException("layoutEdit");
         }
      } else if (!usr.sysadmin) {
         throw new DenyException("imageAdd");
      }
      break;
      
      case "Layout":
      if (this._parent.site) {
         if ((level & MAY_EDIT_LAYOUTS) == 0) {
            throw new DenyException("layoutEdit");
         }
      } else if (!usr.sysadmin) {
         throw new DenyException("imageAdd");
      }
   }
   return;
};

ImageMgr.prototype.getContext = function() {
   return this._parent._prototype;
};

///// Copied from LayoutImageMgr /////

/**
 * display the images of the parent layout
 */
ImageMgr.prototype.default_action = function() {
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
ImageMgr.prototype.additional_action = function() {
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
ImageMgr.prototype.navigation_macro = function(param) {
   if (!this._parent.parent || !this._parent.parent.images.size())
      return;
   this.renderSkin(param.skin ? param.skin : "navigation");
   return;
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
ImageMgr.prototype.dumpToZip = function(z, fullExport, log) {
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
ImageMgr.prototype.evalImport = function(metadata, files) {
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
ImageMgr.prototype.importImage = function(layout, data) {
   // FIXME: replace the creator with a more intelligent solution ...
   var img = new Image(session.user);
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
ImageMgr.prototype.mergeImages = function() {
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

ImageMgr.prototype.getTags = function(group) {
   return this._parent.getTags("galleries", group);
};
