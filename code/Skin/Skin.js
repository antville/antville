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
   this.creator = this.modifier = session.user;
   this.created = this.modified = new Date;
   return this;
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

Skin.prototype.getPermission = function(action) {
   return res.handlers.skins.getPermission("main");
}

Skin.prototype.main_action = function() {
   return res.redirect(this.href("edit"));
}

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
         */
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

Skin.prototype.getFormOptions = function(name) {
   switch (name) {
      case "prototype":
      return Skin.getPrototypeOptions();
   }
}

Skin.getPrototypeOptions = function() {
   var prototypes = [];
   for each (var name in Skin.CUSTOMIZABLE_PROTOTYPES) {
      prototypes.push({value: name, display: name});
   }
   return prototypes.sort(new String.Sorter("display"));
}

Skin.prototype.update = function(data) {
   if (this.isTransient()) {
      this.source = this.getSource();
      res.handlers.layout.skins.add(this);
   }
   this.setSource(data.source);
   this.touch();
   return;
}

Skin.remove = function() {
   if (this.source) {
      this.setSource(this.source);
      delete this.source;
   } else {
      this.setSource();
   }
   this.remove();
   return;
}

Skin.prototype.reset_action = function() {
   if (req.postParams.proceed) {
      try {
         var str = this.toString();
         this.setSource(this.source);
         this.remove();
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
   }
   res.data.title = gettext("Compare versions of skin {0}.{1}", 
         this.prototype, this.name);
   res.data.body = this.renderSkinAsString("$Skin#compare");
   res.handlers.skins.renderSkin("$Skins#page");
   return;
}

Skin.prototype.status_macro = function() {
   return this.isTransient() ? "inherited" : "modified"; 
}

Skin.prototype.summary_macro = function() {
   return Skins.getSummary("skin", this.prototype, this.name);
}

Skin.prototype.source_macro = function() {
   return res.write(this.getSource());
}

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
}

Skin.prototype.setSource = function(source) {
   res.push();
   if (source != null) {
      res.writeln("<% #" + this.name + " %>");
      res.writeln(source.trim());
   }
   var skin = this.getMainSkin();
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
   var source = app.getSkinfilesInPath(res.skinpath)[this.prototype][this.prototype];
   return createSkin(source);
}

Skin.prototype.custom_macro = function() {
   // FIXME:
   return false;
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
