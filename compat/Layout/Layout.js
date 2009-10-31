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

relocateProperty(Layout, "alias", "name");
relocateProperty(Layout, "parent", "ancestor");
relocateProperty(Layout, "createtime", "created");
relocateProperty(Layout, "modifytime", "modified");

Layout.prototype.__defineGetter__("shareable", function() {
   return this.mode === Layout.SHARED;
});

Layout.prototype.__defineSetter__("shareable", function(value) {
   this.mode = !!value ? Layout.SHARED : Layout.DEFAULT;
   return;
});

Layout.prototype.convert_action = function() {
   var dir, fname, file;
   var fpath = app.dir + "/../static/test/_layouts/";
   
   function runProcess(cmd, dir) {
      var runtime = java.lang.Runtime.getRuntime();
      var proc = runtime.exec(cmd, null, new java.io.File(dir.toString()));
      proc.waitFor();
      var result = new Object();
      result.error = proc.exitValue();
      return result;
   }
   
   var layoutName = "b_layout_dandelion_11";
   var targetDir = "_converted";
   runProcess("rm -rf " + fpath + targetDir, ".");
   runProcess("cp -R " + fpath + layoutName + " " + fpath + targetDir, ".");
   fpath += targetDir + "/";

   // Code copied from global convert.js file in updater app
   var styles = {
      "bgcolor": "background color",
      "linkcolor": "link color",
      "alinkcolor": "active link color",
      "vlinkcolor": "visited link color",
      "titlefont": "big font",
      "titlesize": "big font size",
      "titlecolor": "big font color",
      "textfont": "base font",
      "textsize": "base font size",
      "textcolor": "base font color",
      "smallfont": "small font",
      "smallsize": "small font size",
      "smallcolor": "small font color"
   }

   var values = function(metadata) {
      if (!metadata) {
         return;
      }

      var data = eval(metadata);
      res.push();
      for (var key in styles) {
         var name = styles[key];
         var value = String(data[key]).toLowerCase();
         if (key.endsWith("color") && !helma.Color.COLORNAMES[key] &&
               !value.startsWith("#")) {
            value = "#" + value;
         }
         value = value.replace(/([0-9]+) +px/, "$1px");
         res.writeln('<% value "' + name + '" "' + value + '" %>');
      }
      return res.pop();
   }

   var quote = function(str) {
      if (str === null) {
         return str;
      }
      return "'" + str.replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
   }

   var clean = function(source) {
      if (source) {
         // Renaming prototype and skin names in skin macros
         var re = /(<%\s*)([^.]+)(\.skin\s+name="?)([^"\s]+)/g;
         source = source.replace(re, function() {
            var $ = arguments;
            var skin = rename($[2].capitalize(), $[4]);
            if (skin) {
               // THIS LINE DIFFERS FROM THE UPDATER APP!
               return $[1] + skin.prototype.toLowerCase() + $[3] + 
                     skin.prototype + "#" + skin.name;
            }
            return $[0];
         });
         // Replacing layout.* macros with corresponding value macros
         source = source.replace(/(<%\s*)layout\.([^\s]+)/g, function() {
            var value = styles[arguments[2]];
            if (value) {
               return arguments[1] + "value " + quote(value);
            }
            return arguments[0];
         });
         return source;
      }
   }
   // End of code copied from updater app

   var dir = new helma.File(fpath, "images");
   for each (var fname in dir.list()) {
      var file = new helma.File(dir, fname);
      file.move(new helma.File(fpath, fname));
   }

   var inventory = new function() {
      dir = new helma.File(fpath);
      var result = {};
      for each (fname in dir.list()) {
         file = new helma.File(dir, fname);
         if (!file.isDirectory()) {
            // Where does the "image\" prefix come from in files from layouts.antville.org?
            var parts = fname.split("\\");
            var name = parts[parts.length-1];
            if (name !== fname) {
               res.debug(file);
               res.debug(new helma.File(fpath, name))
               file.renameTo(new helma.File(fpath, name));
            }
            result[name] = file;
         }
      }
      return result;
   }
   
   var xml = Xml.read(fpath + "preferences.xml");
   var f = new helma.File(fpath, "Site");
   f.makeDirectory();
   f = new helma.File(f, "Site.skin");
   f.open();
   res.push();
   res.writeln("<% #values %>");
   res.write(values(xml.preferences));
   f.write(res.pop());
   f.close();
   
   var rename = function(proto, name) {
      var allowed = ["Comment", "Day", "File", "Global", "Image", 
            "MemberMgr", "Membership", "Site", "Story", "Topic"];
      if (allowed.indexOf(proto) < 0) {
         return;
      }

      switch (proto) {
         case "Comment":
         name === "toplevel" && (name = "main");
         break;
         
         case "Day":
         proto = "Archive";
         break;
         
         case "MemberMgr":
         case "Membership":
         if (name === "statusloggedin") {
            name = "status";
         } else if (name === "statusloggedout") {
            name = "login";
         } else if (proto === "MemberMgr") {
            return;
         }
         break;
         
         case "Site":
         if (name === "searchbox") {
            name = "search";
         } else if (name === "style") {
            name = "stylesheet";
         }
         break;
         
         case "Story":
         if (name === "dayheader") {
            name = "date";
         } else if (name === "display") {
            name = "content";
         } else if (name === "historyview") {
            name = "history";
         }
         break;
         
         case "Topic":
         proto = "Tag";
         break;
      }
      (proto === "MemberMgr") && (proto = "Membership");      
      return {
         prototype: proto,
         name: name
      };
   }
   
   var convert2subskins = function(proto, dir) {
      res.push();
      for each (var fname in dir.list()) {
         var file = new helma.File(dir, fname);
         var name = fname.split(".")[0], skin;
         if (skin = rename(proto, name)) {
            res.writeln("<% #" + skin.name + " %>");
            var source = clean(file.readAll());
            if (skin.prototype === "Site" && skin.name === "stylesheet") {
               source = source.replace(/(\.calHead)/g, 
                     "table.calendar thead, $1");
               source = source.replace(/(\.calDay)/g, 
                     "table.calendar th, table.calendar tbody td.day, $1");
               source = source.replace(/(\.calSelDay)/g, 
                     "table.calendar tbody td.selected, $1");
               source = source.replace(/(\.calFoot)/g, 
                     "table.calendar tfoot td, $1");               
            }
            res.writeln(source);
         }
      }
      var str = res.pop();
      if (!str) {
         return;
      }
      var target = new java.io.File(fpath, skin.prototype);
      target.mkdirs();
      target = new helma.File(target, skin.prototype + ".skin");
      target.open({append: true});
      target.write(str);
      target.close();
   }
   
   dir = new helma.File(fpath, "skins");

   var skin;
   for each (fname in dir.list()) {
      file = new helma.File(dir, fname);
      skin = convert2subskins(fname, file);
   }
   
   var convertImage = function(image) {
      var result = new HopObject;
      result.name = image.alias;
      result.width = image.width;
      result.height = image.height;
      result.created = image.exporttime;
      result.modified = image.exporttime;
      result.description = image.alltext;
      result.fileName = image.alias + "." + image.fileext,
      result.contentType = "image/" + image.fileext;
      result.contentLength = inventory[result.fileName].getLength();
      if (image.thumbnail) {
         result.thumbnailName = image.thumbnail.filename + "." + image.fileext;
         result.thumbnailWidth = image.thumbnail.width;
         result.thumbnailHeight = image.thumbnail.height; 
      }
      return result;
   }
   
   var data = new HopObject;
   data.images = new HopObject;

   var dir = new helma.File(fpath, "imagedata");
   for each (fname in dir.list()) {
      if (fname.endsWith(".xml")) {
         file = new helma.File(dir, fname);
         data.images.add(convertImage(Xml.read(file)));
      }
   }

   data.version = "1.2-compatible";
   data.origin = "Antville 1.2 Layout Converter";
   data.originated = new Date;
   data.originator = session.user;
   Xml.write(data, new helma.File(fpath, "data.xml"));
   
   (new helma.File(fpath, "preferences.xml")).remove();
   (new helma.File(fpath, "imagedata")).removeDirectory();
   (new helma.File(fpath, "skins")).removeDirectory();
   
   var zip = new helma.Zip;
   zip.add(fpath);
   zip.save(fpath + "../" + layoutName + "_converted.zip");
   return;
}

