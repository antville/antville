Root.prototype.convert_action = function() {
   return convert(req.data.type);
};

var convert = function(type) {
   type || (type = String.EMPTY);
   
   var rows, sql, counter = 1;
   var db = getDBConnection("antville");

   function quote(s) {
      return "'" + s.replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
   }
   
   function forEachRow(callback) {
      return app.invokeAsync(null, function() {
         if (!rows) {
            return;
         }
         while (rows.next()) {
            callback(rows);
            write(".");
         }
         writeln("");
         rows.release();
      }, [], -1);
   }
      
   switch (type.toLowerCase()) {
      case "images":
      var where = "where img.image_f_image_thumb = thumb.id and " +
                  "thumb.image_width is not null and thumb.image_height is " +
                  "not null";
      app.invokeAsync(null, function() {
         rows = db.executeRetrieval("select count(*) as max from " + 
               "av_image img, av_image thumb " + where);
         rows.next();
         var max = rows.getColumnItem("max");
         var offset = 0;
         rows.release();
         do {
            var query = "select img.image_id as id, img.image_filename as " + 
                  "name, img.image_fileext as type, img.image_width as " +
                  "width, img.image_height as height, img.image_alttext as " +
                  "description, img.image_filesize as size, " +
                  "img.image_metadata as metadata, thumb.image_width as twd " +
                  "thumb.image_height as twh from av_image img, " +
                  "av_image thumb " + where + " order by image_id limit " +
                  "10000 offset " + offset;
            rows = db.executeRetrieval(query);
            writeln("Processing rows #" + offset + " - #" + (offset + 10000));
            forEachRow(function(rows) {
               var id = rows.getColumnItem("id");
               var metadata = eval(rows.getColumnItem("metadata")) || {};
               var fileName = rows.getColumnItem("name");
               metadata.fileName = fileName;
               metadata.fileType = rows.getColumnItem("type");
               metadata.fileSize  = rows.getColumnItem("fileSize") || 0;
               metadata.width = rows.getColumnItem("width");
               metadata.height = rows.getColumnItem("height");
               metadata.description = rows.getColumnItem("description");
               metadata.thumbnailWidth = rows.getColumnItem("twd");
               metadata.thumbnailHeight = rows.getColumnItem("twh");
               sql = "update av_image set image_metadata = " +
                     quote(metadata.toSource()) + " where image_id = " + id;
               db.executeCommand(sql);
               //writeln(sql);
            }).waitForResult();
            res.commit();
            offset += 10000;
         } while (offset < max);
      }, [], -1);
      break;

      case "layouts":
      var query = "select layout_id, layout_title, layout_description, " +
            "layout_isimport, layout_preferences_new from av_layout";
      rows = db.executeRetrieval(query);
      forEachRow(function(rows) {
         var id = rows.getColumnItem("layout_id");
         var metadata = eval(rows.getColumnItem("layout_preferences_new"));
         metadata.title = rows.getColumnItem("layout_title") ||
               "Layout #" + id;
         metadata.description = rows.getColumnItem("layout_description");
         if (rows.getColumnItem("layout_isimport")) { 
            var layout = Layout.getById(id);
            if (layout.site) {
               // FIXME: metadata.origin = layout.href();
               metadata.origin = "http://" + layout.site.name + 
                     ".antville.org/layouts/" + layout.alias + "/";
            }
         }
         sql = "update av_layout set layout_preferences_new = " + 
               quote(metadata.toSource()) + " where layout_id = " + id;
         db.executeCommand(sql);
         writeln(sql);
      });
      break;
      
      case "sites":
      var query = "select site_email, site_lastupdate, site_lastoffline, " +
            "site_lastblockwarn, site_lastdelwarn, site_lastping, " +
            "site_enableping, metadata, mode, title, id from av_site";
      rows = db.executeRetrieval(query);
      forEachRow(function(rows) {
         var id = rows.getColumnItem("id");
         var metadata = eval(rows.getColumnItem("metadata"));
         metadata.email = rows.getColumnItem("site_email");
         metadata.title = rows.getColumnItem("title");
         /* metadata.lastUpdate = rows.getColumnItem("site_lastupdate");
         metadata.pageSize = metadata.days || 3;
         metadata.pageMode = "days";
         metadata.timeZone = metadata.timezone || "CET";
         metadata.archiveMode = metadata.archive ? "online" : "offline";
         metadata.commentsMode = metadata.discussions ? "online" : "offline";
         metadata.shortDateFormat = metadata.shortdateformat;
         metadata.longDateFormat = metadata.longdateformat;
         metadata.offlineSince = rows.getColumnItem("site_lastoffline");
         metadata.notifiedOfBlocking = rows.getColumnItem("site_lastblockwarn");
         metadata.notifiedOfDeletion = rows.getColumnItem("site_lastdelwarn");
         metadata.webHookEnabled = rows.getColumnItem("site_enableping");
         metadata.webHookLastUpdate = rows.getColumnItem("site_lastping");
         if (metadata.country) {
            metadata.locale += "_" + metadata.country;
         } */
         var mode = metadata.usercontrib ? 'open' : rows.getColumnItem("mode");
         for each (var key in ["enableping", "usercontrib", "archive",
               "discussions", "days", "shortdateformat", "longdateformat",
               "linkcolor", "alinkcolor", "vlinkcolor", "smallcolor",
               "titlecolor", "titlefont", "textfont", "textcolor", "smallsize",
               "smallfont", "textsize", "titlesize", "timezone", "bgcolor",
               "country"]) {
            delete metadata[key];
         }
         sql = "update av_site set metadata = " + quote(metadata.toSource()) +
               ", mode = " + quote(mode) + " where id = " + id;
         db.executeCommand(sql);
         res.commit();
         writeln(sql); 
      });
      break;

      case "users":
      var query = "select user_id, hash, salt, user_url from av_user";
      rows = db.executeRetrieval(query);
      while (rows && rows.next()) {
         sql = "update av_user set metadata = " + quote({
            hash: rows.getColumnItem("hash"),
            salt: rows.getColumnItem("salt"),
            url: rows.getColumnItem("user_url")
         }.toSource()) + " where user_id = " + rows.getColumnItem("user_id");
         writeln(sql);
         db.executeCommand(sql);
      }
      break;
   }

   return;
};

