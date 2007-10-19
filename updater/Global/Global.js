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
         width: this.width,
         height: this.height,
         description: this.description,
         thumbnailName: this.fileName + "_small" + this.type,
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
         return Xml.readFromString(clean).toSource();
      } catch (ex) {
         app.debug(xml);
      }
      return {}.toSource();
   };
   
   retrieve(sql("jsonize", table));
   traverse(function() {
      if (!this.xml) {
         return;
      }
      var data = metadata(this.xml);
      execute("update " + table + " set metadata = " + 
            quote(data) + " where id = " + this.id);
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
   var dump = function(sql) {
      retrieve(sql);
      traverse(function() {
         var fpath = app.dir + "/../static/" + this.site_name + 
               "/layouts/" + this.name + "/" + this["prototype"];
         var file = new java.io.File(fpath);
         file.mkdirs();
         file = new java.io.File(file, 
               this.skin_name.replace(/\//, "_") + ".skin");
         debug(file.getCanonicalPath());
         file["delete"]();
         var fos = new java.io.FileOutputStream(file);
         var bos = new java.io.BufferedOutputStream(fos);
         var writer = new java.io.OutputStreamWriter(bos, "UTF-8");
         writer.write(this.SKIN_SOURCE || "");
         writer.close();
         bos.close();
         fos.close();
      });
   }
   
   dump(sql("skins"));
   dump("select skin.id, 'www' as site_name, layout.name, " +
         "skin.name as skin_name, prototype, SKIN_SOURCE from " +
         "skin, layout where skin.layout_id = layout.id and " +
         "layout.site_id is null");
}