Layout.prototype.title_macro = function(param) {
   if (param.as === "editor") {
      this.input_macro(param, "title");
   } else if (param.linkto) {
      (param.linkto === "main") && (param.linkto = "");
      this.link_filter(this.title, param, param.linkto);
   } else {
      res.write(this.title);
   }
   return;
}

Layout.prototype.description_macro = function(param) {
   if (param.as == "editor") {
      this.textarea_macro(param, "description");
   } else if (this.description) {
      if (param.limit) {
         res.write(this.description.clip(param.limit, "...", "\\s"));
      } else {
         res.write(this.description);
      }
   }
   return;
}

Layout.prototype.parent_macro = function(param) {
   if (param.as === "editor") {
      this.select_macro(param, "parent");
   } else if (this.parent) {
      res.write(this.parent.title);
   }
   return;
}

Layout.prototype.shareable_macro = function(param) {
   if (param.as == "editor" && !this.site) {
      var inputParam = this.createCheckBoxParam("shareable", param);
      if (req.data.save && !req.data.shareable)
         delete inputParam.checked;
      Html.checkBox(inputParam);
   } else if (this.shareable)
      res.write(param.yes || gettext("yes"));
   else
      res.write(param.no  || gettext("no"));
   return;
}

Layout.prototype.testdrivelink_macro = function(param) {
   return this.link_macro(param, "test", param.text || gettext("test"));
}

Layout.prototype.deletelink_macro = function(param) {
   return this.link_macro(param, "delete", param.text || gettext("delete"));
}

Layout.prototype.activatelink_macro = function(param) {
   return this.link_macro(param, "activate", param.text || gettext("activate"));
}
