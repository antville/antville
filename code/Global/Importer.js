var Importer = {}

Importer.run = function() {
   var item;
   while (item = app.data.imports.shift()) {
      var file = item.file;
      var site = Site.getById(item.site);
      var user = User.getById(item.user);

      var baseDir = site.getStaticFile();
      var importDir = new java.io.File(baseDir, "import.temp");
      var zip = new helma.Zip(file);
      zip.extractAll(importDir);

      var object = Xml.read(new java.io.File(importDir, "site.xml"));
      for (var key in object) {
         switch (key) {
            case "name":
            case "origin":
            case "origin_id":
            case "version":
            break;
            case "creator":
            case "modifier":
            site[key] = user;
            break;
            default:
            res.debug("Settting " + key + " to " + object[key]);
            site[key] = object[key];
            res.debug("New value: " + site[key])
         }
      }
      site.creator = user;
      site.modifier = user;
      
      // Commit is necessary or the mode is set incorrectly (which is strange)
      // Invalidate is necessary to immediately apply metadata values
      res.commit();
      site.invalidate();
      
      var importCollection = function(name) {
         switch (name) {
            case "files":
            var parent = "site";
            var Prototype = File;
            break;
            case "images":
            var parent = "parent";
            var Prototype = Image;
            break;
            case "stories":
            var parent = "site";
            var Prototype = Story;
            break;
            default:
            throw Error("Invalid collection name");
         }
         
         var dir = new java.io.File(importDir, name);
         res.debug(dir)
         for each (var file in dir.listFiles()) {
            if (file.toString().endsWith(".xml")) {
               var object = Xml.read(file);
               object[parent] = site;
               object.creator = object.modifier = user;
               var target = new Prototype;
               for (var key in object) {
                  target[key] = object[key];
               }
               site[name].add(target);
               file["delete"]();
            }
         }
         return;
      }
      
      importCollection("stories");
      importCollection("files");
      importCollection("images");
      
      // Move files directory to final destination
      dest = site.getStaticFile("files");
      dest.removeDirectory();
      (new helma.File(importDir, "files")).renameTo(dest);

      // Move images directory to final destination
      var dest = site.getStaticFile("images");
      dest.removeDirectory();
      (new helma.File(importDir, "images")).renameTo(dest);

      site.getStaticFile("import.temp").removeDirectory();

      delete app.data.imports[file];
   }

   return;
}

Importer.add = function(file, site, user) {
   //if (!app.data.imports[file]) {
      app.data.imports.push({
         file: file,
         site: site._id,
         user: user._id,
         status: "queued"
      });
      return app.data.imports[file] = true; 
   //}
   return false;
}
