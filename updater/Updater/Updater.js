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
app.addRepository("modules/core/Object.js");
app.addRepository("modules/core/String.js");
app.addRepository("modules/helma/Color.js");
app.addRepository("modules/helma/File.js");

Updater.prototype.main_action = function() {
   app.invokeAsync(global, function() {
      convert.skins(); // DEBUG
      return;
      
      sql.execute(sql.query("tag"));
      sql.execute(sql.query("tag_hub"));
      sql.execute(sql.query("log"));
      //sql.update("AV_ACCESSLOG");
      sql.update("AV_CHOICE");
      sql.update("AV_FILE");
      sql.update("AV_IMAGE");
      sql.update("AV_LAYOUT");
      sql.update("AV_MEMBERSHIP");
      sql.update("AV_POLL");
      sql.update("AV_SITE");
      sql.update("AV_SKIN");
      sql.update("AV_TEXT");
      sql.update("AV_USER");
      sql.update("AV_VOTE");
      sql.update("AV_SYSLOG"); // This has to go last
      return;
   }, [], -1);
   this.renderSkin("Updater");
   return;

   app.invokeAsync(global, function() {
      for (var i=0; i<10; i+=1) {
         log(i);
         for (var w=0; w<10000000; w+=1) {}
      }
   }, [], 5000);
};

Updater.prototype.out_action = function() {
   res.contentType = "text/plain";
   if (app.data.out) {
      res.write(app.data.out.toString());
      app.data.out.setLength(0);
   }
   return;
};

Updater.convert = function(type) {
   if (!type) {
      return;
   }
   
   var func;
   if (func = arguments.callee[type]) {
      func(type);
   }
}

Updater.convert.quotes = function(str) {
   return "'" + str.replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
}

Updater.convert.files = function() {
   sql.retrieve(sql.query("files"));
   sql.traverse(function() {
      var metadata = {
         fileName: this.fileName,
         contentType: this.type,
         contentLength: this.size,
         description: this.description
      }
      sql.execute("update file set prototype = 'File', parent_type = 'Site', " +
            "parent_id = site_id, metadata = " +
            convert.quotes(metadata.toSource()) + " where id = " + this.id);
   });
}

Updater.convert.images = function() {
   sql.retrieve(sql.query("images"));
   sql.traverse(function() {
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
      sql.execute("update image set metadata = " +
            convert.quotes(metadata.toSource()) + " where id = " + this.id);
   });
   convert.tags("image");
};

Updater.convert.layouts = function() {
   convert.xml("layout");
   sql.retrieve(sql.query("layouts"));
   sql.traverse(function() {
      var metadata = eval(this.metadata) || {};
      metadata.title = this.LAYOUT_TITLE || "Layout #" + this.id;
      metadata.description = this.LAYOUT_DESCRIPTION;
      if (this.LAYOUT_ISIMPORT) {
         // FIXME: metadata.origin = Layout.getById(id).href();
      }
      sql.execute("update layout set metadata = " + 
            convert.quotes(metadata.toSource()) + " where id = " + this.id);
   });
}

Updater.convert.sites = function() {
   convert.xml("site");
   sql.retrieve(sql.query("sites"));
   sql.traverse(function() {
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
      sql.execute("update site set metadata = " + convert.quotes(metadata.toSource()) +
            ", mode = " + convert.quotes(mode) + " where id = " + this.id);
   });
}

Updater.convert.content = function() {
   convert.xml("content");
   convert.tags("content");
};

Updater.convert.users = function() {
   sql.retrieve("select id, hash, salt, USER_URL from user");
   sql.traverse(function() {
      var metadata = {
         hash: this.hash,
         salt: this.salt,
         url: this.USER_URL
      }
      sql.execute("update user set metadata = " + 
            convert.quotes(metadata.toSource()) + " where id = " + this.id);
   });
}

Updater.convert.xml = function(table) {
   var metadata = function(xml) {
      var clean = xml.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, "");
      try {
         return Xml.readFromString(clean);
      } catch (ex) {
         app.debug(ex);
      }
      return {};
   };
   
   sql.retrieve(sql.query("jsonize", table));
   sql.traverse(function() {
      if (!this.xml) {
         return;
      }
      var data = metadata(this.xml);
      sql.execute("update " + table + " set metadata = " + 
            convert.quotes(data.toSource()) + " where id = " + this.id);
   });
}

