//
// The Antville Project
// http://code.google.com/p/antville
//
// Copyright 2001-2011 by The Antville People
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

// Apply with enabled updater repository via ant patch -Dpatch.id=20110210

if (Root.VERSION.minor < 1.3) {
   throw Error("Please update the Antville codebase to version 1.3 first.");
}

var sql = new Sql;

function convertMetadata(prototype, table) {
   table || (table = prototype.name.toLowerCase());
   sql.retrieve("select id, metadata from $0", table);
   sql.traverse(function() {
      var newMetadata;
      var metadata = eval(this.metadata);
      for (let key in metadata) {
         let value = metadata[key];
         if (value === null || value === undefined) {
            continue;
         }
         let parent = prototype.getById(this.id);
         parent.setMetadata(key, value);
      }
   });
   return;
}

convertMetadata(File);
convertMetadata(Image);
convertMetadata(Layout);
convertMetadata(Site);
convertMetadata(Story, "content");
convertMetadata(User, "account");

/*sql.execute("drop column metadata from account");
sql.execute("drop column metadata from content");
sql.execute("drop column metadata from file");
sql.execute("drop column metadata from image");
sql.execute("drop column metadata from layout");
sql.execute("drop column metadata from site");*/
