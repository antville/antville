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

Skin.CUSTOMIZABLE_PROTOTYPES = ["Archive", "Choice", "Comment", "File", 
      "Global", "Image", "Membership", "Poll", "Site", "Story", "Tag"];

Skin.prototype.constructor = function(prototype, name) {
   this.prototype = prototype;
   this.name = name;
   this.custom = false;
   this.creator = this.modifier = session.user;
   this.created = this.modified = new Date;
   return this;
};

Skin.prototype.href = function(action) {
   res.push();
   res.write(res.handlers.layout.skins.href());
   res.write(this.prototype);
   res.write("/");
   res.write(this.name);
   res.write("/");
   action && (res.write(action));
   return res.pop();
};

Skin.prototype.getPermission = function(action) {
   return res.handlers.skins.getPermission("main");
};

Skin.prototype.main_action = function() {
   return res.redirect(this.href("edit"));
};

Skin.prototype.edit_action = function() {
   if (req.postParams.save) {
      try {
         var url = this.href(req.action);
         this.update(req.postParams);
         /*
         // FIXME:
         if (false && this.equals(req.postParams.source)) {
            Skin.remove.call(this);
            url = Skins.getRedirectUrl(req.postParams);
         } else {
            this.setSource(req.postParams.source);
         }
         res.message = gettext("The changes were saved successfully.");
         */
         if (req.postParams.save == 1) {
            res.redirect(url);
         } else {
            res.redirect(Skins.getRedirectUrl(req.postParams));
         }
      } catch (ex) {
         res.message = ex;
         app.log(ex);
      }
   }
   res.data.action = this.href(req.action);
   res.data.title = gettext('Edit {0}.{1} skin of "{2}"', this.prototype, 
         this.name, res.handlers.site.title);
   res.data.body = this.renderSkinAsString("Skin#edit");
   res.handlers.skins.renderSkin("Skins#page");
   return;
};

Skin.prototype.getFormOptions = function(name) {
   switch (name) {
      case "prototype":
      return Skin.getPrototypeOptions();
   }
};

Skin.getPrototypeOptions = function() {
   var prototypes = [];
   for each (var name in Skin.CUSTOMIZABLE_PROTOTYPES) {
      prototypes.push({value: name, display: name});
   }
   return prototypes.sort(new String.Sorter("display"));
};

Skin.prototype.update = function(data) {
   if (this.isTransient()) {
      this.source = this.getSource();
      res.handlers.layout.skins.add(this);
   }
   this.setSource(data.source);
   return;
   
   if (!data.prototype) {
      throw Error(gettext("Please choose a prototype for the custom skin."));
   } else if (!data.name) {
      throw Error(gettext("Please choose a name for the custom skin."));
   } else if (data.name === data.prototype ||
         (this[data.prototype] && this[data.prototype][data.name]) ||
         res.handlers.skins.getOriginalSkin(data.prototype, data.name) || 
         (app.skinfiles[data.prototype] && 
         app.skinfiles[data.prototype][data.name])) {
      throw Error(gettext("There is already a skin with this name. Please choose another one."));
   }
   this.prototype = data.prototype;
   this.name = data.name;
   this.touch();
   return;
};

Skin.remove = function() {
   if (this.source) {
      this.setSource(this.source);
      delete this.source;
   } else {
      this.setSource();
   }
   this.remove();
   return;
   
   var file = this.getStaticFile(res.skinpath[0]);
   if (file.exists()) {
      file["delete"]();
      var parentDir = file.getParentFile();
      if (parentDir.isDirectory() && parentDir.list().length < 1) {
         parentDir["delete"]();
         var layoutDir = parentDir.getParentFile();
         if (layoutDir.list().length < 1) {
            layoutDir["delete"]();
         }
      }
   }
   this.remove();
   return;
};

Skin.prototype.restore_action = function() {
   if (req.postParams.proceed) {
      try {
         var str = this.toString();
         this.setSource(this.source);
         this.remove();
         res.message = gettext("{0} was successfully restored.", str);
         res.redirect(res.handlers.layout.skins.href("modified"));
      } catch(ex) {
         res.message = ex;
         app.log(ex);
      }
   }

   res.data.action = this.href(req.action);
   res.data.title = gettext("Confirm restore of {0}", this);
   res.data.body = this.renderSkinAsString("HopObject#confirm", {
      text: gettext('You are about to restore {0}.', this)
   });
   res.handlers.site.renderSkin("Site#page");
}

