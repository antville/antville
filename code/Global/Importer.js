//
// The Antville Project
// http://code.google.com/p/antville
//
// Copyright 2001-2010 by The Antville People
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

/**
 * @fileOverviev
 */

var Importer = {}

Importer.run = function(site, user) {
   site.job = null;
   return;

   var file = site.import_id;

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
      
      var index = 1;
      var dir = new java.io.File(importDir, name);
      var list = dir.listFiles();
      for each (var file in list) {
         item.status = "importing " + name + ": " + index++ + " of " + list.length;
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

   return;
}

Importer.add = function(file, site, user) {
   if (!app.data.imports[file]) {
      var item = {
         file: file,
         site: site._id,
         user: user._id,
         status: "queued"
      }
      app.data.imports.push(item);
      return app.data.imports[file] = item; 
   }
   return false;
}

Importer.getStatus = function(file) {
   var item = app.data.imports[file];
   return item ? item.status : null;
}
