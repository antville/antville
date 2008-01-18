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

app.addRepository("modules/core/HopObject.js");
app.addRepository("modules/core/String.js");
app.addRepository("modules/helma/Color.js");
app.addRepository("modules/helma/File.js");

var convert = function(type) {
   if (!type) {
      return;
   }
   
   var func;
   if (func = arguments.callee[type]) {
      func(type);
   }
}

convert.files = function() {
   retrieve(sql("files"));
   traverse(function() {
      var metadata = {
         fileName: this.fileName,
         contentType: this.type,
         contentLength: this.size,
         description: this.description
      }
      execute("update file set prototype = 'File', parent_type = 'Site', " +
            "parent_id = site_id, metadata = " +
            quote(metadata.toSource()) + " where id = " + this.id);
   });
}

convert.images = function() {
   retrieve(sql("images"));
   traverse(function() {
      var metadata = {
         fileName: this.fileName + "." + this.type,
         contentLength: this.size || 0,
         contentType: "image/" + this.type,
         width: this.width,
         height: this.height,
         description: this.description,
         thumbnailName: this.fileName + "_small" + "." + this.type,
         thumbnailWidth: this.thumbnailWidth,
         thumbnailHeight: this.thumbnailHeight
      }
      execute("update image set metadata = " +
            quote(metadata.toSource()) + " where id = " + this.id);
   });
   convert.tags("image");
};

convert.layouts = function() {
   convert.xml("layout");
   retrieve(sql("layouts"));
   traverse(function() {
      var metadata = eval(this.metadata) || {};
      metadata.title = this.LAYOUT_TITLE || "Layout #" + this.id;
      metadata.description = this.LAYOUT_DESCRIPTION;
      if (this.LAYOUT_ISIMPORT) {
         // FIXME: metadata.origin = Layout.getById(id).href();
      }
      execute("update layout set metadata = " + quote(metadata.toSource()) + 
            " where id = " + this.id);
   });
}

convert.sites = function() {
   convert.xml("site");
   retrieve(sql("sites"));
   traverse(function() {
      var metadata = eval(this.metadata) || {};
      metadata.email = this.SITE_EMAIL;
      metadata.title = this.SITE_TITLE;
      metadata.lastUpdate = this.SITE_LASTUPDATE;
      metadata.pageSize = metadata.days || 3;
      metadata.pageMode = "days";
      metadata.timeZone = metadata.timezone || "CET";
      metadata.archiveMode = metadata.archive ? "public" : "closed";
      metadata.commentMode = metadata.discussions ? "enabled" : "disabled";
      metadata.shortDateFormat = metadata.shortdateformat;
      metadata.longDateFormat = metadata.longdateformat;
      metadata.offlineSince = this.SITE_LASTOFFLINE;
      metadata.notifiedOfBlocking = this.SITE_LASTBLOCKWARN;
      metadata.notifiedOfDeletion = this.SITE_LASTDELWARN;
      metadata.webHookMode = this.SITE_ENABLEPING ? 
            "enabled" : "disabled";
      metadata.webHookLastUpdate = this.SITE_LASTPING;
      // FIXME: metadata.webHookUrl = "";
      metadata.locale = metadata.language;
      if (metadata.country) {
         metadata.locale += "_" + metadata.country;
      }
      var mode = metadata.usercontrib ? 'open' : this.mode;
      for each (var key in ["enableping", "usercontrib", "archive",
            "discussions", "days", "shortdateformat", "longdateformat",
            "linkcolor", "alinkcolor", "vlinkcolor", "smallcolor",
            "titlecolor", "titlefont", "textfont", "textcolor", "smallsize",
            "smallfont", "textsize", "titlesize", "timezone", "bgcolor",
            "language", "country"]) {
         delete metadata[key];
      }
      execute("update site set metadata = " + quote(metadata.toSource()) +
            ", mode = " + quote(mode) + " where id = " + this.id);
   });
}

convert.content = function() {
   convert.xml("content");
   convert.tags("content");
};

convert.users = function() {
   retrieve("select id, hash, salt, USER_URL from user");
   traverse(function() {
      var metadata = {
         hash: this.hash,
         salt: this.salt,
         url: this.USER_URL
      }
      execute("update user set metadata = " + quote(metadata.toSource()) +
            " where id = " + this.id);
   });
}

