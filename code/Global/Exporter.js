var Exporter = {}

Exporter.run = function() {
   var exportXml = function(object, fname) {
      var result = new HopObject;
      for (var key in object) {
         result.version = Root.VERSION;
         result.origin = object.href();
         result.origin_id = object._id;
         var value = object[key];
         if (!value || (value._id && value.constructor !== User)) {
            continue;
         }
         if (value.constructor === User) {
            result[key] = value.name;
         } else {
            result[key] = value;
         }
      }
      Xml.write(result, new java.io.File(dir, fname || object._id + ".xml"));
      return;
   }
   
   var item;
   while (item = app.data.exports.shift()) {
      var site = Site.getById(item.site);
      delete app.data.exports[site.name];

      res.debug(site)
      var baseDir = site.getStaticFile();
      var dir = exportDir = new helma.File(baseDir, "export.temp");
   
      exportDir.makeDirectory();
      exportXml(site, "site.xml");
   
      var zip = new helma.Zip();
   
      dir = new java.io.File(exportDir, "stories");
      dir.mkdirs();
      site.stories.forEach(function() {
         exportXml(this);
      });
   
      dir = new java.io.File(exportDir, "files");
      dir.mkdirs();
      site.files.forEach(function() {
         exportXml(this);
         try {
            zip.add(this.getFile(), "files");
         } catch (ex) {
            res.debug(ex)
         }
      });
      
      dir = new java.io.File(exportDir, "images");
      dir.mkdirs();
      site.images.forEach(function() {
         exportXml(this);
         try {
            zip.add(this.getFile(), "images");
            zip.add(this.getThumbnailFile(), "images");
         } catch (ex) {
            res.debug(ex)
         }
      });
   
      zip.add(exportDir);
      zip.save(new java.io.File(baseDir, site.name + "-export.zip"));
      exportDir.removeDirectory();
      return;
   }
   
   return;
}

Exporter.add = function(site) {
   if (!app.data.exports[site.name]) {
      app.data.exports.push({
         site: site._id,
         status: "queued"
      });
      return app.data.exports[site.name] = true; 
   }
   return false;
}
