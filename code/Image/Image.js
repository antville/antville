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
 * @fileOverview Defines the Image prototype.
 */

this.handleMetadata("contentLength");
this.handleMetadata("contentType");
this.handleMetadata("description");
this.handleMetadata("fileName");
this.handleMetadata("height");
this.handleMetadata("thumbnailHeight");
this.handleMetadata("thumbnailName");
this.handleMetadata("thumbnailWidth");
this.handleMetadata("origin");
this.handleMetadata("width");

/** @constant */
Image.THUMBNAILWIDTH = 100;

/** @constant */
Image.KEYS = ["name", "created", "modified", "origin", "description", 
      "contentType", "contentLength", "width", "height", "thumbnailName", 
      "thumbnailWidth", "thumbnailHeight", "fileName", "site"];

/**
 * 
 */
Image.remove = function() {
   if (this.constructor === Image) {
      this.removeFiles();
      this.setTags(null);
      this.remove();
   }
   return;
}

/**
 * 
 * @param {String} type
 * @returns {String}
 */
Image.getFileExtension = function(type) {
   switch (type) {
      //case "image/x-icon":
      //return ".ico";
      case "image/gif":
      return ".gif";
      case "image/jpeg":
      case "image/pjpeg":
      return ".jpg";
      case "image/png":
      case "image/x-png":
      return ".png";
   }
   return null;
}

/**
 * @name Image
 * @constructor
 * @param {Object} data
 * @property {Number} contentLength
 * @property {String} contentType
 * @property {Date} created
 * @property {User} creator
 * @property {String} description
 * @property {String} fileName
 * @property {Number} height
 * @property {Metadata} metadata
 * @property {Date} modified
 * @property {User} modifier
 * @property {String} name
 * @property {} origin
 * @property {HopObject} parent
 * @property {Number} parent_id
 * @property {String} parent_type
 * @property {String} prototype
 * @property {Tag[]} tags 
 * @property {Number} thumbnailHeight
 * @property {String} thumbnailName
 * @property {Number} thumbnailWidth
 * @property {Number} width
 * @extends HopObject
 */
Image.prototype.constructor = function(data) {
   // Images.Default is using the constructor on code compilation
   if (typeof session !== "undefined") {
      this.creator = session.user;
      this.touch();
   }
   if (data) {
      for each (var key in Image.KEYS) {
         this[key] = data[key];
      }
   }
   this.created = new Date;
   return this;
}

/**
 * 
 * @param {String} action
 * @return {Boolean}
 */
Image.prototype.getPermission = function(action) {
   var defaultGrant = this._parent.getPermission("main");
   switch (action) {
      case ".":
      case "main":
      return true;
      case "delete":
      return defaultGrant && this.creator === session.user || 
            Membership.require(Membership.MANAGER) ||
            User.require(User.PRIVILEGED);            
      case "edit":
      return defaultGrant && this.creator === session.user || 
            Membership.require(Membership.MANAGER) || 
            User.require(User.PRIVILEGED) &&
            this.parent_type !== "Layout" ||
            this.parent === path.layout;
      case "replace":
      return defaultGrant && (User.require(User.PRIVILEGED) ||
            Membership.require(Membership.MANAGER)) &&
            (this.parent_type === "Layout" && 
            this.parent !== path.layout);
   }
   return false;
}

/**
 * 
 * @param {String} action
 * @returns {String}
 */
Image.prototype.href = function(action) {
   if (action !== "replace") {
      if (this.parent_type === "Layout" && this.parent !== path.layout) {
         return this.getUrl();
      }
   } else {
      return res.handlers.images.href("create") + "?name=" + this.name;
   }
   return HopObject.prototype.href.apply(this, arguments);
}

Image.prototype.main_action = function() {
   res.data.title = gettext("Image: {0}", this.getTitle());
   res.data.body = this.renderSkinAsString("Image#main");
   res.handlers.site.renderSkin("Site#page");
   return;
}

Image.prototype.edit_action = function() {
   if (req.postParams.save) {
      try {
         this.update(req.postParams);
         res.message = gettext("The changes were saved successfully.");
         res.redirect(this.href());
      } catch (ex) {
         res.message = ex;
         app.log(ex);
      }
   }
   res.data.action = this.href(req.action);
   res.data.title = gettext("Edit Image");
   res.data.body = this.renderSkinAsString("$Image#edit");
   res.handlers.site.renderSkin("Site#page");
   return;
}

/**
 * 
 * @param {String} name
 * @returns {Object}
 */
