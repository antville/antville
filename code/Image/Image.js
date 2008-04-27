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

Image.THUMBNAILWIDTH = 100;

Image.KEYS = ["name", "created", "modified", "origin", "description", 
      "contentType", "contentLength", "width", "height", "thumbnailName", 
      "thumbnailWidth", "thumbnailHeight", "fileName", "site"];

Image.remove = function() {
   this.removeFiles();
   this.setTags(null);
   this.remove();
   return;
}

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

Image.prototype.getPermission = function(action) {
   if (!this._parent.getPermission("main")) {
      return false;
   }
   switch (action) {
      case ".":
      case "main":
      return true;
      case "delete":
      return this.creator === session.user || 
            Membership.require(Membership.MANAGER) ||
            User.require(User.PRIVILEGED);            
      case "edit":
      return this.creator === session.user || 
            Membership.require(Membership.MANAGER) || 
            User.require(User.PRIVILEGED) &&
            this.parent_type !== "Layout" ||
            this.parent === path.layout;
      case "replace":
      return (User.require(User.PRIVILEGED) ||
            Membership.require(Membership.MANAGER)) &&
            (this.parent_type === "Layout" && 
            this.parent !== path.layout);
   }
   return false;
}

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
   res.data.title = gettext("Image {0}", this.name);
   res.data.body = this.renderSkinAsString("Image#main");
   res.handlers.site.renderSkin("Site#page");
   return;
}

Image.prototype.edit_action = function() {
   if (req.postParams.save) {
      try {
         this.update(req.postParams);
        // FIXME: To be removed if work-around for Helma bug #607 passes
         //this.setTags(req.postParams.tags || req.postParams.tag_array);
         res.message = gettext("The changes were saved successfully.");
         res.redirect(this.href());
      } catch (ex) {
         res.message = ex;
         app.log(ex);
      }
   }
   res.data.action = this.href(req.action);
   res.data.title = gettext("Edit image {0}", this.name);
   res.data.body = this.renderSkinAsString("$Image#edit");
   res.handlers.site.renderSkin("Site#page");
   return;
}

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
         throw Error(gettext("This type of file cannot be uploaded as image."));
      }
      
      this.origin = data.file_origin;
      this.name || (this.name = this.site.images.getAccessName(data.name || 
            mime.normalizeFilename(mime.name).split(".")[0]));
      this.contentLength = mime.contentLength;
      this.contentType = mime.contentType;
   
      var image = this.constrain(mime, data.maxWidth, data.maxHeight);
      
      var thumbnail;
      if (image.width > Image.THUMBNAILWIDTH) {
         thumbnail = Image.constrain(mime, Image.THUMBNAILWIDTH);
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
      
      var fileName = this._id + extension;
      if (fileName !== this.fileName) {
         // Remove existing image files if the file name has changed
         this.removeFiles();
      }
      this.fileName = fileName;
      thumbnail && (this.thumbnailName = this._id + "_small" + extension);
      this.writeFiles(image, thumbnail);
   }

   if (this.parent_type !== "Layout") {
      this.setTags(data.tags || data.tag_array);
   }
   this.description = data.description;
   this.touch();
   return;
}

Image.prototype.tags_macro = function() {
   return res.write(this.getFormValue("tags"));
}

Image.prototype.contentLength_macro = function() {
   res.write((this.contentLength / 1024).format("###,###") + " KB");
   return;
}

Image.prototype.url_macro = function() {
   return res.write(this.getUrl());
}

Image.prototype.macro_macro = function() {
   return HopObject.prototype.macro_macro.call(this, null,  
         this.parent.constructor === Layout ? "layout.image" : "image");
}

Image.prototype.thumbnail_macro = function() {
   if (!this.thumbnailName) {
      return this.render_macro({});
   }
   var description = encode("Thumbnail of image " + this.name);
   return html.tag("img", {
      src: this.getUrl(this.getThumbnailFile().getName()),
      title: description,
      width: this.thumbnailWidth || String.EMPTY,
      height: this.thumbnailHeight || String.EMPTY,
      border: 0,
      alt: description
   });
}

Image.prototype.render_macro = function(param) {
   param.src = this.getUrl();
   param.title || (param.title = encode(this.description));
   param.width || (param.width = this.width);
   param.height || (param.height = this.height);
   param.border || (param.border = 0);
   param.alt = encode(param.alt || param.title);
   return html.tag("img", param);
}

Image.prototype.getFile = function(name) {
   name || (name = this.fileName);
   if (this.parent_type === "Layout") {
      var layout = this.parent || res.handlers.layout;
      return layout.getFile(name);
   }
   var site = this.parent || res.handlers.site;
   return site.getStaticFile("images/" + name);
}

Image.prototype.getUrl = function(name) {
   name || (name = this.fileName);
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

Image.prototype.getThumbnailFile = function() {
   return this.getFile(this.thumbnailName);
   // || this.fileName.replace(/(\.[^.]+)?$/, "_small$1"));
}

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

Image.prototype.constrain = function(mime, maxWidth, maxHeight) {
   try {
      var image = new helma.Image(mime.inputStream);
      this.width = image.width;
      this.height = image.height;

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
         this.width = image.width;
         this.height = image.height;
         return image
      }
      return mime;
   } catch (ex) {
      app.log(ex);
      throw Error(gettext("Could not resize the image."));
   }
}

Image.prototype.writeFiles = function(image, thumbnail) {
   if (image) {
      try {
         var file = this.getFile();
         if (image.saveAs) {
            image.saveAs(file);
         } else if (image.writeToFile) {
            image.writeToFile(file.getParent(), file.getName());
         }
         if (thumbnail) {
            thumbnail.saveAs(this.getThumbnailFile());
         }
      } catch (ex) {
         app.log(ex);
         throw Error(gettext("Could not save the image's files on disk."));         
      }
   }
   return;
}

Image.prototype.removeFiles = function() {
   try {
      this.getFile().remove();
      var thumbnail = this.getThumbnailFile();
      if (thumbnail) {
         thumbnail.remove();
      }
   } catch (ex) {
      app.log(ex);
      throw Error(gettext("Could not remove the image's files from disk."));
   }
   return;
}
