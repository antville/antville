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

this.handleMetadata("fileName");
relocateProperty(Image, "alias", "name");
relocateProperty(Image, "createtime", "created");
relocateProperty(Image, "modifytime", "modified");
relocateProperty(Image, "fileext", "contentType");
relocateProperty(Image, "filesize", "contentLength");
relocateProperty(Image, "alttext", "description");

// FIXME: obsolete?
Image.getCompatibleFileName = function(image, name) {
   var fname = image.metadata.get("fileName");
   if (fname) {
      return name.replace(/\/[^\/]*$/, "/" + fname);
   }
   return name;
}

/*Image.prototype.getFile = function(name) {
   name || (name = Image.getCompatibleFileName(this));
   if (res.handlers.images._parent.constructor === Layout) {
      return Site.getStaticFile(name, "layouts/" + res.handlers.layout.name);
   }
   return Site.getStaticFile("images/" + name);
};*/

Image.prototype.code_macro = Image.prototype.macro_macro;

Image.prototype.filename_macro = function() {
   return this.name;
}

Image.prototype.topicchooser_macro = function() {
   return Story.prototype.topicchooser_macro.apply(this, arguments);
}

Image.prototype.gallery_macro = function() {
   return Story.prototype.topic_macro.apply(this, arguments);
}

Image.prototype.topic_macro = Image.prototype.gallery_macro;

Image.prototype.show_macro = function(param) {
   if (param.as === "thumbnail" && this.thumbnailWidth) {
      res.push();
      this.thumbnail_macro(param);
      this.link_filter(res.pop(), param, this.href());
   } else {
      this.render_macro(param);
   }
   return;
}

Image.prototype.editlink_macro = function(param) {
   res.push();
   if (param.image && this.parent.images.get(param.image)) {
      renderImage(this.parent.images.get(param.image), param);
   } else {
      res.write(param.text || gettext("edit"));
   }   
   return this.link_macro(param, "edit", res.pop());
}

Image.prototype.deletelink_macro = function(param) {
   res.push();
   if (param.image && this.parent.images.get(param.image)) {
      renderImage(this.parent.images.get(param.image), param);
   } else {
      res.write(param.text || gettext("delete"));
   }   
   return this.link_macro(param, "delete", res.pop());
}

Image.prototype.replacelink_macro = function(param) {
   return;
}

Image.prototype.getPopupUrl = function() {
   res.push();
   res.write("javascript: openPopup('");
   res.write(this.getUrl());
   res.write("',");
   res.write(this.width);
   res.write(",");
   res.write(this.height);
   res.write("); return false;");
   return res.pop();
}
