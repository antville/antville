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

Layout.VALUES = [
   "background color",
   "link color",
   "active link color",
   "visited link color",
   "big font",
   "big font size",
   "big font color",
   "base font",
   "base font size",
   "base font color",
   "small font",
   "small font size",
   "small font color"
];

Layout.remove = function(layout) {
   layout || (layout = this);
   if (layout.constructor === Layout) {
      Skins.remove.call(layout.skins);
      Images.remove.call(layout.images);
      layout.getFile().removeDirectory();
   }
   return;
}

Layout.getModes = defineConstants(Layout, "default", "shared");

this.handleMetadata("title");
this.handleMetadata("description");
this.handleMetadata("origin");
this.handleMetadata("originator");
this.handleMetadata("originated");

Layout.prototype.constructor = function(site) {
   this.site = site;
   this.creator = session.user;
   this.created = new Date;
   this.mode = Layout.DEFAULT;
   this.touch();
   return this;
}

Layout.prototype.getPermission = function(action) {
   switch (action) {
      case ".":
      case "main":
      case "export":
      case "images":
      case "import":
      case "reset":
      case "skins":
      return res.handlers.site.getPermission("main") &&
            Membership.require(Membership.OWNER) ||
            User.require(User.PRIVILEGED);
   }
   return false;
}

// FIXME: The Layout.href method is overwritten to guarantee that
// URLs won't contain the layout ID instead of "layout"
Layout.prototype.href = function(action) {
   res.push();
   res.write(res.handlers.site.href());
   res.write("layout/");
   action && res.write(action);
   return res.pop();
}

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
   res.data.body = this.renderSkinAsString("$Layout#main");
   res.handlers.site.renderSkin("Site#page");
   return;
}

Layout.prototype.getFormOptions = function(name) {
   switch (name) {
      case "mode":
      return Layout.getModes();
      case "parent":
      return this.getParentOptions();
   }
}

Layout.prototype.update = function(data) {
   var skin = this.skins.getSkin("Site", "values");
   if (!skin) {
      skin = new Skin("Site", "values");
      this.skins.add(skin);
   }
   res.push();
   for (var key in data) {
      if (key.startsWith("value_")) {
         var value = data[key];
         key = key.substr(6);
         res.write("<% value ");
         res.write(quote(key));
         res.write(" ");
         res.write(quote(value));
         res.write(" %>\n");
      }
   }
   res.write("\n");
   skin.setSource(res.pop());
   this.description = data.description;
   this.mode= data.mode;
   this.touch();
   return;
}

Layout.prototype.reset_action = function() {
   if (req.data.proceed) {
      try {
         Layout.remove.call(this);
         var skinFiles = app.getSkinfilesInPath(res.skinpath);
         var content, file;
         for (var name in skinFiles) {
            if (content = skinFiles[name][name]) {
               var dir = this.getFile(name);
               var file = new helma.File(dir, name + ".skin");
               dir.makeDirectory();
               file.open();
               file.write(content);
               file.close();
            }
         }
         res.message = gettext("The layout was successfully reset.");
         res.redirect(this.href());
      } catch(ex) {
         res.message = ex;
         app.log(ex);
      }
   }

   res.data.action = this.href(req.action);
   res.data.title = gettext("Confirm reset of {0}", this);
   res.data.body = this.renderSkinAsString("$HopObject#confirm", {
      text: gettext('You are about to reset {0}.', this)
   });
   res.handlers.site.renderSkin("Site#page");
}

Layout.prototype.export_action = function() {
   var zip = this.getArchive(res.skinpath);
   res.contentType = "application/zip";
   res.setHeader("Content-Disposition", 
         "attachment; filename=" + this.site.name + "-layout.zip");
   res.writeBinary(zip.getData());
   return;
}

