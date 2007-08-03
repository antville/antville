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

Tag.prototype.constructor = function(name, site, type) {
   this.name = name;
   this.site = site;
   this.type = type;
   return this;
};

Tag.prototype.main_action = function() {
   res.handlers.list = new jala.ListRenderer(this.getCollection(this.type));
   res.data.body = this.renderSkinAsString("Tag");
   res.handlers.site.renderSkin("page");
   return;
};

Tag.prototype.href = function() {
   var mountpoint;
   switch (this.type) {
      case "Story":
      mountpoint = "stories";
      break;
      case "Image":
      mountpoint = "images";
      break;
   }
   return this.site[mountpoint].tags.href() + encodeURIComponent(this.name);
};

Tag.prototype.getCollection = function(type) {
   switch (type) {
      case "Story":
      return this.stories;
      case "Image":
      return this.images;
      default:
      return this;
   }
};

Tag.prototype.getNavigationName  = function() {
   return this.name;
};

Tag.prototype.toString = function() {
   return "[Tag ``" + this.name + "'' of Site ``" + this.site.alias + "'']";
};
