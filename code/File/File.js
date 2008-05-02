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
this.handleMetadata("fileName");

File.remove = function() {
   if (this.constructor === File) {
      this.getFile().remove();
      this.remove();
   }
   return;
}

File.getName = function(name) {
   if (name) {
      //return name.replace(/[^\w\d\s._-]/g, String.EMPTY);
      return name.replace(/[\/\\:;?+\[\]{}|#"`<>^]/g, String.EMPTY);
   }
   return null;
}

File.prototype.constructor = function() {
   this.creator = this.modifier = session.user;
   this.created = this.modified = new Date;
   this.requests = 0;
   return this;
}

File.prototype.getPermission = function(action) {
   switch (action) {
      case ".":
      case "main":
      return true;
      case "delete":
      case "edit":
      return this._parent.getPermission("main") &&
            this.creator === session.user || 
            Membership.require(Membership.MANAGER) ||
            User.require(User.PRIVILEGED);            
   }
   return false;
}

File.prototype.main_action = function() {
   if (Membership.require(Membership.SUBSCRIBER) &&
         User.require(User.REGULAR)) {
      this.requests += 1;
   }
   return res.redirect(this.getUrl());
}

File.prototype.edit_action = function() {
   if (req.postParams.save) {
      try {
         this.update(req.postParams);
         res.message = gettext("The changes were saved successfully.");
         res.redirect(this._parent.href());
      } catch (ex) {
         res.message = ex;
         app.log(ex);
      }
   }
   
   res.data.action = this.href(req.action);
   res.data.title = gettext("Edit file {0}", this.name);
   res.data.body = this.renderSkinAsString("$File#edit");
   return this.site.renderSkin("Site#page");
}

File.prototype.getFormValue = function(name) {
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
   }
   return this[name];
}

File.prototype.update = function(data) {
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
            throw Error(gettext("Could not fetch the file from the given URL."));
         }
      }

      this.origin = data.file_origin;
      var mimeName = mime.normalizeFilename(mime.name);
      this.contentLength = mime.contentLength;
      this.contentType = mime.contentType;
      
      if (!this.name) {
          var name = File.getName(data.name) || mimeName.split(".")[0];
          this.name = this.site.files.getAccessName(name);
      }

      // Make the file persistent before proceeding with writing 
      // it to disk (also see Helma bug #607)
      this.isTransient() && this.persist();

      var extension = mimeName.substr(mimeName.lastIndexOf(".")) || String.EMPTY;
      var fileName = this.name + extension;
      if (fileName !== this.fileName) {
         // Remove existing file if the file name has changed
         this.getFile().remove();
      }
      this.fileName = fileName;
      var file = this.getFile();
      mime.writeToFile(file.getParent(), file.getName());
   }
      
   // FIXME: one day? 
   //this.setTags(data.tags || data.tag_array); 
   this.description = data.description;
   this.touch();
   return;
}

File.prototype.url_macro = function() {
   return res.write(this.url || this.getUrl());
}

File.prototype.contentLength_macro = function(param) {
   return res.write((this.contentLength / 1024).format("###,###") + " KB");
}

File.prototype.getFile = function() {
   var site = this.parent || res.handlers.site;
   return site.getStaticFile("files/" + this.fileName);
}

File.prototype.getUrl = function() {
   var site = this.parent || res.handlers.site;
   return site.getStaticUrl("files/" + this.fileName);
}