Updater.convert.tags = function(table) {
   var prototype;
   switch (table) {
      case "image":
      prototype = "Image"; break;
      case "content":
      prototype = "Story"; break;
   }
   sql.retrieve("select site_id, topic from " + table + 
         " where topic is not null group by topic");
   sql.traverse(function() {
      sql.execute("insert into tag set id = " + id() + ", site_id = " + 
            this.site_id + ", name = " +
            convert.quotes(this.topic).replace(/^[\/\.]*$/, "?") + ", type = " +  
            convert.quotes(prototype));
   });
   sql.retrieve("select topic, tag.id, metadata, " + table + ".id as tagged_id, " +
         "modifier_id, creator_id, " + table + ".site_id from " + table + 
         ", tag where " + "topic is not null and topic = tag.name and " +
         "tag.type = " + convert.quotes(prototype));
   sql.traverse(function() {
      sql.execute("insert into tag_hub set id = " + id() + ", tag_id = " + 
            this.id + ", tagged_id = " + this.tagged_id + 
            ", tagged_type = " + convert.quotes(prototype) + ", user_id = " +
            this.modifier_id || this.creator_id);
   });
}

Updater.convert.skins = function() {
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

   var rename = function(prototype, skin) {
      var map = {
         Day: "Archive",
         LayoutImage: "Image",
         LayoutImageMgr: "Images",
         RootLayoutMgr: "Layouts", // FIXME: obsolete
         StoryMgr: "Stories",
         SysMgr: "Admin",
         SysLog: "LogEntry",
         Topic: "Tag",
         TopicMgr: "Tags",
         
         Comment: {
            toplevel: "main"
         },
         
         Members: {
            statusloggedin: ["Membership", "status"],
            statusloggedout: ["Membership", "login"]
         },
         
         Site: {
            searchbox: "search",
            style: "stylesheet" 
         },
         
         Story: {
            dayheader: "date",
            display: "content",
            historyview: "history"
         }
      }
      
      var renamed;
      if (renamed = map[prototype]) {
         if (renamed.constructor === String) {
            return rename(renamed, skin);
         } else  if (skin) {
            renamed = renamed[skin];
            if (renamed) {
               if (renamed.constructor === Array) {
                  prototype = renamed[0];
                  skin = renamed[1];
               } else {
                  skin = renamed;
               }
            }
         }
      } else if (prototype.lastIndexOf("Mgr") > 0) {
         prototype = prototype.substr(0, prototype.length - 3) + "s";
         return rename(prototype, skin);
      }
      return [prototype, skin];
   }
   
   var values = function(metadata) {
      if (!metadata) {
         return;
      }

      var data = eval(metadata);
      res.push();
      res.writeln("<% #values %>");
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

   var clean = function(source) {
      if (source) {
         // Renaming prototype and skin names in skin macros
         var re = /(<%\s*)([^.]+)(\.skin\s+name="?)([^"\s]+)/g;
         source = source.replace(re, function() {
            var $ = arguments;
            var renamed = rename($[2].capitalize(), $[4]);
            return $[1] + renamed[0].toLowerCase() + $[3] + 
                  renamed[0] + "#" + renamed[1];
         });
         // Replacing layout.* macros with corresponding value macros
         source = source.replace(/(<%\s*)layout\.([^\s]+)/g, function() {
            var value = styles[arguments[2]];
            if (value) {
               return arguments[1] + "value " + convert.quotes(value);
            }
            return arguments[0];
         });
         return source;
      }
   }

   var save = function(skins, fpath) {
      if (!skins) {
         return;
      }
      
      var allow = ["Global", "Site", "Story", "Comment", "Image", "File", 
            "Poll", "Members", "Membership"];

      for (var prototype in skins) {
         if (allow.indexOf(prototype) < 0) {
            continue;
         }
         
         res.push();
         var skinset = skins[prototype];
         for (var skinName in skinset) {
            res.writeln("<% #" + skinName + " %>");
            res.writeln(skinset[skinName] || "");
         }
         var data = res.pop();
         
         var file = new java.io.File(fpath + "/" + prototype + "/" + prototype + ".skin");
         file.mkdirs();
         //file = new java.io.File(file, fname.replace(/\//, "_") + ".skin");
         sql.debug(file.getCanonicalPath());
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
      }
      return;
   }

   var appSkins = {};
   var skinfiles = app.getSkinfilesInPath([app.dir]);

   for (var prototype in skinfiles) {
      // Ignore lowercase prototypes
      if (prototype.charCodeAt(0) > 90) {
         continue;
      }
      appSkins[prototype] || (appSkins[prototype] = {});
      for each (var source in skinfiles[prototype]) {
         var skin = createSkin(source);
         var subskins = skin.getSubskinNames();
         for each (var name in subskins) {
            appSkins[prototype][name] = skin.getSubskin(name).getSource();
         }
      }
   }
   
   var current, fpath, skins;
   sql.retrieve(sql.query("skins4"));
   sql.traverse(function() {
      var site = this.site_name || "www";
      if (current !== site + this.layout_name) {
         save(skins, fpath);
         current = site + this.layout_name;
         fpath = app.dir + "/../static/" + site;
         if (site === "www") {
            var rootLayoutId = 6; // FIXME: app.__app__.getDataRoot().sys_layout._id;
            fpath += rootLayoutId == this.layout_id ?
                  "/layout/" : "/layouts/" + this.layout_name;
         } else {
            fpath += this.current_layout === this.layout_id ?
                  "/layout/" : "/layouts/" + this.layout_name;
         }
         skins = appSkins.clone({}, true);
         skins.Site.values = values(this.layout_metadata);
      }

      var renamed = rename(this.prototype, this.name);
      var prototype = renamed[0];
      var skinName = renamed[1];
      var source, parent;
      var appSkin = (skins[prototype] && skins[prototype][skinName]);
      if (this.source !== null) {
         source = this.source;
         parent = this.parent !== null ? this.parent : appSkin;
      } else {
         source = this.parent;
         parent = appSkin;
      }
      if (source !== null && source !== undefined) {
         // FIXME: Ugly special hack for linking from Membership back to Members
         if (prototype === "Membership" && 
               (skinName === "login" || skinName === "status")) {
            source = source.replace(/(<%\s*)this./g, "$1members.");
         }
         ref = (skins[prototype] || (skins[prototype] = {}));
         ref[skinName] = clean(source);
      }
      if (parent !== null && parent !== undefined) {
         sql.execute("update skin set source = '" + 
               clean(parent).replace(/'/g, "\\'") + "' where " + 
               'id = ' + this.id);
      }
   });

   save(skins, fpath);
   return;
}

Updater.SqlUtility = function() {
   var db = getDBConnection("antville");
   var query, result;

   var ResultWrapper = function(result) {
      var columns = [];
      this.values = {};
      
      for (var i=1; i<=result.getColumnCount(); i+=1) {
         columns.push(result.getColumnName(i));
      }
   
      this.update = function() {
         for each (var key in columns) {
            this.values[key] = result.getColumnItem(key);
         }
         return;
      }
      
      return this;
   }
   
   this.log = function(str) {
      var now = "[" + new Date + "] ";
      app.data.out || (app.data.out = new java.lang.StringBuffer());
      app.data.out.insert(0, now + encodeForm(str) + "\n");
      return;
   }
   
   this.debug = function(str) {
      if (app.properties.debug === "true") {
         this.log(str);
      }
      return;
   }
   
   this.query = function(type) {
      var param = {};
      for (var i=1; i<arguments.length; i+=1) {
         param["value" + i] = arguments[i];
      } 
      return updater.renderSkinAsString("sql#" + type, param).replace(/\n|\r/g, " ");   
   }
   
   this.update = function(tableName) {
      log("Updating table " + tableName);
      var sql = renderSkinAsString("sql#" + tableName);
      sql.split(/\n|\r|\n\r/).forEach(function(line) {
         if (!line) {
            return;
         } else if (line.indexOf("#!") === 0) {
            convert(line.substr(2));
         } else {
            this.execute(line);
         }
         return;
      });
      return;
   }
   
   this.id = function() {
      app.data.id || (app.data.id = 0);
      return (app.data.id += 1);
   };
   
   this.error = function() {
      var error = db.getLastError()
      if (error) {
         this.log(error);
         res.abort();
      }
      return;
   };
   
   this.count = function(sql) {
      var count = 0;
      sql = "select count(*) from " + sql;
      this.debug(sql);
      result = db.executeRetrieval(sql);
      if (result.next()) {
         count = result.getColumnItem("count(*)");
      }
      result.release();
      return count;
   }
      
   this.execute = function(sql) {
      this.debug(sql.substr(0, sql.indexOf("\n")));
      db.executeCommand(sql);
      this.error();
      return;
   }
   
   this.retrieve = function(sql) {
      this.debug(sql);
      query = sql;
      return;
   }
   
   this.traverse = function(callback) {
      if (!query || !callback) {
         return;
      }
      var STEP = 10000;
      var rows, offset = 0;      
      while (true) {
         result = db.executeRetrieval(query + 
               " limit " + STEP + " offset " + offset);
         this.error();
         // FIXME: The hasMoreRows() method does not work as expected
         rows = result.next();
         if (!rows) {
            break;
         }
         do {
            var wrapper = new ResultWrapper(result);
            wrapper.update(result);
            callback.call(wrapper.values, result);
         } while (rows = result.next());
         offset += STEP;
      }
      result.release();
      return;
   }
   
   return this;
}

global.updater = this;
global.convert = Updater.convert;
global.sql = new Updater.SqlUtility();
