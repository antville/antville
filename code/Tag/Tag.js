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
 * @fileOverview Defines the Tag prototype.
 */

/**
 * @constant
 */
Tag.MOUNTPOINTS = {
   Story: "tags",
   Image: "galleries"
}

/**
 * @name Tag
 * @constructor
 * @param {String} name
 * @param {Site} site
 * @param {String} type
 * @property {TagHub[]} _children
 * @property {Images[]} images
 * @property {String} name
 * @property {Site} site
 * @property {Story[]} stories
 * @property {String} type
 * @extends HopObject
 */
Tag.prototype.constructor = function(name, site, type) {
   this.name = name;
   this.site = site;
   this.type = type;
   return this;
}

/**
 * 
 * @param {String} action
 * @returns {Boolean}
 */
Tag.prototype.getPermission = function(action) {
   if (!res.handlers.site.getPermission("main")) {
      return false;
   }
   switch (action) {
      case ".":
      case "main":
      case "rss.xml":
      return true;
      case "edit":
      case "delete":
      case "rename":
      return User.require(User.PRIVILEGED) ||
            Membership.require(Membership.MANAGER);
   }   
   return false;
}

Tag.prototype.main_action = function() {
   res.handlers.list = new jala.ListRenderer(this.getTagged());
   res.handlers.list.setPageSize(this.site.pageSize);
   res.data.title = gettext("Tag: {0}", this.name);
   res.data.body = this.renderSkinAsString("$Tag#main");
   res.handlers.site.renderSkin("Site#page");
   res.handlers.site.log();
   return;
}

Tag.prototype.rss_xml_action = function() {
   res.dependsOn(this.site.modified);
   res.digest();
   res.contentType = "text/xml";
   var tagHubs = this.getTagged().list(0, this.site.pageSize);
   var stories = [];
   for (var i in tagHubs) {
      stories.push(tagHubs[i].tagged);
   }
   res.write(this.site.getXml(stories));
   return;
}

Tag.prototype.rename_action = function() {
   var tag = this;
   if (req.data.name) {
      // Trim and remove troublesome characters  (like ../.. etc.)
      // We call getAccessName with a virgin HopObject to allow most names
      var name = this.getAccessName.call(new HopObject, File.getName(req.data.name));
      tag = this.site.getTags(this.type, Tags.ALL).get(name);
      if (!tag) {
         tag = new Tag(name, this.site, this.type);
         this.site.$tags.add(tag);
      }
      if (tag !== this) {
         this.forEach(function() { 
            this.tag_id = tag._id;
         });
         this.remove();
         res.commit();
      }
   }
   res.redirect(tag.href());
   return;
   
   // FIXME: Actually, the method should work like this but it caused a mess:
   if (req.data.name) {
      var name = this.getAccessName.call(new HopObject, File.getName(req.data.name));
      var tag = this.site.getTags(this.type, Tags.ALL).get(name);
      if (tag) {
         if (tag !== this) {
            // move tagged items to tag like above
         }
      } else {
         // rename tag like: this.name = name
      }
   }
}

Tag.prototype.delete_action = function() {
   var parent = this._parent;
   while (this.size() > 0) {
      this.get(0).remove();
   };
   this.remove();
   res.redirect(this.site[Tag.MOUNTPOINTS[this.type]].href());
}

/**
 * 
 * @param {String} action
 * @returns {String}
 */
Tag.prototype.href = function(action) {
   res.push();
   res.write(this.site[Tag.MOUNTPOINTS[this.type]].href());
   res.write(encodeURIComponent(this.name));
   res.write("/");
   if (action) {
      res.write(java.net.URLEncoder.encode(action));
   }
   return res.pop();
}

/**
 * 
 * @param {Object} param
 * @param {String} type
 */
Tag.prototype.permission_macro = function(param, type) {
   return this.getPermission(type);
}

/**
 * @returns {Story[]|Image[]}
 */
Tag.prototype.getTagged = function() {
   return this[pluralize(this.type.toLowerCase())];
}

/**
 * @returns {String}
 */
Tag.prototype.getTitle = function() {
   return this.name;
}

/**
 * @returns {String}
 */
Tag.prototype.toString = function() {
   return this.type + " tag " + this.name + " of Site " + this.site.alias;
}
