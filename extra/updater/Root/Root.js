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

Root.prototype.updater_action = function() {
   // Disabled for safety reasons
   return;

   app.invokeAsync(global, function() {
      if (init()) {
         //update("size"); // DEBUG
         //update("legacy");
         update("tag");
         update("tag_hub");
         update("AV_ACCESSLOG");
         update("AV_CHOICE");
         update("AV_FILE");
         update("AV_IMAGE");
         update("AV_LAYOUT");
         update("AV_MEMBERSHIP");
         update("AV_POLL");
         update("AV_SITE");
         update("AV_SKIN");
         update("AV_TEXT");
         update("AV_USER");
         update("AV_VOTE");
         update("AV_SYSLOG"); // This table has to go last!
         convert("folders");
         convert("root");
         finalize();
      }
      return;
   }, [], -1);
   this.renderSkin("Root");
   return;
}

Root.prototype.out_action = function() {
   res.contentType = "text/plain";
   return out();
}

Root.prototype.nonames_action = function() {
   app.invokeAsync(global, function() {
      ["image", "file"].forEach(function(table) {
         retrieve("select * from " + table + " where name = ''");
         traverse(function() {
            this.name = Date.now() + "-" + this.id;
            var metadata = eval(this.metadata);
            var extension = metadata.contentType.split("/").pop();
            metadata.fileName = this.name + "." + extension; 
            metadata.thumbnailName = this.name + "_small." + extension;
            this.metadata = metadata;
            execute("update " + table + " set name = $name, metadata = " +
                  "$metadata where id = $id", this);
         });
      });
      status("finished");
   }, [], -1);
   this.renderSkin("Root");
   return;
}

Root.prototype.galleries_action = function() {
   var oldDatabase = "antville_1_1";
   app.invokeAsync(global, function() {
      execute("alter table tag_hub add column `tagged_id_old` int(11) default NULL");
      execute("alter table tag_hub add column `tagged_type_old` enum('Story','Image') default NULL");
      execute("update tag_hub set tagged_type_old = tagged_type, tagged_id_old = tagged_id;");
      retrieve(stringf("select tag_hub.*, IMAGE_ALIAS as name, " +
            "IMAGE_F_SITE as site from tag_hub left join $0.AV_IMAGE on " +
            "IMAGE_ID = tagged_id where tagged_id in " +
            "(select IMAGE_ID from $0.AV_IMAGE where IMAGE_TOPIC is not " +
            "null and IMAGE_F_IMAGE_PARENT is null)", oldDatabase));
      traverse(function() {
         execute("update tag_hub set tagged_type = 'Image', tagged_id = " +
               "(select id from image where name = $name and site_id = " +
               "$site and parent_type = 'Site') where id = $id", this);
      });
      status("finished");
   }, [], -1);
   this.renderSkin("Root");
   return;
}

Root.prototype.patch = function(code) {
   eval(code);
}
