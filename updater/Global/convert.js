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
// $Revision:3427 $
// $LastChangedBy:piefke3000 $
// $LastChangedDate:2008-04-12 19:31:20 +0200 (Sat, 12 Apr 2008) $
// $URL:https://antville.googlecode.com/svn/trunk/updater/Global/Updater.js $
//

var convert = function(type) {
   if (!type) {
      return;
   }
   
   var func;
   if (func = arguments.callee[type]) {
      try {
         func();
      } catch (ex) {
         error(ex.toString());
      }
   } else {
      execute(query(type));
   }
}

convert.files = function() {
   retrieve(query("files"));
   traverse(function() {
      var metadata = {
         //fileName: this.name,
         contentType: this.type,
         contentLength: this.size,
         description: clean(this.description)
      }
      execute("update file set prototype = 'File', parent_type = 'Site', " +
            "parent_id = site_id, metadata = " +
            quote(metadata.toSource()) + " where id = " + this.id);
   });
}

convert.images = function() {
   retrieve(query("images"));
   traverse(function() {
      var metadata = {
         fileName: this.fileName + "." + this.type,
         contentLength: this.size || 0,
         contentType: "image/" + this.type,
         width: this.width,
         height: this.height
      };
      this.description && (metadata.description = clean(this.description));
      if (this.thumbnailWidth && this.thumbnailHeight) {
         metadata.thumbnailName = this.fileName + "_small" + "." + this.type;
         metadata.thumbnailWidth = this.thumbnailWidth;
         metadata.thumbnailHeight = this.thumbnailHeight;
      }
      execute("update image set metadata = " +
            quote(metadata.toSource()) + " where id = " + this.id);
   });
   convert.tags("image");
}

convert.layoutImages = function() {
   retrieve(query("layoutImages"));
   execute("alter table image change id id int(11) not null auto_increment");
   traverse(function() {
      var metadata = {
         fileName: this.fileName + "." + this.type,
         contentLength: this.contentLength || 0,
         contentType: "image/" + this.type,
         width: this.width,
         height: this.height
      };
      this.description && (metadata.description = clean(this.description));
      if (this.thumbnailWidth && this.thumbnailHeight) {
         metadata.thumbnailName = this.fileName + "_small" + "." + this.type;
         metadata.thumbnailWidth = this.thumbnailWidth;
         metadata.thumbnailHeight = this.thumbnailHeight;
      }
      execute("insert into image values (null, " + this.site_id + ", 'LayoutImage', " + 
            quote(this.name) + ", str_to_date('" + 
            this.created.format("yyyyMMdd HHmmss") + "', '%Y%m%d %H%i%s'), " + 
            this.creator_id + ", null, null, " + 
            this.layout_id + ", 'Layout', " + quote(metadata.toSource()) + ", null, null, null)");
      var fpath = antville().properties.staticPath;
      var files = [metadata.fileName, metadata.thumbnailName];
      for each (var fname in files) {
         var source = new helma.File(fpath + "/layouts/" + this.parent_name, fname);
         var layoutDir = new helma.File(fpath + this.site_name + "/layouts/", this.layout_name);
         layoutDir.exists() || layoutDir.makeDirectory();
         var dest = new helma.File(layoutDir, fname);
         if (source.exists()) {
            log("Copy " + source + " to " + dest);
            if (dest.exists()) {
               dest.remove();
            }
            source.hardCopy(dest);
         }
      }
   });
   execute("alter table image change id id int(11) not null");
}

convert.layouts = function() {
   convert.xml("layout");
   retrieve(query("layouts"));
   traverse(function() {
      var metadata = eval(this.metadata) || {};
      metadata.title = this.LAYOUT_TITLE || "Layout #" + this.id;
      metadata.description = this.LAYOUT_DESCRIPTION;
      if (this.LAYOUT_ISIMPORT) {
         // FIXME: metadata.origin = Layout.getById(id).href();
      }
      execute("update layout set metadata = " + 
            quote(metadata.toSource()) + " where id = " + this.id);
   });
}