convert.xml = function(table) {
   var metadata = function(xml) {
      var clean = xml.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, "");
      try {
         return Xml.readFromString(clean);
      } catch (ex) {
         app.debug(ex);
      }
      return {};
   };
   
   retrieve(sql("jsonize", table));
   traverse(function() {
      if (!this.xml) {
         return;
      }
      var data = metadata(this.xml);
      execute("update " + table + " set metadata = " + 
            quote(data.toSource()) + " where id = " + this.id);
   });
}

convert.tags = function(table) {
   var prototype;
   switch (table) {
      case "image":
      prototype = "Image"; break;
      case "content":
      prototype = "Story"; break;
   }
   retrieve("select site_id, topic from " + table + 
         " where topic is not null group by topic");
   traverse(function() {
      execute("insert into tag set id = " + id() + ", site_id = " + 
            this.site_id + ", name = " +
            quote(this.topic).replace(/^[\/\.]*$/, "?") + ", type = " +  
            quote(prototype));
   });
   retrieve("select topic, tag.id, metadata, " + table + ".id as tagged_id, " +
         "modifier_id, creator_id, " + table + ".site_id from " + table + 
         ", tag where " + "topic is not null and topic = tag.name and " +
         "tag.type = " + quote(prototype));
   traverse(function() {
      execute("insert into tag_hub set id = " + id() + ", tag_id = " + 
            this.id + ", tagged_id = " + this.tagged_id + 
            ", tagged_type = " + quote(prototype) + ", user_id = " +
            this.modifier_id || this.creator_id);
   });
}

convert.skins = function() {
   var rename = function(prototype) {
      switch (prototype) {
         case "Day":
         return "Archive";
         case "LayoutImage":
         return "Image";
         case "LayoutImageMgr":
         return "Images";
         case "RootLayoutMgr":
         return "Layouts";
         case "StoryMgr":
         return "Stories";
         case "SysMgr":
         return "Admin";
         case "SysLog":
         return "LogEntry";
         case "Topic":
         return "Tag";
         case "TopicMgr":
         return "Tags";
         default:
         if (prototype.lastIndexOf("Mgr") > 0) {
            return prototype.substr(0, prototype.length - 3) + "s";
         }
         return prototype;
      }
   }

   var values = function(metadata) {
      if (!metadata) {
         return;
      }

      var keys = {
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

      var data = eval(metadata);
      res.push();
      res.writeln("<% #values %>");
      for (var key in keys) {
         var name = keys[key];
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

   var save = function(fpath, data) {
      var file = new java.io.File(fpath);
      file.mkdirs();
      //file = new java.io.File(file, fname.replace(/\//, "_") + ".skin");
      debug(file.getCanonicalPath());
      file["delete"]();
      if (data) {
         var fos = new java.io.FileOutputStream(file);
         var bos = new java.io.BufferedOutputStream(fos);
         var writer = new java.io.OutputStreamWriter(bos, "UTF-8");
         writer.write(data);
         writer.close();
         bos.close();
         fos.close();
      }
      return
   } 

   var skinNames = {
      style: "stylesheet"
   }

   var dump = function(sql) {
      var buffer = {};
      retrieve(sql);
      traverse(function() {
         var fpath = app.dir + "/../static/" + this.site_name;
         var prototype = rename(this.prototype);
         var skinPath = prototype + "/" + prototype + ".skin";
         if (this.current_layout === this.layout_id) {
            fpath += "/layout/" + skinPath;
         } else {
            fpath += "/layouts/" + this.name + "/" + skinPath;
         }
         if (!buffer[fpath]) {
            buffer[fpath] = [];
            if (prototype === "Site") {
               buffer[fpath].push(values(this.metadata));
            }
         }
         var name = skinNames[this.skin_name] || this.skin_name;
         res.push();
         res.writeln("<% #" + name + " %>");
         res.writeln(this.SKIN_SOURCE);
         buffer[fpath].push(res.pop());
         return;
      });
      
      for (var fpath in buffer) {
         var skin = buffer[fpath].join("\n");
         save(fpath, skin);
      }
      
      return;
   }
   
   dump(sql("skins"));

   // Exporting the skins of the former root layouts
   var server = Packages.helma.main.Server.getServer();
   var antville = server.getApplication("antville");
   var rootLayout = antville.dataRoot.sys_layout;
   var rootLayoutId = rootLayout ? rootLayout._id : app.properties.rootLayoutId;
   rootLayoutId && dump(sql("skins2", rootLayoutId));
   return;
}
