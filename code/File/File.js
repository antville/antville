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

File.prototype.constructor = function() {
   this.creator = this.modifier = session.user;
   this.created = this.modified = new Date;
   this.requests = 0;
   return this;
};

File.prototype.getPermission = function(action) {
   if (!this._parent.getPermission("main")) {
      return false;
   }
   switch (action) {
      case ".":
      case "main":
      return true;
      case "delete":
      case "edit":
      return this.creator === session.user || 
            Membership.require(Membership.MANAGER) ||
            User.require(User.PRIVILEGED);            
   }
   return false;
};

File.prototype.main_action = function() {
   if (Membership.require(Membership.SUBSCRIBER) &&
         User.require(User.REGULAR)) {
      this.requests += 1;
   }
   return res.redirect(this.getUrl());
};

File.prototype.edit_action = function() {
   if (req.postParams.save) {
      this.update(req.postParams);
      res.message = gettext();
      res.redirect(this._parent.href());
   }
   
   res.data.action = this.href(req.action);
   res.data.title = gettext("Edit file {0}", this.alias);
   res.data.body = this.renderSkinAsString("File#edit");
   return this.site.renderSkin("page");
};

File.prototype.getFormValue = function(name) {
   if (req.isPost()) {
      return req.postParams[name];
   }
   switch (name) {
      case "file":
      return this.name;
   }
   return this[name];
}

File.prototype.update = function(data) {
   if (data.uploadError) {
      // looks like the file uploaded has exceeded uploadLimit ...
      throw Error(gettext("Oy, this file is exceeding the upload limit. Please try to decrease its size."));
   }
      
   var upload = data.file_upload;
   if (data.url && data.url !== this.url) {
      this.url = data.url;
      upload = getURL(data.url);
   }

   if (upload && upload.contentLength > 0) {
      this.name || (this.name = this.getAccessName(data.name || upload.name));
      this.contentLength = upload.contentLength;
      this.contentType = upload.contentType;
      var file = this.getFile();
      upload.writeToFile(file.getParent(), file.getName());
   } else if (this.isTransient()) {
      throw Error(gettext("There was nothing to upload. Please be sure to choose a file."));
   }

   this.description = data.description;
   this.touch();
   // FIXME: Don't set the tags of the image via Story.prototype.setTags
   //Story.prototype.setTags.call(this, data.tags || data.tags_array); 
   return;
};

File.prototype.url_macro = function() {
   return res.write(this.url || this.getUrl());
};

File.prototype.contentLength_macro = function(param) {
   return res.write((this.contentLength / 1024).format("###,###") + " KB");
};

File.prototype.getFile = function() {
   var site = this.parent || res.handlers.site;
   return site.getStaticFile("files/" + this.name);
};

File.prototype.getUrl = function() {
   var site = this.parent || res.handlers.site;
   return site.getStaticUrl("files/" + this.name);
};
   
File.remove = function() {
   if (this.constructor === File) {
      this.getFile().remove();
      this.remove();
   }
   return;
};
