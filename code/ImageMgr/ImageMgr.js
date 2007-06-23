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
   res.data.imagelist = renderList(this, "mgrlistitem", 10, req.data.page);
   res.data.pagenavigation = renderPageNavigation(this, this.href(), 10, req.data.page);
   res.data.title = getMessage("ImageMgr.listTitle", {parentTitle: this._parent.title});
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
   var filesize = Math.round(param.rawimage.contentLength / 1024);
   if (this._parent.getDiskUsage() + filesize > this._parent.getDiskQuota()) {
      // disk quota has already been exceeded
      throw new Exception("siteQuotaExceeded");
   }

   var newImg = new Image(creator);
   // if no alias given try to determine it
   if (!param.alias)
      newImg.alias = buildAliasFromFile(param.rawimage, this);
   else {
      if (!param.alias.isFileName())
         throw new Exception("noSpecialChars");
      newImg.alias = buildAlias(param.alias, this);
   }
   newImg.filename = newImg.alias;
   // check if user wants to resize image
   var maxWidth = param.maxwidth ? parseInt(param.maxwidth, 10) : null;
   var maxHeight = param.maxheight ? parseInt(param.maxheight, 10) : null;
   // save/resize the image
   var dir = this._parent.getStaticDir("images");
   newImg.save(param.rawimage, dir, maxWidth, maxHeight);
   // the fullsize-image is on disk, so we add the image-object (and create the thumbnail-image too)
   newImg.alttext = param.alttext;
   if (!this.add(newImg))
      throw new Exception("imageAdd");
   // the fullsize-image is stored, so we check if a thumbnail should be created too
   if (newImg.width > THUMBNAILWIDTH)
      newImg.createThumbnail(param.rawimage, dir);
   // send e-mail notification
   if (newImg.site && newImg.site.isNotificationEnabled())
      newImg.site.sendNotification("upload", newImg);
   newImg.site.diskusage += newImg.filesize;
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
   var dir = imgObj.site ? imgObj.site.getStaticDir("images") : imgObj.layout.getStaticDir();
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
   // then, remove the image-object
   imgObj.remove();
   return new Message("imageDelete");
};

/**
 * function deletes all images
 */
ImageMgr.prototype.deleteAll = function() {
   for (var i=this.size();i>0;i--)
      this.deleteImage(this.get(i-1));
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
      this.checkAdd(session.user, req.data.memberlevel);
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
   if (!this._parent.preferences.getProperty("usercontrib") && (level & MAY_ADD_IMAGE) == 0)
      throw new DenyException("imageAdd");
   return;
};
