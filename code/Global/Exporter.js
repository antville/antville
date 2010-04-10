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

var Exporter = {}

Exporter.run = function(site, user) {
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
   
   var baseDir = site.getStaticFile();
   var dir = exportDir = new helma.File(baseDir, "export.temp");

   var log = new helma.File(exportDir, "error.log");
   log.open();

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
         log.writeln(ex);
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
         log.writeln(ex);
      }
   });

   log.close();

   var file = java.io.File.createTempFile("antville-site-export-", ".zip");
   zip.add(exportDir);
   zip.save(file);

   // FIXME: Adding a local file should be a little bit simpler 
   var download = new File();
   download.site = site;
   download.update({file: {contentLength: 0}, file_origin: "file://" + 
         file.getCanonicalPath(), name: site.name + "-export"});
   site.files.add(download);
   download.creator = user;

   site.job = null;
   site.export_id = download._id;
   exportDir.removeDirectory();
   return;
}