convert.sites = function() {
   convert.xml("site");
   retrieve(query("sites"));
   traverse(function() {
      var metadata = eval(this.metadata) || {};
      metadata.email = this.SITE_EMAIL;
      metadata.title = this.SITE_TITLE;
      metadata.configured = this.SITE_LASTUPDATE;
      metadata.pageSize = metadata.days || 3;
      metadata.pageMode = "days";
      metadata.timeZone = metadata.timezone || "CET";
      metadata.archiveMode = metadata.archive ? "public" : "closed";
      metadata.commentMode = metadata.discussions ? "enabled" : "disabled";
      metadata.shortDateFormat = metadata.shortdateformat;
      metadata.longDateFormat = metadata.longdateformat;
      metadata.closed = this.SITE_LASTOFFLINE;
      metadata.notifiedOfBlocking = this.SITE_LASTBLOCKWARN;
      metadata.notifiedOfDeletion = this.SITE_LASTDELWARN;
      metadata.webHookMode = this.SITE_ENABLEPING ? 
            "enabled" : "disabled";
      metadata.webHookCalled = this.SITE_LASTPING;
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
   execute("alter table tag change id id int(11) not null auto_increment")
   execute("alter table tag_hub change id id int(11) not null auto_increment");

   /* retrieve("select TEXT_ID as id from AV_TEXT where TEXT_TOPIC is null");
   traverse(function() {
      execute("update AV_TEXT set TEXT_TOPIC = '' where TEXT_ID = " + this.id);
   }); */

   retrieve("select distinct(TEXT_TOPIC) as topic, TEXT_F_SITE as site_id from AV_TEXT where TEXT_TOPIC <> ''");
   traverse(function() {
      execute("insert into tag set site_id = " + 
            this.site_id + ", name = " +
            quote(this.topic.replace(/^[\/\.]*$/, "?")) + ", type = 'Story'");
   });

   /* retrieve("select TEXT_TOPIC, tag.id, TEXT_ID as tagged_id, " +
         "TEXT_F_USER_MODIFIER as modifier_id, TEXT_F_USER_CREATOR as creator_id, TEXT_F_SITE from AV_TEXT, " +
         "tag where TEXT_TOPIC is not null and TEXT_TOPIC = tag.name and " +
         "tag.type = 'Story'");
   traverse(function() {
      execute("insert into tag_hub set tag_id = " + 
            this.id + ", tagged_id = " + this.tagged_id + 
            ", tagged_type = 'Story', user_id = " +
            this.modifier_id || this.creator_id);
   }); */

   var metadata = function(xml) {
      try {
         return Xml.readFromString(clean(xml));
      } catch (ex) {
         app.debug(ex);
      }
      return {};
   }

   retrieve("select * from AV_TEXT left join tag on TEXT_F_SITE = site_id and TEXT_TOPIC = name and type = 'Story' order by TEXT_ID");
   traverse(function() {
      this.name = this.ALIAS || "";
      if (this.TEXT_PROTOTYPE === "Comment") {
         if (!this.TEXT_F_TEXT_PARENT) {
            this.parent_type = "Story";
            this.TEXT_F_TEXT_PARENT = this.TEXT_F_TEXT_STORY;
         } else {
            this.parent_type = "Comment";
         }
         this.status = "public";
         this.mode = "hidden";
         this.comment_mode = "open"; 
      } else {
         this.TEXT_F_TEXT_STORY = this.TEXT_F_TEXT_PARENT = null;
         this.parent_type = null;
         this.status = "closed";
         if (this.TEXT_ISONLINE != 1) {
            this.status = "public";
         }
         if (this.TEXT_EDITABLEBY == 1) {
            this.status = "shared";
         } else if (this.TEXT_EDITABLEBY == 2) {
            this.status = "open";
         }
         if (this.TEXT_ISONLINE == 1) {
            this.mode = "hidden";
         } else {
            this.mode = "featured";
         }
         this.comment_mode = this.TEXT_HASDISCUSSIONS == 1 ? "open" : "closed";
      }
      this.metadata = metadata(this.TEXT_CONTENT);
      execute("insert into content values ($TEXT_ID, $name, " +
            "$TEXT_PROTOTYPE, $TEXT_F_SITE, $TEXT_F_TEXT_STORY, " +
            "$TEXT_F_TEXT_PARENT, $parent_type, $TEXT_READS, $status, " +
            "$mode, $comment_mode, $metadata, $TEXT_CREATETIME, " +
            "$TEXT_F_USER_CREATOR, $TEXT_MODIFYTIME, $TEXT_F_USER_MODIFIER)", 
            this);
      if (this.TEXT_TOPIC) {
         execute("insert into tag_hub set tag_id = $0, tagged_id = $1, " +
               "tagged_type = 'Story', user_id = $2", this.id, this.TEXT_ID, 
               this.TEXT_F_USER_MODIFIER || this.TEXT_F_USER_CREATOR);
      }
      execute("delete from AV_TEXT where TEXT_ID = " + this.TEXT_ID);
   }, true);

   execute("alter table tag change id id int(11)")
   execute("alter table tag_hub change id id int(11)");
}

convert.users = function() {
   retrieve("select id, hash, salt, USER_URL from user");
   traverse(function() {
      var metadata = {
         hash: this.hash,
         salt: this.salt,
         url: this.USER_URL
      }
      execute("update user set metadata = " + 
            quote(metadata.toSource()) + " where id = " + this.id);
   });
}

convert.xml = function(table) {
   var metadata = function(xml) {
      try {
         return Xml.readFromString(clean(xml));
      } catch (ex) {
         app.debug(ex);
      }
      return {};
   };
   retrieve(query("jsonize", table));
   traverse(function() {
      var data = metadata(this.xml);
      execute("update " + table + " set metadata = " + 
            quote(data.toSource()) + ", xml = '' where id = " + this.id);
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

   /* retrieve("select id from " + table + " where topic is null");
   traverse(function() {
      execute("update " + table + " set topic = '' where id = " + this.id);
   }); */
   retrieve("select distinct(topic), site_id from " + table + " where topic <> ''");
   execute("alter table tag change id id int(11) not null auto_increment")
   traverse(function() {
      execute("insert into tag set site_id = " + 
            this.site_id + ", name = " +
            quote(this.topic.replace(/^[\/\.]*$/, "?")) + ", type = " +  
            quote(prototype));
   });
   execute("alter table tag change id id int(11)")

   retrieve("select topic, tag.id, " + table + ".id as tagged_id, " +
         "modifier_id, creator_id, " + table + ".site_id from " + table + 
         ", tag where " + "topic <> '' and topic = tag.name and " +
         "tag.type = " + quote(prototype));
   execute("alter table tag_hub change id id int(11) not null auto_increment;")
   traverse(function() {
      execute("insert into tag_hub set tag_id = " + 
            this.id + ", tagged_id = " + this.tagged_id + 
            ", tagged_type = " + quote(prototype) + ", user_id = " +
            this.modifier_id || this.creator_id);
   });
   execute("alter table tag_hub change id id int(11)")
}

convert.skins = function() {
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
               return arguments[1] + "value " + quote(value);
            }
            return arguments[0];
         });
         return source;
      }
   }
   
   var move = function(sourcePath, destPath) {
      var source = new helma.File(sourcePath);
      if (source.exists()) {
         var destination = new helma.File(destPath);
         if (destination.exists()) {
            destination.removeDirectory();
         }
         destination.makeDirectory();
         var files = source.list();
         for each (var fname in files) {
            (new helma.File(source, fname)).hardCopy(new helma.File(destination, fname));
         }
      }
      return destPath;
   }

   var save = function(skins, fpath) {
      if (!skins) {
         return;
      }
      
      for (var prototype in skins) {
         res.push();
         var skinset = skins[prototype];
         for (var skinName in skinset) {
            res.writeln("<% #" + skinName + " %>");
            skinset[skinName] && res.writeln(skinset[skinName].trim());
         }
         var data = res.pop();

         if (data) {
            var dir =  new java.io.File(fpath, prototype);
            dir.exists() || dir.mkdirs();
            var file = new java.io.File(dir, prototype + ".skin");
            file.exists() && file["delete"]();
            log(file.getCanonicalPath());
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
   var skinfiles = antville().getSkinfiles();

   for (var prototype in skinfiles) {
      // Ignore lowercase prototypes
      if (prototype.charCodeAt(0) > 90) {
         continue;
      }
      appSkins[prototype] || (appSkins[prototype] = {});
      var skin = createSkin(skinfiles[prototype][prototype]);
      var subskins = skin.getSubskinNames();
      for each (var name in subskins) {
         appSkins[prototype][name] = skin.getSubskin(name).getSource();
      }
   }
   
   var current, fpath, skins;
   retrieve(query("skins"));
   traverse(function() {
      var site = this.site_name  || "";
      if (current !== site + this.layout_name) {
         save(skins, fpath);
         current = site + this.layout_name;
         fpath = antville().properties.staticPath + site;
         if (!site) {
            return; // FIXME: root layouts not ready, yet
            var file = new helma.File("db/antville/0.xml");
            var xml = file.readAll();
            var rootLayoutId = /sys_layout idref="(\d)*"/.exec(xml)[1] || 1;
            fpath += rootLayoutId == this.layout_id ?
                  "/layout/" : "/layouts/" + this.layout_name;
         } else { // FIXME: CLEANUP!!!!
            /*if (this.layout_id === this.current_layout) {
               fpath = move(fpath + "/layouts/" + this.layout_name, 
                     fpath + "/layout/");
            } else {*/
               fpath += "/layouts/" + this.layout_name;
            //}
         }
         skins = appSkins.clone({}, true);
         skins.Site.values = values(this.layout_metadata);
      }

      if (!this.prototype || !this.name) {
         return;
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
         // FIXME: Ugly hack to change Membership to Members in a few skins
         if (prototype === "Membership" && 
               (skinName === "login" || skinName === "status")) {
            source = source.replace(/(<%\s*)this./g, "$1members.");
         }
         ref = (skins[prototype] || (skins[prototype] = {}));
         ref[skinName] = clean(source);
      }
      if (parent !== null && parent !== undefined) {
         execute("update skin set source = '" + 
               clean(parent).replace(/'/g, "\\'") + "' where " + 
               'id = ' + this.id);
      }
   });
   // One last time to be sure every layout's skins are saved
   save(skins, fpath);
   return;
}

convert.folders = function() {
   retrieve("select site.name as site_name, layout.name as layout_name from " +
         "site left join layout on site.layout_id = layout.id");
   traverse(function() {
      var dir = antville().properties.staticPath + this.site_name;
      var source = new helma.File(dir, "layouts/" + this.layout_name);
      var dest = new helma.File(dir, "layout");
      log("Copy " + source + " to " + dest);
      if (dest.exists()) {
         dest.removeDirectory();
      }
      source.renameTo(dest);
   });
}

convert.root = function() {
   var rootId = antville().__app__.getProperty("rootId");
   var staticDir = antville().properties.staticPath;
   retrieve("select name from site where id = " + rootId);
   traverse(function() {
      if (this.name === "www") {
         return;
      }
      var dir = new helma.File(staticDir, this.name);
      var files = dir.list();
      for each (fname in files) {
         var source = new helma.File(dir, fname);
         var dest = new helma.File(staticDir, "www/" + fname);
         log("Rename " + source + " to " + dest);
         source.renameTo(dest);
      }
      return;
   });
   execute("update site set name = 'www' where id = " + rootId);
   return;
}