Image.prototype.getFormValue = function(name) {
   var self = this;
   
   var getOrigin = function(str) {
      var origin = req.postParams.file_origin || self.origin;
      if (origin && origin.contains("://")) {
         return origin;
      }
      return null;
   }
   
   if (req.isPost()) {
      if (name === "file") {
         return getOrigin();
      }
      return req.postParams[name];
   }
   switch (name) {
      case "file":
      return getOrigin();
      case "maxWidth":
      case "maxHeight":
      return this[name] || 400;
      case "tags":
      return this.getTags();
   }
   return this[name] || req.queryParams[name];
}

/**
 * 
 * @param {Object} data
 */
Image.prototype.update = function(data) {
   if (data.uploadError) {
      app.log(data.uploadError);
      // Looks like the file uploaded has exceeded the upload limit ...
      throw Error(gettext("File size is exceeding the upload limit."));
   }
   
   if (!data.file_origin) {
      if (this.isTransient()) { 
         throw Error(gettext("There was nothing to upload. Please be sure to choose a file."));
      }
   } else if (data.file_origin !== this.origin) {
      var mime = data.file;
      if (mime.contentLength < 1) {
         mime = getURL(data.file_origin);
         if (!mime) {
            throw Error(gettext("Could not fetch the image from the given URL."));
         }
      }

      var extension = Image.getFileExtension(mime.contentType);
      if (!extension) {
         throw Error(gettext("This seems not to be a (valid) JPG, PNG or GIF image file."));
      }
      
      this.origin = data.file_origin;
      var mimeName = mime.normalizeFilename(mime.name);
      this.contentLength = mime.contentLength;
      this.contentType = mime.contentType;
   
      if (!this.name) {
          var name = File.getName(data.name) || mimeName.split(".")[0];
          this.name = this.parent.images.getAccessName(name);
      }

      var image = this.getConstraint(mime, data.maxWidth, data.maxHeight);
      this.height = image.height; 
      this.width = image.width;

      var thumbnail;
      if (image.width > Image.THUMBNAILWIDTH) {
         thumbnail = this.getConstraint(mime, Image.THUMBNAILWIDTH);
         this.thumbnailWidth = thumbnail.width; 
         this.thumbnailHeight = thumbnail.height; 
      } else if (this.isPersistent()) {
         this.getThumbnailFile().remove();
         // NOTE: delete won't work here due to getter/setter methods
         this.metadata.remove("thumbnailName");
         this.metadata.remove("thumbnailWidth");
         this.metadata.remove("thumbnailHeight");
      }

      // Make the image persistent before proceeding with writing files and 
      // setting tags (also see Helma bug #607)
      this.isTransient() && this.persist();
      
      var fileName = this.name + extension;
      if (fileName !== this.fileName) {
         // Remove existing image files if the file name has changed
         this.removeFiles();
      }
      this.fileName = fileName;
      thumbnail && (this.thumbnailName = this.name + "_small" + extension);
      this.writeFiles(image.resized || mime, thumbnail && thumbnail.resized);
      image.resized && (this.contentLength = this.getFile().getLength());
   }

   if (this.parent_type !== "Layout") {
      this.setTags(data.tags || data.tag_array);
   }
   this.description = data.description;
   this.touch();
   return;
}

/**
 * 
 */
Image.prototype.tags_macro = function() {
   return res.write(this.getFormValue("tags"));
}

/**
 * 
 */
Image.prototype.contentLength_macro = function() {
   return res.write((this.contentLength / 1024).format("###,###") + " KB");
}

/**
 * 
 */
Image.prototype.url_macro = function() {
   return res.write(this.getUrl());
}

/**
 * 
 */
Image.prototype.macro_macro = function() {
   return HopObject.prototype.macro_macro.call(this, null,  
         this.parent.constructor === Layout ? "layout.image" : "image");
}

/**
 * 
 * @param {Object} param
 */
Image.prototype.thumbnail_macro = function(param) {
   if (!this.thumbnailName) {
      return this.render_macro(param);
   }
   param.src = this.getUrl(this.getThumbnailFile().getName());
   param.title || (param.title = encode(this.description));
   param.alt = encode(param.alt || param.title);
   param.width = this.thumbnailWidth || String.EMPTY;
   param.height = this.thumbnailHeight || String.EMPTY;
   param.border = (param.border = 0);
   html.tag("img", param);
   return;
}

/**
 * 
 * @param {Object} param
 */
Image.prototype.render_macro = function(param) {
   param.src = this.getUrl();
   param.title || (param.title = encode(this.description));
   param.alt = encode(param.alt || param.title);
   param.width || (param.width = this.width);
   param.height || (param.height = this.height);
   param.border || (param.border = 0);
   html.tag("img", param);
   return;
}

