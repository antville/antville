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

Tag.MOUNTPOINTS = {
   Story: "tags",
   Image: "galleries"
}

Tag.prototype.constructor = function(name, site, type) {
   this.name = name;
   this.site = site;
   this.type = type;
   return this;
}

Tag.prototype.getPermission = function(action) {
   switch (action) {
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
   res.data.body = this.renderSkinAsString("$Tag#main");
   res.handlers.site.renderSkin("Site#page");
   return;
}

Tag.prototype.rss_xml_action = function() {
   res.dependsOn(this.lastUpdate);
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
      tag = this.site.getTags(this.type, Tags.ALL).get(req.data.name);
      if (!tag) {
         tag = new Tag(req.data.name, this.site, this.type);
         this.site.$tags.add(tag);
      }
      this.forEach(function() { 
         this.tag_id = tag._id;
      });
      this.remove();
      res.commit();
   }
   res.redirect(tag.href());
}

Tag.prototype.delete_action = function() {
   var parent = this._parent;
   while (this.size() > 0) {
      this.get(0).remove();
   };
   this.remove();
   res.redirect(this.site[Tag.MOUNTPOINTS[this.type]].href());
}

Tag.prototype.href = function(action) {
   //res.debug(HopObject.prototype.href.call(root, "test", this.name));
   res.push();
   //res.write(this.site.getTags(this.type, Tags.ALL).href());
   res.write(this.site[Tag.MOUNTPOINTS[this.type]].href());
   //res.write(java.net.URLEncoder.encode(this.name));
   res.write(encodeURIComponent(this.name));
   res.write("/");
   if (action) {
      res.write(java.net.URLEncoder.encode(action));
   }
   return res.pop();
}

Tag.prototype.permission_macro = function(param, type) {
   return this.getPermission(type);
}

// FIXME: b/w compatibility
Tag.prototype.checkAccess = function(action, user, level) {
   try {
      if (!this.getPermission(action)) {
         throw DenyException("FIXME");
      }
   } catch(ex) {
      res.message = ex.toString();
      res.redirect(this.site.href());
   }
}

Tag.prototype.getTagged = function() {
   return this[pluralize(this.type)];
}

Tag.prototype.getTitle = function() {
   return this.name;
}

Tag.prototype.toString = function() {
   return "[" + this.type + " tag ``" + this.name + "'' of Site ``" + 
       this.site.alias + "'']";
}