Layout.prototype.import_action = function() {
   var data = req.postParams;
   if (data.submit) {
      try {
         if (!data.upload || data.upload.contentLength === 0) {
            throw Error(gettext("Please upload a layout package."));
         }
         Layout.remove(this);
         res.commit();
         // Create destination directory
         var destination = this.getFile();
         destination.makeDirectory();
         // Extract imported layout to temporary directory
         var dir = new helma.File(destination, "..");
         var temp = new helma.File(dir, "import.temp");
         var fname = data.upload.writeToFile(dir);
         var zip = new helma.File(dir, fname);
         (new helma.Zip(zip)).extractAll(temp);
         zip.remove();
         var data = Xml.read(new helma.File(temp, "data.xml"));
         if (!data.version || data.version !== Root.VERSION) {
            throw Error("Incompatible layout version.");
         }
         // Backup the current layout if necessary
         if (destination.list().length > 0) {
            var timestamp = (new Date).format("yyyyMMdd-HHmmss");
            var zip = new helma.Zip();
            zip.add(destination);
            zip.save(this.getFile("../layout-" + timestamp + ".zip"));
            zip.close();
         }
         temp.renameTo(destination);
         // Update database with imported data
         layout = this;
         this.origin = data.origin;
         this.originator = data.originator;
         this.originated = data.originated;
         data.images.forEach(function() {
            layout.images.add(new Image(this));
         });
         res.redirect(this.href());
         return;
      } catch (ex) {
         res.message = ex;
         app.log(ex);
      }
   }
   res.data.title = gettext("Import layout");
   res.data.body = this.renderSkinAsString("$Layout#import");
   res.handlers.site.renderSkin("Site#page");
   return;
}

Layout.prototype.getTitle = function() {
   return "Layout";
}

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
}

Layout.prototype.getFile = function(name) {
   name || (name = String.EMPTY);
   return this.site.getStaticFile("layout/" + name);
}

Layout.prototype.getSkinPath = function() {
   if (!this.site) {
      return null;
   }
   var skinPath = [this.getFile().toString()];
   return skinPath;
}

Layout.prototype.getArchive = function(skinPath) {
   var zip = new helma.Zip();
   var skinFiles = app.getSkinfilesInPath(skinPath);
   for (var name in skinFiles) {
      if (skinFiles[name][name]) {
         zip.add(new helma.File(this.getFile(name), name + ".skin"), name);
      }
   }
   

/*  var file, fname;
   var dir = new helma.File(app.dir);
   for each (var fpath in dir.listRecursive(/\.skin$/)) {
      fname = fpath.split("/").splice(-2)[0];
      file = new helma.File(fpath);
      try {
         zip.add(file, "layout/" + fname);
      } catch (ex) {
         app.log(ex);
      }
   } */
   
   var data = new HopObject;
   data.images = new HopObject;
   this.images.forEach(function() {
      zip.add(this.getFile());
      zip.add(this.getThumbnailFile());
      var image = new HopObject;
      for each (var key in Image.KEYS) {
         image[key] = this[key];
         data.images.add(image);
      }
   });
      
   data.version = Root.VERSION;
   data.origin = this.origin || this.site.href();
   data.originator = this.originator || session.user.name;
   data.originated = this.originated || new Date;
   
   // FIXME: XML encoder is losing all mixed-case properties :(
   var xml = new java.lang.String(Xml.writeToString(data));
   zip.addData(xml.getBytes("UTF-8"), "data.xml");
   zip.close();
   return zip;
}

Layout.prototype.getMacroHandler = function(name) {
   switch (name) {
      case "skins":
      return this[name];
      
      default:
      return null;
   }
}

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
      return res.write(image.getUrl());
      case "thumbnail" :
      action || (action = image.getUrl());
      return image.thumbnail_macro(param);
   }
   image.render_macro(param);
   return;
}

Layout.prototype.values_macro = function() {
   var values = [];
   for (var key in res.meta.values) {
      values.push({key: key, value: res.meta.values[key]});
   }
   values.sort(new String.Sorter("key"));
   for each (var pair in values) {
      this.renderSkin("$Layout#value", {
         key: pair.key.capitalize(), 
         value: pair.value
      });
   }
   return;
}