Root.prototype.topic2tag_action = function() {
return;
   var db = getDBConnection("antville");
   var tagCounter = 1;
   var hubCounter = 1;

   function quote(s) {
      return "'" + s + "'";
   }
   
   function createTags(siteId, taggedType) {
      var sql;
      var query = "select text_topic as tag from av_text where text_f_site = " +
            siteId + " and text_topic is not null group by text_topic";
      if (taggedType === "Image") {
         query = query.replace(/text/g, "image");
      }
      writeln(query);
      var rows = db.executeRetrieval(query);
      while (rows && rows.next()) {
         sql = "insert into tag values (" + [tagCounter, siteId, 
               quote(rows.getColumnItem("tag").replace(/^[\/\.]*$/, "?")), 
               quote(taggedType)] + ")";
         writeln(sql);
         db.executeCommand(sql);
         tagCounter += 1;
      }
      rows && rows.release();
      return;
   }

   function createHubs(siteId, taggedType) {
      var sql;
      var query = "select text_topic as name, tag.id as tagId, " +
            "text_content_new as meta, text_id as taggedId, " +
            "text_f_user_modifier as modifier, text_f_user_creator as " +
            "creator, text_f_site as siteId from av_text, tag where " +
            "text_topic is not null and text_topic = tag.name and " +
            "tag.type = '" + taggedType + "' and text_f_site = " + siteId;
      if (taggedType === "Image") {
         query = query.replace(/text/g, "image");
         query = query.replace(/content_new/g, "metadata");
      }
      writeln(query);
      var rows = db.executeRetrieval(query);
      while (rows && rows.next()) {
         sql = "insert into tag_hub values (" + [hubCounter, 
               rows.getColumnItem("tagId"), rows.getColumnItem("taggedId"), 
               quote(taggedType), rows.getColumnItem("modifier") || 
               rows.getColumnItem("creator")] + ")";
         writeln(sql);
         db.executeCommand(sql);
         data = rows.getColumnItem("meta");
         if (data) {
            data = eval(data);
            data.tags = rows.getColumnItem("name");
         } else {
            data = {tags: rows.getColumnItem("name")};
         }
         data = data.toSource().replace(/\\/g, "\\\\").replace(/'/g, "\\'");
         sql = "update av_text set text_content_new = '" + data +
               "' where text_id = " + rows.getColumnItem("taggedId");
         if (taggedType === "Image") {
            sql = sql.replace(/text/g, "image");
            sql = sql.replace(/content_new/g, "metadata");
         }
         writeln(sql);
         db.executeCommand(sql);
         hubCounter += 1;
      }
      rows && rows.release();
      return;
   }
   
   //var id = 1184; //3;
   app.invokeAsync(null, function() {
      /* createTags(id, "Story");
      createHubs(id, "Story");
      createTags(id, "Image");
      createHubs(id, "Image");
      return; */

      var max = root.size();
      for (var i=1; i<=max; i+=1) {
         var site = root.get(i-1); // Site.getById(11);
         app.logger.info("Tagging stories of site " + site._id + " ``" + 
               site.alias + "'' (" + i + " of " + max + ")");
         createTags(site._id, "Story");
         createHubs(site._id, "Story");
         createTags(site._id, "Image");
         createHubs(site._id, "Image");
         continue;

         var smax = site.stories.size();
         counter = 0;
         for (var n=0; n<smax; n+=1) {
            var story = site.stories.get(n);
            if (story.topic) {
               //app.logger.info("***** Tagging story " + (n+1) + " of " + smax);
               story.tags.add(new TagJoin(story.topic, story, site, 
                     story.modifier || story.creator));
               story.content.set("tags", story.topic);
               res.commit();
            }
         }
      }
   }, [], -1);
};

Root.prototype.xml2json_action = function() {
   var db = getDBConnection("antville");
   var table, chunkSize = 10000;

   var getSql = function(type) {
      var sql;
      var column = (table === "TEXT" ? "CONTENT" : "PREFERENCES");
      switch (type) {
         case "create":
         sql = "alter table AV_$T add $T_$C_NEW mediumtext default " +
               "null after $T_$C";
         break;
         case "max":
         //sql = "select 1 as max";
         sql = "select max($T_ID) as max, count($T_ID) as amount from AV_$T";
         break;
         case "list":
         //sql = "select $T_ID, $T_$C from AV_$T where TEXT_F_SITE = 3" +
         //      " order by $T_ID limit 1000";
         sql = "select $T_ID, $T_$C as old, $T_$C_NEW as new from AV_$T " +   
               "where $T_ID > " + arguments[1] + " order by $T_ID limit " +
               chunkSize;
         break;
         case "update":
         sql = "update AV_$T set $T_$C_NEW = '" + arguments[2] + 
               "' where $T_ID = " + arguments[1];
         break;
         case "rename":
         sql = "alter table AV_$T change $T_$C $T_$C_OLD " +
               "mediumtext default null; alter table AV_$T change " +
               "$T_$C_NEW $T_$C mediumtext default null";
         break;
         case "drop":
         sql = "drop column $T_PREFERENCES from AV_$T";
         break;
         default:
         throw Error("No such SQL");
      }
      sql = sql.replace(/\$T/g, table).replace(/\$C/g, column);
      //(type !== "update") && writeln(sql);
      return sql;
   };
   
   app.invokeAsync(null, function() {
      var log = new java.io.FileWriter("apps/antville/conversion.log");
      var rows, max, amount, data, counter, ref;
      var id = 0;
      main:
      for each (table in ["TEXT"]) {
      //for each (table in ["TEXT", "SITE", "LAYOUT"]) {
         db.executeCommand(getSql("create"));
         rows = db.executeRetrieval(getSql("max"));
         rows.next();
         max = rows.getColumnItem("max");
         amount = rows.getColumnItem("amount");
         rows.release();
         counter = 0;
         while (id < max) {
            rows = db.executeRetrieval(getSql("list", id));
            while (rows && rows.next()) {
               id = rows.getColumnItem(table + "_ID");
               if (rows.getColumnItem("new")) {
                  continue;
               } else {
                  app.debug(id + " has no new data, yet!");
                  continue;
               }
               try {
                  data = rows.getColumnItem("old");
                  data = data.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, "");
                  data = Xml.readFromString(data);
                  db.executeCommand(getSql("update", id,
                        data.toSource().replace(/\\/g, 
                        "\\\\").replace(/'/g, "\\'")));
               } catch (x) {
                  ref = Story.getById(id) || Comment.getById(id);
                  log.write(ref.href() + "\n");
                  log.write(x + "\n");
                  log.write("***\n");
                  log.flush();
                  //app.logger.error("!!! Error in XML data of TEXT_ID " + id);
                  //app.logger.error(x);
                  //break main;
               }
            }
            rows && rows.release();
            counter += chunkSize;
            app.logger.info("Converted " + table + " " + counter + " of " + 
                  amount + " records");
            app.logger.info("Current ID: " + id + " of " + max);
         }
         //db.executeCommand(getSql("rename"));
         //db.executeCommand(getSql("drop"));
      }
      log.write("### Finished conversion with ID " + id);
      log.close();
   }, [], -1); 
};

Root.prototype.exportSkins_action = function() {
   var db = getDBConnection("antville");

   var exportSkins = function(query) {
      var lastId;
      var rows = db.executeRetrieval(query);
      while (rows && rows.next()) {
         var fpath = getProperty("staticPath") + rows.getColumnItem("SITE_ALIAS") +
               "/layouts/" + rows.getColumnItem("LAYOUT_ALIAS") + "/" +
               rows.getColumnItem("SKIN_PROTOTYPE");
         var file = new java.io.File(fpath);
         file.mkdirs();
         file = new java.io.File(fpath, 
               rows.getColumnItem("SKIN_NAME").replace(/\//, "_") + ".skin");
         //app.logger.info("Exporting skin #" + counter + ": " + file);
         file["delete"]();
         var fos = new java.io.FileOutputStream(file);
         var bos = new java.io.BufferedOutputStream(fos);
         var writer = new java.io.OutputStreamWriter(bos, "UTF-8");
         //var writer = new java.io.FileWriter(file);
         writer.write(rows.getColumnItem("SKIN_SOURCE") || "");
         writer.close();
         bos.close();
         fos.close();
         lastId = rows.getColumnItem("SKIN_ID");
      }
      rows && rows.release();
      return lastId;
   };
   
   // Export skins of root layouts
   exportSkins("select SKIN_ID, 'default' as SITE_ALIAS, LAYOUT_ALIAS, " +
         "SKIN_PROTOTYPE, SKIN_NAME, SKIN_SOURCE  from AV_LAYOUT, AV_SKIN " +
         "where LAYOUT_F_SITE is null and SKIN_F_LAYOUT = LAYOUT_ID;");

   // Export skins of site layouts
   app.invokeAsync(null, function() {
      var counter = 0;
      var lastId = 0;
      var rows = db.executeRetrieval("select max(SKIN_ID) as max, count(*) " +
            "as amount from AV_SKIN");
      rows.next()
      var max = rows.getColumnItem("max");
      var amount = rows.getColumnItem("amount");
      rows.release();
      while (lastId < max) {
         lastId = exportSkins("select SKIN_ID, SITE_ALIAS, LAYOUT_ALIAS, " +
               "SKIN_PROTOTYPE, SKIN_NAME, SKIN_SOURCE from AV_SITE, AV_LAYOUT, " +
               "AV_SKIN where SKIN_F_LAYOUT = LAYOUT_ID and LAYOUT_F_SITE = " +
               "SITE_ID and SKIN_ID > " + lastId + " order by SKIN_ID limit 100;");
         counter += 100;
         app.logger.info("Exported " + counter + " of " + amount + " skins");
         app.logger.info("Current ID: " + lastId + " of " + max);
      }
   }, [], -1);
   
   return;
};
