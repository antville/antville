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

defineConstants(Layout, "getModes", "default", "shared");

this.handleMetadata("title");
this.handleMetadata("description");
this.handleMetadata("copyright");

Layout.prototype.constructor = function(site, title, creator) {
   this.site = site;
   this.title = title;
   this.creator = creator;
   this.created = new Date;
   this.mode = Layout.DEFAULT;
   this.touch();
   return this;
};

Layout.prototype.getPermission = function(action) {
   if (!this._parent.getPermission("main")) {
      return false;
   }
   switch (action) {
      case ".":
      case "main":
      case "edit":
      case "images":
      case "skins":
      return true;
      case "delete":
      return this !== this.site.layout && 
            this.offsprings.size() < 1;
      case "test":
      case "activate":
      return this !== this.site.layout;
   }
   return false;
};

Layout.prototype.main_action = function() {
   res.data.title = gettext("Layout {0}", this.title);
   res.data.body = this.renderSkinAsString("main");
   res.handlers.context.renderSkin("page");
   return;
};

Layout.prototype.edit_action = function() {
   if (req.postParams.save) {
      try {
         this.update(req.postParams);
         res.message = gettext("Successfully updated the layout {0}.", 
               this.title);
         res.redirect(this.href());
      } catch (ex) {
         res.message = ex;
         app.log(ex);
      }
   }

   res.data.action = this.href(req.action);
   res.data.title = gettext("Edit layout {0}", this.title);
   res.data.body = this.renderSkinAsString("edit");
   res.handlers.site.renderSkin("page");
   return;
};

Layout.prototype.getFormOptions = function(name) {
   switch (name) {
      case "mode":
      return Layout.getModes();
      case "parent":
      return this.getParentOptions();
   }
};

Layout.prototype.update = function(data) {
   if (data.name) {
      this.name = this.getAccessName(data.name);
   }
   this.title = data.title.trim() || "Layout #" + this._id;
   this.description = data.description;
   this.copyright = data.copyright;
   if (data.parent) {
      var parent = root.layouts.getById(data.parent);
      if (!parent) {
         throw Error(gettext("Couldn't find the basic layout. Please choose another one."));
      }
      if (parent !== this) {
         this.parent = parent;
      }
   }
   this.mode = data.mode;
   this.touch();
   return;
};

Layout.remove = function() {
   HopObject.remove(this.skins);
   HopObject.remove(this.images);
   this.remove();
   return;
};

Layout.prototype.activate_action = function() {
   if (this !== res.handlers.site.layout) {
      res.handlers.site.layout = this;
   }
   res.redirect(this._parent.href());
   return;
};

Layout.prototype.test_action = function() {
   if (!session.data.layout) {
      session.data.layout = this;
   } else {
      delete session.data.layout;
      res.message = gettext("Switched back to the currently active layout.");
   }
   res.redirect(req.data.http_referer || res.handlers.site.href());
   return;
};

Layout.prototype.export_action = function() {
   var mode;
   if (mode = req.postParams.mode) {
      //try {
         var zip = new helma.Zip();
         this.exportToZip(zip);
         this.images.exportToZip(zip, mode);
         this.skins.exportToZip(zip, mode);
         zip.addData(new java.lang.String({
            source: this.href(),
            created: new Date,
            creator: session.user.name,
            mode: mode
         }.toSource()).getBytes("UTF-8"), "export.js");
         zip.close();
         res.contentType = "application/zip";
         res.setHeader("Content-Disposition", 
               "attachment; filename=" + this.name + ".zip");
         res.writeBinary(zip.getData());
         //res.redirect(this.href());
      /*} catch (ex) {
         res.message = ex;
         app.log(ex);
      }*/
   }
   res.data.action = this.href(req.action);
   res.data.title = gettext("Export layout {0}", this.title);
   res.data.body = this.renderSkinAsString("download");
   res.handlers.context.renderSkin("page");
   return;
};

