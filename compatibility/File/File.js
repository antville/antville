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

relocateProperty(Site, "createtime", "created");
relocateProperty(Site, "modifytime", "modified");

delete File.prototype.createtime_macro;
delete File.prototype.modifytime_macro;

File.getCompatibleFileName = function(file, name) {
   name || (name = file.name);
   return file.metadata.get("fileName") || name;
};

File.prototype.getFile = function() {
   return res.handlers.site.getStaticFile("files/" + 
         File.getCompatibleFileName(this));
};

File.prototype.getUrl = function() {
   return res.handlers.site.getStaticUrl("files/" + 
         File.getCompatibleFileName(this));
};

File.prototype.alias_macro = function(param) {
   if (param.as === "editor") {
      this.input_macro(param, "name");
   } else if (param.as === "link") {
      param.title = encodeForm(this.description);
      this.link_filter(this.name, param, this.href());
   } else {
      res.write(this.name);
   }
   return;
};

File.prototype.description_macro = function(param) {
   if (param.as === "editor") {
      this.input_macro(param, "description");
   } else {
      res.write(this.description);
   }
   return;
};

File.prototype.filesize_macro = function(param) {
   return this.contentLength_macro(param);
};

File.prototype.editlink_macro = function(param) {
   return this.link_macro(param, "edit", param.text || gettext("edit"));
};

File.prototype.deletelink_macro = function(param) {
   res.push();
   var image;
   if (param.image && (image = this.site.images.get(param.image))) {
      image.render_macro(param);
   } else {
      res.write(param.text || gettext("delete"));
   }
   return this.link_macro(param, "delete", res.pop());
};

File.prototype.viewlink_macro = function(param) {
   param.title = encodeForm(this.description);
   return this.link_macro(param, ".", param.text || gettext("view"))
};

File.prototype.mimetype_macro = function(param) {
   return res.write(this.contentType);
};

File.prototype.filetype_macro = function(param) {
   if (this.contentType) {
      res.write(this.contentType.substring(this.contentType.indexOf("/") + 1));
   } else {
      var i = this.name.lastIndexOf(".");
      if (i > -1) {
         res.write(this.name.substring(i+1, this.name.length));
      }
   }
   return;
};

File.prototype.clicks_macro = function(param) {
   if (!this.requests) {
      res.write(param.no || gettext("no downloads"));
   } else if (this.requests < 2) {
      res.write(param.one || gettext("one download"));
   } else {
      res.write(param.more ? this.requests + " " + param.more : 
            gettext("{0} downloads", this.requests));
   }
   return;
};