Skin.prototype.compare_action = function() {
   // get the modified and original skins
   var originalSkin = this.source;

   if (!originalSkin) {
      res.data.status = gettext("This is a custom skin, therefor no differences can be displayed");
   } else {
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
                  this.renderSkin("diffline", sp);
               }
            }
            if (line.inserted) {
               sp.status = "ADD";
               sp["class"] = "added";
               for (var j=0;j<line.inserted.length;j++) {
                  sp.num = line.num + j;
                  sp.line = encode(line.inserted[j]);
                  this.renderSkin("diffline", sp);
               }
            }
            if (line.value != null) {
               sp.status = "&nbsp;";
               sp["class"] = "line";
               sp.line = encode(line.value);
               this.renderSkin("diffline", sp);
            }
         }
         res.data.diff = res.pop();
      }
   }
   res.data.body = this.renderSkinAsString("diff");
   res.data.title = gettext("Diffs for {0}/{1}.skin of layout {2}", 
         this.prototype, this.name, res.handlers.layout.title);
   res.handlers.skins.renderSkin("Skins#page");
   return;
};

Skin.prototype.prototype_macro = function() {
   if (this.prototype.toLowerCase() !== "global") {
      res.write(this.prototype);
   }
   return;
};

Skin.prototype.status_macro = function() {
   return this.isTransient() ? "inherited" : "modified"; 
};

Skin.prototype.summary_macro = function() {
   return Skins.getSummary("skin", this.prototype, this.name);
};

Skin.prototype.source_macro = function() {
   return res.write(this.getSource());
};

Skin.prototype.getSource = function() {
   var skinFiles = app.getSkinfilesInPath(res.skinpath)[this.prototype];
   if (!skinFiles) {
      return String.EMPTY;
   }
   var source = skinFiles[this.name];
   if (!source) {
      // FIXME: Strange, the subskin can be rendered but it's not found
      // in app.getSkinFilesInPath() ...
      //global[this.prototype].prototype.renderSkin(this.prototype + "#" + this.name);
      skin = createSkin(skinFiles[this.prototype]).getSubskin(this.name);
      source = skin && skin.getSource();
   }
   return source || String.EMPTY;
};

Skin.prototype.setSource = function(source) {
   if (source === null) {
      return;
   }

   if (this.isSubskin()) {
      res.push();
      res.writeln("<% #" + this.name + " %>");
      res.writeln(source);
      var skin = this.getMainSkin();
      var subskins = skin.getSubskinNames();
      for (var i in subskins) {
         if (subskins[i] !== this.name) {
            res.writeln("<% #" + subskins[i] + " %>");
            res.writeln(skin.getSubskin(subskins[i]).source);
         }
      }
      source = res.pop();
   }

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
};

Skin.prototype.getStaticFile = function(fpath, skin) {
   var name = this.isSubskin() ? this.prototype : this.name;
   return new java.io.File(fpath, this.prototype + "/" + name + ".skin");
};

Skin.prototype.isSubskin = function() {
   // FIXME: OK to use subskins only?
   return true; //this.getMainSkin().hasSubskin(this.name);
}

Skin.prototype.getMainSkin = function() {
   var source = app.getSkinfilesInPath(res.skinpath)[this.prototype][this.prototype];
   return createSkin(source);
}

Skin.prototype.isCustom = function() {
   // FIXME:
   return true;
};

Skin.prototype.render = function() {
   return renderSkin(createSkin(this.getSource()));
};

Skin.prototype.equals = function(source) {
   // FIXME: The removal of linebreaks is necessary but it's not very nice
   var re = /\r|\n/g;
   var normalize = function(str) {
      return str.replace(re, String.EMPTY);
   }
   return normalize(source) === normalize(this.getSubskin());
};

Skin.prototype.toString = function() {
   return "Skin #" + this._id + ": " + this.prototype + "." + this.name;
};
