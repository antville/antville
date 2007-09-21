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

Skin.prototype.constructor = function(layout, prototype, name) {
   this.layout = layout;
   this.prototype = prototype;
   this.name = name;
   this.custom = false;
   this.creator = this.modifier = session.user;
   this.created = this.modified = new Date;
   return this;
};

Skin.prototype.href = function(action) {
   if (this.isTransient()) {
      return res.handlers.skins.href("create") + "?prototype=" + 
            this.prototype + "&name=" + this.name; 
   } else {
      return HopObject.prototype.href.apply(this, arguments);
   }
   return href;
};

Skin.prototype.getPermission = function(action) {
   switch (action) {
      case "delete":
      return User.getPermission(User.PRIVILEGED) ||
            Member.getPermission(Member.OWNER);
   }
   return true;
};

Skin.prototype.main_action = function() {
   if (req.postParams.save || req.postParams.close) {
      try {
         this.update(req.postParams);
         res.message = gettext("The changes were saved successfully.");
         if (req.postParams.close) {
            res.redirect(this.href() + "?skinset=" + 
                  req.postParams.skinset + "#" + req.postParams.key);
         }
         res.redirect(this.href(req.action) + "?key=" + req.postParams.key + 
               "&skinset=" + req.postParams.skinset + "&action=" + 
               req.postParams.action);
      } catch (ex) {
         res.message = ex;
         app.log(ex);
      }
   }
   res.data.action = this.href(req.action);
   res.data.title = gettext('{0}/{1}.skin of Layout "{2}"', this.prototype, 
         this.name, res.handlers.layout.title);
   res.data.body = this.renderSkinAsString("Skin#edit");
   res.handlers.skins.renderSkin("page");
   return;
};

Skin.prototype.update = function(data) {
   this.setSource(data.source);
   this.touch();
   return;
};

Skin.prototype.diff_action = function() {
   // get the modified and original skins
   var originalSkin = this.layout.skins.getOriginalSkinSource(this.prototype, 
         this.name);

   if (originalSkin == null) {
      res.data.status = getMessage("Skin.diff.noDiffAvailable");
   } else {
      var diff = originalSkin.diff(this.getSource());
      if (!diff) {
         res.data.status = getMessage("Skin.diff.noDiffFound");
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
   res.data.title = getMessage("Skin.diff.displayTitle", {
      skinProto: this.proto, 
      skinName: this.name, 
      layoutTitle: this.layout.title
   });
   this.layout.skins.renderSkin("page");
   return;
};

/*Skin.prototype.delete_action = function() {
   if (req.data.cancel) {
      res.redirect(this.layout.skins.href());
   } else if (req.data.remove) {
      try {
         res.message = this.layout.skins.deleteSkin(this);
         res.redirect(this.layout.skins.href());
      } catch (err) {
         res.message = err.toString();
      }
   }

   res.data.action = this.href(req.action);
   res.data.title = res.handlers.context.getTitle();
   var skinParam = {
      description: getMessage("Skin.deleteDescription"),
      detail: this.name
   };
   res.data.body = this.renderSkinAsString("delete", skinParam);
   res.handlers.context.renderSkin("page");
   return;
};
*/

Skin.prototype.prototype_macro = function() {
   if (this.prototype.toLowerCase() !== "global") {
      res.write(this.prototype);
   }
   return;
};

Skin.prototype.summary_macro = function() {
   var summary = Skins.getSummary("skin", this.prototype, this.name);
   res.write(summary[0] + ". " + summary[1]);
   return;
};

Skin.prototype.source_macro = function() {
   res.write(this.getSubskin());
   return;
};

Skin.prototype.getSource = function() {
   var skin = this.custom ? "custom" : this.prototype;
   for (var i in res.skinpath) {
      var file = this.getFile(res.skinpath[i]);
      if (!file.exists()) {
         continue;
      }

      if (this.cache.source) {
         return this.cache.source;
      }
   
      var fis = new java.io.FileInputStream(file);
      var isr = new java.io.InputStreamReader(fis, "UTF-8");
      var reader = new java.io.BufferedReader(isr);
      var line, source = new java.lang.StringBuffer();
      while ((line = reader.readLine()) != null) {
         source.append(line);
         source.append("\n");
      }
      /*
      var source = java.lang.reflect.Array.newInstance(java.lang.Character.TYPE, 
            file.length());
      var offset = 0, read;
      while (offset < source.length) {
         read = reader.read(source, offset, source.length - offset);
         offset += read;
      }
      */
      reader.close();
      isr.close();
      fis.close();

      //this.cache[key] = new java.lang.String(source);
      //res.debug(this.cache[key]);
      this.cache.source = source.toString();
      return this.cache.source;
   }

   var skins;
   if (skins = app.skinfiles[this.prototype]) {
      return skins[skin];
   }
   return null;
};

Skin.prototype.setSource = function(subskin) {
   if (!subskin) {
      return;
   }

   res.push();
   var skin = createSkin(this.getSource());
   var subskins = skin.getSubskinNames();
   for (var i in subskins) {
      res.write("<% #" + subskins[i] + " %>\n");
      if (subskins[i] === this.name) {
         res.write(subskin);
      } else {
         res.write(skin.getSubskin(subskins[i]).source);
      }
   }
   var source = res.pop();

   var file = this.getFile(res.skinpath[0]);
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

Skin.prototype.getSubskin = function() {
   var skin = createSkin(this.getSource());
   var subskin = skin.getSubskin(this.name);
   return subskin ? subskin.getSource() : "";
};

Skin.prototype.getFile = function(fpath) {
   var name = this.custom ? "custom" : this.prototype;
   return new java.io.File(fpath, this.prototype + "/" + name + ".skin");
};

Skin.prototype.isCustom = function() {
   // FIXME:
   return true;
};

Skin.prototype.equals = function(source) {
   // FIXME: The removal of linebreaks is necessary but it's not very nice
   var re = /\r|\n/g;
   var normalize = function(str) {
      return str.replace(re, String.EMPTY);
   }
   return normalize(source) === normalize(this.getSubskin());
};

Skin.remove = function(skin) {
   var file = skin.getFile();
   file["delete"]();
   var parentDir = file.getParentFile();
   if (parentDir.list().length < 1) {
      parentDir["delete"]();
      var layoutDir = parentDir.getParentFile();
      if (layoutDir.list().length < 1) {
         layoutDir["delete"]();
      }
   }
   session.data.retrace = res.handlers.skins.href();
   skin.remove();
   return;
};