/**
 * 
 * @param {Object} name
 * @returns {helma.File}
 * @see Site#getStaticFile
 */
Image.prototype.getFile = function(name) {
   name || (name = this.fileName);
   if (this.parent_type === "Layout") {
      var layout = this.parent || res.handlers.layout;
      return layout.getFile(name);
   }
   var site = this.parent || res.handlers.site;
   return site.getStaticFile("images/" + name);
}

/**
 * 
 * @param {Object} name
 * @returns {String}
 * @see Site#getStaticUrl
 */
Image.prototype.getUrl = function(name) {
   name || (name = this.fileName);
   //name = encodeURIComponent(name);
   if (this.parent_type === "Layout") {
      var layout = this.parent || res.handlers.layout;
      res.push();
      res.write("layout/");
      res.write(name);
      return layout.site.getStaticUrl(res.pop());
   }
   var site = this.parent || res.handlers.site;
   return site.getStaticUrl("images/" + name);
   // FIXME: testing free proxy for images
   /* var result = "http://www.freeproxy.ca/index.php?url=" + 
   encodeURIComponent(res.pop().rot13()) + "&flags=11111";
   return result; */
}

/**
 * @returns {helma.File}
 */
Image.prototype.getThumbnailFile = function() {
   return this.getFile(this.thumbnailName);
   // || this.fileName.replace(/(\.[^.]+)?$/, "_small$1"));
}

/**
 * @returns {String}
 */
Image.prototype.getJSON = function() {
   return {
      name: this.name,
      origin: this.origin,
      description: this.description,
      contentType: this.contentType,
      contentLength: this.contentLength,
      width: this.width,
      height: this.height,
      thumbnailName: this.thumbnailName,
      thumbnailWidth: this.thumbnailWidth,
      thumbnailHeight: this.thumbnailHeight,
      created: this.created,
      creator: this.creator ? this.creator.name : null,
      modified: this.modified,
      modifier: this.modifier ? this.modifier.name : null,
   }.toSource();
}

/**
 * 
 * @param {helma.util.MimePart} mime
 * @param {Number} maxWidth
 * @param {Number} maxHeight
 * @throws {Error}
 * @returns {Object}
 */
Image.prototype.getConstraint = function(mime, maxWidth, maxHeight) {
   try {
      var image = new helma.Image(mime.inputStream);
      var factorH = 1, factorV = 1;
      if (maxWidth && image.width > maxWidth) {
         factorH = maxWidth / image.width;
      }
      if (maxHeight && image.height > maxHeight) {
         factorV = maxHeight / image.height;
      }
      if (factorH !== 1 || factorV !== 1) {
         var width = Math.ceil(image.width * 
               (factorH < factorV ? factorH : factorV));
         var height = Math.ceil(image.height * 
               (factorH < factorV ? factorH : factorV));
         image.resize(width, height);
         if (mime.contentType.endsWith("gif")) {
            image.reduceColors(256);
         }
         return {resized: image, width: image.width, height: image.height};
      }
      return {width: image.width, height: image.height};
   } catch (ex) {
      app.log(ex);
      throw Error(gettext("Could not resize the image."));
   }
}

/**
 * 
 * @param {helma.Image|helma.util.MimePart} data
 * @param {Object} thumbnail
 * @throws {Error}
 */
Image.prototype.writeFiles = function(data, thumbnail) {
   if (data) {
      try {
         // If data is a MimeObject (ie. has the writeToFile method)
         // the image was not resized and thus, we directly write it to disk
         var file = this.getFile();
         if (data.saveAs) {
            data.saveAs(file);
         } else if (data.writeToFile) {
            data.writeToFile(file.getParent(), file.getName());
         }
         if (thumbnail) {
            thumbnail.saveAs(this.getThumbnailFile());
         }
      } catch (ex) {
         app.log(ex);
         throw Error(gettext("Could not save the image file on disk."));         
      }
   }
   return;
}

/**
 * @throws {Error}
 */
Image.prototype.removeFiles = function() {
   try {
      this.getFile().remove();
      var thumbnail = this.getThumbnailFile();
      if (thumbnail) {
         thumbnail.remove();
      }
   } catch (ex) {
      app.log(ex);
      throw Error(gettext("Could not remove the image file from disk."));
   }
   return;
}

/**
 * @returns {String}
 */
Image.prototype.getConfirmText = function() {
   return gettext("You are about to delete the image {0}.", this.name);
}
