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

Skin.getByName = function(group, name) {
   var skinSet = (res.handlers.layout || path.layout).skins.get(group);
   if (skinSet) {
      var skin = skinSet.get(name);
      if (skin) {
         return skin;
      } 
   }
   return null;
}

Skin.remove = function(skin) {
   skin || (skin = this);
   if (skin.constructor === Skin) {
      if (skin.source) {
         skin.setSource(skin.source);
      } 
      skin.source = null;
      skin.remove();
   }
   return;
}

Skin.getPrototypeOptions = function() {
   var prototypes = [];
   var content, file;
   var skinFiles = app.getSkinfilesInPath(res.skinpath);
   for (var name in skinFiles) {
      // Include root skins only for root site
      if (name === root.constructor.name && res.handlers.site !== root) {
         continue;
      }
      if (skinFiles[name][name]) {
         prototypes.push({value: name, display: name});
      }
   }
   return prototypes.sort(new String.Sorter("display"));
}

Skin.prototype.constructor = function(prototype, name) {
   this.prototype = prototype || String.EMPTY;
   this.name = name || String.EMPTY;
   this.creator = this.modifier = session.user;
   this.created = this.modified = new Date;
   return this;
}

Skin.prototype.getPermission = function(action) {
   switch (action) {
      case ".":
      case "main":
      return true;
   }
   return res.handlers.skins.getPermission("main");
}

Skin.prototype.href = function(action) {
   res.push();
   res.write(res.handlers.layout.skins.href());
   res.write(this.prototype);
   res.write("/");
   res.write(this.name);
   res.write("/");
   action && (res.write(action));
   return res.pop();
}

Skin.prototype.main_action = function() {
   if (res.handlers.site === root) {
      res.contentType = "text/plain";
      res.write(this.getSource());
      return;
   }
   res.redirect(this.href("edit"));
   return;
}

Skin.prototype.edit_action = function() {
   if (req.postParams.save) {
      try {
         var url = this.href(req.action);
         this.update(req.postParams);
         res.message = gettext("The changes were saved successfully.");
         if (req.postParams.save == 1) {
            res.redirect(url);
         } else {
            res.redirect(res.handlers.layout.skins.href("modified"));
         }
      } catch (ex) {
         res.message = ex;
         app.log(ex);
      }
   }
   res.data.action = this.href(req.action);
   res.data.title = gettext('Edit skin {0}.{1} of {2}', this.prototype, 
         this.name, res.handlers.site.title);
   res.data.body = this.renderSkinAsString("$Skin#edit");
   res.handlers.skins.renderSkin("$Skins#page");
   return;
}

Skin.prototype.update = function(data) {
   if (this.isTransient()) {
      res.handlers.layout.skins.add(this);
      this.source = this.getSource();
   }
   this.setSource(data.source);   
   this.touch();
   return;
}

Skin.prototype.reset_action = function() {
   if (req.postParams.proceed) {
      try {
         var str = this.toString();
         res.debug(this.source);
         Skin.remove(this);
         res.message = gettext("{0} was successfully reset.", str);
         res.redirect(res.handlers.layout.skins.href("modified"));
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
   res.handlers.skins.renderSkin("$Skins#page");
   return;
}

Skin.prototype.compare_action = function() {
   var originalSkin = this.source || "";
   var diff = originalSkin.diff(this.getSource());
   if (!diff) {
      res.data.status = gettext("No differences were found");
   } else {
      res.push();
      var sp = new Object();
      for (var i in diff) {
         var line = diff[i];
         sp.num = line.num;
         if (line.deleted) {
            sp.status = "DEL";
            sp["class"] = "removed";
            for (var j=0;j<line.deleted.length;j++) {
               sp.num = line.num + j;
               sp.line = encode(line.deleted[j]);
               this.renderSkin("$Skin#difference", sp);
            }
         }
         if (line.inserted) {
            sp.status = "ADD";
            sp["class"] = "added";
            for (var j=0;j<line.inserted.length;j++) {
               sp.num = line.num + j;
               sp.line = encode(line.inserted[j]);
               this.renderSkin("$Skin#difference", sp);
            }
         }
         if (line.value != null) {
            sp.status = "&nbsp;";
            sp["class"] = "line";
            sp.line = encode(line.value);
            this.renderSkin("$Skin#difference", sp);
         }
      }
      res.data.diff = res.pop();
   }
   res.data.title = gettext("Compare versions of skin {0}.{1}", 
         this.prototype, this.name);
   res.data.body = this.renderSkinAsString("$Skin#compare");
   res.handlers.skins.renderSkin("$Skins#page");
   return;
}

Skin.prototype.getFormOptions = function(name) {
   switch (name) {
      case "prototype":
      return Skin.getPrototypeOptions();
   }
}

Skin.prototype.getSource = function() {
   var skinSet = app.getSkinfilesInPath(res.skinpath)[this.prototype];
   if (skinSet) {
      var mainSkin = skinSet[this.prototype];
      if (mainSkin) {
         var skin = createSkin(mainSkin).getSubskin(this.name);
         if (skin) {
            return skin.getSource();
         }
      }
   }
   return null; //String.EMPTY;
}

Skin.prototype.setSource = function(source) {
   var skin = this.getMainSkin();
   if (!skin) {
      return;
   }

   res.push();
   if (source != null) {
      res.writeln("<% #" + this.name + " %>");
      res.writeln(source.trim().replace(/(<%\s*)#/g, "$1// #"));
   }
   var subskins = skin.getSubskinNames();
   for (var i in subskins) {
      if (subskins[i] !== this.name) {
         res.writeln("<% #" + subskins[i] + " %>");
         source = skin.getSubskin(subskins[i]).source;
         source && res.writeln(source.trim());
      }
   }
   source = res.pop();

   var file = this.getStaticFile(res.skinpath[0], skin);   
   if (!file.exists()) {
      file.getParentFile().mkdirs();
      file.createNewFile();
   }
   var fos = new java.io.FileOutputStream(file);
   var bos = new java.io.BufferedOutputStream(fos);
   var writer = new java.io.OutputStreamWriter(bos, "UTF-8");
   writer.write(source);
   writer.close();
   bos.close();
   fos.close();

   this.clearCache();
   return;
}

Skin.prototype.getStaticFile = function(fpath, skin) {
   return new java.io.File(fpath, this.prototype + "/" + 
         this.prototype + ".skin");
}

Skin.prototype.getMainSkin = function() {
   var skinSet = app.getSkinfilesInPath(res.skinpath)[this.prototype];
   if (skinSet && skinSet[this.prototype]) {
      return createSkin(skinSet[this.prototype]);
   }
   return null;
}

Skin.prototype.render = function() {
   return renderSkin(createSkin(this.getSource()));
}

Skin.prototype.equals = function(source) {
   // FIXME: The removal of linebreaks is necessary but it's not very nice
   var re = /\r|\n/g;
   var normalize = function(str) {
      return str.replace(re, String.EMPTY);
   }
   return normalize(source) === normalize(this.getSource());
}

Skin.prototype.toString = function() {
   return "Skin #" + this._id + ": " + this.prototype + "." + this.name;
}

Skin.prototype.status_macro = function() {
   return this.isTransient() ? "inherited" : "modified"; 
}

Skin.prototype.content_macro = function() {
   return res.write(this.getSource());
}
