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

Layout.getModes = defineConstants(Layout, "default", "shared");

this.handleMetadata("title");
this.handleMetadata("description");
this.handleMetadata("origin");
this.handleMetadata("originator");
this.handleMetadata("originated");

Layout.prototype.constructor = function(site) {
   this.site = site;
   //this.title = title;
   this.creator = session.user;
   this.created = new Date;
   this.mode = Layout.DEFAULT;
   this.touch();
   return this;
};

Layout.prototype.getPermission = function(action) {
   if (!res.handlers.site.getPermission("main")) {
      return false;
   }
   switch (action) {
      case ".":
      case "main":
      case "export":
      case "images":
      case "import":
      case "skins":
      return true;
   }
   return false;
};

Layout.prototype.main_action = function() {
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
   res.data.title = gettext("Layout of site {0}", res.handlers.site.title);
   res.data.body = this.renderSkinAsString("Layout#main");
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

Layout.prototype.export_action = function() {
   var zip = new helma.Zip();
   for each (var fpath in res.skinpath) {
      zip.add(new helma.File(fpath), "layout");
   }
   var file, prototype;
   var dir = new helma.File(app.dir);
   for each (var fpath in dir.listRecursive(/\.skin$/)) {
      prototype = fpath.split("/").splice(-2)[0];
      file = new helma.File(fpath);
      try {
         zip.add(file, "layout/" + prototype);
      } catch (ex) {
         app.log(ex);
      }
   }
   var data = new HopObject;
   data.images = new HopObject;
   this.images.forEach(function() {
      var keys = ["name", "width", "height", "description", "contentLength", 
            "thumbnailName", "thumbnailWidth", "thumbnailHeight"];
      var image = new HopObject;
      for each (var key in keys) {
         image[key] = this[key];
         data.images.add(image);
      }
   });
   data.origin = this.metadata.get("origin") || this.href();
   data.originator = this.metadata.get("originator") || session.user.name;
   data.originated = this.metadata.get("originated") || new Date;
   var xml = new java.lang.String(Xml.writeToString(data));
   zip.addData(xml.getBytes("UTF-8"), "data.xml");
   zip.close();
   
   res.contentType = "application/zip";
   res.setHeader("Content-Disposition", 
         "attachment; filename=" + this.site.name + "-layout.zip");
   res.writeBinary(zip.getData());
   return;
};

Layout.prototype.import_action = function() {
   var data = req.postParams;
   if (data.submit) {
      // Create destination directory if it does not exist
      var destination = this.getFile();
      if (!destination.exists()) {
         destination.makeDirectory();
      }
      // Extract imported layout to temporary directory
      var temp = new helma.File(destination, "../import.temp");
      var file = data.upload.writeToFile(new helma.File(destination, ".."));
      var zip = new helma.Zip(file);
      zip.extractAll(temp);
      (new helma.File(file)).remove();
      // Backup the current layout if necessary
      if (destination.list().length > 0) {
         var timestamp = (new Date).format("yyyyMMdd-HHmmss");
         zip = new helma.Zip();
         zip.add(destination);
         zip.save(this.getFile("../layout-" + timestamp + ".zip"));
         zip.close();
      }
      // Clear database from obsolete data
      Images.remove.call(this.images);
      Skins.remove.call(this.skins);
      res.commit();
      // Replace the current layout with the imported one
      var layout = new helma.File(temp, "layout");
      layout.renameTo(destination);
      // Update database with imported data
      layout = this;
      var data = Xml.read(new helma.File(temp, "data.xml"));
      this.metadata.set("origin", data.origin);
      this.metadata.set("originator", data.originator);
      this.metadata.set("originated", data.originated)
      data.images.forEach(function() {
         layout.images.add(new Image(this));
      });
      res.redirect(this.href());
      return;
   }
   res.data.title = gettext("Import layout");
   res.data.body = this.renderSkinAsString("Layout#import");
   res.handlers.site.renderSkin("page");
   return;
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

Layout.prototype.getFile = function(name) {
   name || (name = String.EMPTY);
   return this.site.getStaticFile("layout/" + name);
};

Layout.prototype.getSkinPath = function() {
   if (!this.site) {
      return null;
   }

   var skinPath = [this.getFile().toString()];
   this.parent && (skinPath.push(this.parent.getFile().toString()));
   return skinPath;
   
   var layout = this;
   do {
      res.push();
      res.write(getProperty("staticPath"));
      layout.site && res.write(layout.site.name + "/");
      res.write("layouts/");
      res.write(layout.name);
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

Layout.prototype.getTitle = function() {
   return "Layout";
};
