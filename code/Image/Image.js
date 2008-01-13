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

this.handleMetadata("url");
this.handleMetadata("description");
this.handleMetadata("contentType");
this.handleMetadata("contentLength");
this.handleMetadata("width");
this.handleMetadata("height");
this.handleMetadata("thumbnailName");
this.handleMetadata("thumbnailWidth");
this.handleMetadata("thumbnailHeight");

Image.prototype.constructor = function(data) {
   // Images.Default is using the constructor on code compilation
   if (typeof session !== "undefined") {
      this.creator = session.user;
      this.touch();
   }
   if (data) {
      this.map(data);
   }
   this.created = new Date;
   return this;
};

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
};

Image.prototype.href = function(action) {
   if (action !== "replace") {
      if (this.parent_type === "Layout" && this.parent !== path.layout) {
         return this.getUrl();
      }
   } else {
      return res.handlers.images.href("create") + "?name=" + this.name;
   }
   return HopObject.prototype.href.apply(this, arguments);
};

Image.prototype.main_action = function() {
   res.data.title = gettext("Image {0}", this.name);
   res.data.body = this.renderSkinAsString("Image#main");
   res.handlers.site.renderSkin("Site#page");
   return;
};

Image.prototype.edit_action = function() {
   if (req.postParams.save) {
      this.update(req.postParams);
      res.message = gettext("The changes were saved successfully.");
      res.redirect(this.href());
   }
   res.data.action = this.href(req.action);
   res.data.title = gettext("Edit image {0}", this.name);
   res.data.body = this.renderSkinAsString("Image#edit");
   res.handlers.site.renderSkin("Site#page");
   return;
};

Image.prototype.getFormValue = function(name) {
   if (req.isPost()) {
      return req.postParams[name];
   }
   switch (name) {
      case "file":
      return this.url || this.name;
      case "maxWidth":
      case "maxHeight":
      return this[name] || 400;
      case "tags":
      return this.getTags();
   }
   return this[name] || req.queryParams[name];
};

Image.prototype.update = function(data) {
   if (data.uploadError) {
      // looks like the file uploaded has exceeded uploadLimit ...
      throw Error(gettext("Oy, this file is exceeding the upload limit. Please try to decrease its size."));
   }
      
   var upload = data.file_upload;
   if (!upload && data.url && data.url !== this.url) {
      this.url = data.url;
      upload = getURL(data.url);
   }

   if (upload && upload.contentLength > 0) {
      if (!Image.validateType(upload.contentType)) {
         throw Error(gettext("Unrecognized file extension. Are you sure this is an image?"));
      }
      
      this.name || (this.name = this.getAccessName(data.name || upload.name));
      this.contentLength = upload.contentLength;
      this.contentType = upload.contentType;
      var file = this.getFile();

      var image = Image.writeToFile(upload, file, 
            data.maxWidth, data.maxHeight);
      this.width = image.width;
      this.height = image.height;
      
      if (this.width > Image.THUMBNAILWIDTH) {
         file = this.getThumbnailFile();
         image = Image.writeToFile(upload, file, 
               Image.THUMBNAILWIDTH);
         this.thumbnailName = file.getName();
         this.thumbnailWidth = image.width; 
         this.thumbnailHeight = image.height; 
      }
   } else if (this.isTransient()) {
      throw Error(gettext("There was nothing to upload. Please be sure to choose a file."));
   }

   this.description = data.description;
   this.setTags(data.tags || data.tag_array)
   this.touch();
   return;
};

Image.prototype.tags_macro = function() {
   return res.write(this.getFormValue("tags"));
};

Image.prototype.contentLength_macro = function() {
   res.write((this.contentLength / 1024).format("###,###") + " KB");
   return;
};

Image.prototype.url_macro = function() {
   return res.write(this.url || this.getUrl());
};

Image.prototype.macro_macro = function() {
   return HopObject.prototype.macro_macro.call(this, null,  
         this.parent.constructor === Layout ? "layout.image" : "image");
};

Image.prototype.thumbnail_macro = function() {
   if (!this.thumbnailWidth || !this.thumbnailHeight) {
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
};

Image.prototype.render_macro = function(param) {
   param.src = this.getUrl();
   param.title || (param.title = encode(this.description));
   param.width || (param.width = this.width);
   param.height || (param.height = this.height);
   param.border || (param.border = 0);
   param.alt = encode(param.alt || param.title);
   return html.tag("img", param);
};

Image.prototype.getFile = function(name) {
   name || (name = this.name);
   if (this.parent_type === "Layout") {
      var layout = this.parent || res.handlers.layout;
      return layout.getFile(name);
   }
   var site = this.parent || res.handlers.site;
   return site.getStaticFile("images/" + name);
};

Image.prototype.getUrl = function(name) {
   name || (name = this.name);
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
};

Image.prototype.getThumbnailFile = function() {
   return this.getFile(this.thumbnailName || 
         this.name.replace(/(\.[^.]+)?$/, "_small$1"));
};

Image.writeToFile = function(mime, file, maxWidth, maxHeight) {
   if (mime.contentType.endsWith("ico")) {
      mime.writeToFile(file.getParent(), file.getName());
      return {};
   }

   var image = new helma.Image(mime.inputStream);
   var factorH = 1, factorV = 1;
   if (maxWidth && image.width > maxWidth) {
      factorH = maxWidth / image.width;
   }
   if (maxHeight && image.height > maxHeight) {
      factorV = maxHeight / image.height;
   }

   try {
      if (factorH !== 1 || factorV !== 1) {
         var width = Math.ceil(image.width * 
               (factorH < factorV ? factorH : factorV));
         var height = Math.ceil(image.height * 
               (factorH < factorV ? factorH : factorV));
         image.resize(width, height);
         if (mime.contentType.endsWith("gif")) {
            image.reduceColors(256);
         }
         image.saveAs(file);
      } else {
         mime.writeToFile(file.getParent(), file.getName());
      }
   } catch (ex) {
      app.log(ex);
      throw Error(gettext("Oops, couldn't save the image on disk."));
   }
   return image;
};

Image.prototype.getJSON = function() {
   return {
      name: this.name,
      url: this.url,
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
};

Image.validateType = function(type) {
   switch (type) {
      case "image/x-icon":
      case "image/gif":
      case "image/jpeg":
      case "image/pjpeg":
      case "image/png":
      case "image/x-png":
      return true;
   }
   return false;
};

Image.remove = function() {
   this.getFile().remove();
   var thumbnail = this.getThumbnailFile();
   if (thumbnail) {
      thumbnail.remove();
   }
   // FIXME: Don't use Story.prototype.setTags tor remove the tags of the image
   //Story.prototype.setTags.call(this, null);
   // Finally, remove the image iself
   this.remove();
   return;
};

Image.THUMBNAILWIDTH = 100;