Layout.prototype.exportToZip = function(zip) {
   var str = new java.lang.String(this.getJSON()).getBytes("UTF-8");
   return zip.addData(str, "layout.js");
};

Layout.prototype.getJSON = function() {
   return {
      title: this.title,
      name: this.name,
      description: this.description,
      created: this.created,
      creator: this.creator ? this.creator.name : null,
      modified: this.modified,
      modifier: this.modifier ? this.modifier.name : null
   }.toSource();
};

Layout.prototype.download_full_zip_action = function() {
   try {
      var data = this.evalDownload(true);
      res.contentType = "application/zip";
      res.writeBinary(data);
   } catch (err) {
      res.message = new Exception("layoutDownload");
      res.redirect(this.href());
   }
   return;
};

Layout.prototype.download_zip_action = function() {
   try {
      var data = this.evalDownload(false);
      res.contentType = "application/zip";
      res.writeBinary(data);
   } catch (err) {
      res.message = new Exception("layoutDownload");
      res.redirect(this.href());
   }
   return;
};

Layout.prototype.value_macro = function(param, name, value) {
   if (!name) {
      return;
   }
   var key = ["layout_" + name];
   if (!value) {
      return res.meta[key];
   } else {
      res.meta[key] = value;
   }
   return;
};

Layout.prototype.image_macro = function(param, name, mode) {
   name || (name = param.name);
   if (!name) {
      return;
   }
   var image = this.getImage(name, param.fallback);
   if (!image) {
      return;
   }

   mode || (mode = param.as);
   var action = param.linkto;
   delete(param.name);
   delete(param.as);
   delete(param.linkto);

   switch (mode) {
      case "url" :
      return image.getUrl();
      case "thumbnail" :
      action || (action = image.getUrl());
      return image.thumbnail_macro(param);
   }
   image.render_macro(param);
   return;
};

Layout.prototype.active_macro = function() {
   return res.write(this.isActive());
};

Layout.prototype.isActive = function() {
   return this === res.handlers.site.layout;
};

Layout.prototype.getStaticDir = function(subdir) {
   var f = new Helma.File(this.getStaticPath(subdir));
   f.mkdir();
   return f;
};

Layout.prototype.setParentLayout = function(parent) {
   this.parent = parent;
   // Offspring layouts cannot be shared
   this.mode = Layout.DEFAULT;
   this.copyright = parent.copyright;
   return;
};

Layout.prototype.getImage = function(name, fallback) {
   var layout = this;
   while (layout) {
      if (layout.images.get(name)) {
         return layout.images.get(name);
      }
      if (fallback && layout.images.get(fallback)) {
         return layout.images.get(fallback);
      }
      layout = layout.parent;
   }
   return null;
};

Layout.prototype.getSkinPath = function() {
   // FIXME: Do we need this or not?
   /* if (!this.site) {
      return [app.dir];
   } */
   var skinPath = [];
   var layout = this;
   do {
      res.push();
      res.write(getProperty("staticPath"));
      layout.site && res.write(layout.site.name + "/");
      res.write("layouts/");
      res.write(layout.alias);
      skinPath.push(res.pop());
   } while (layout = layout.parent);
   return skinPath;

   // FIXME: to be removed
   var sp = [this.skins];
   var handler = this;
   while ((handler = handler.parent) != null) {
      sp.push(handler.skins);
   }
   return sp;
};

Layout.prototype.getParents = function() {
   var parents = new java.util.Hashtable();
   var handler = this;
   while ((handler = handler.parent) != null)
      parents.put(handler._id, true);
   return parents;
};

Layout.prototype.getParentOptions = function() {
   var self = this;
   var commons = [{value: 0, display: "none"}];
   root.layouts.commons.forEach(function() {
      if (this !== self) {
         commons.push({display: this.title, value: this._id});
      } 
   });
   return commons;
};
