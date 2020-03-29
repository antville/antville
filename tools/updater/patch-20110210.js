// The Antville Project
// http://code.google.com/p/antville
//
// Copyright 2001–2014 by the Workers of Antville.
//
// Licensed under the Apache License, Version 2.0 (the ``License'');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an ``AS IS'' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Apply with enabled updater repository via ant patch -Dpatch.id=20110210

if (Root.VERSION.minor < 1.3) {
  throw Error("Please update the Antville codebase to version 1.3 first.");
}

app.addRepository("modules/helma/Database.js");

var sql = new Sql;

function convertMetadata(prototype, table) {
  table || (table = prototype.name.toLowerCase());

  var start = 0;
  var max, end;

  sql.retrieve("select max(id) as count from $0", table);
  sql.traverse(function() {
    max = this.count;
  });

  while (start < max) {
    end = start + 1000;
    sql.retrieve("select id, metadata from $0 where id >= $1 and id < $2", table, start, end);
    sql.traverse(function() {
      try {
        var newMetadata;
        var parent = prototype.getById(this.id);
        var metadata = eval(this.metadata);
        for (let name in metadata) {
          let value = metadata[name];
          parent.setMetadata(name, value);
        }
      } catch (ex) {
        app.log("***** Original or converted metadata might not be kosher for " +
            prototype.name + " #" + this.id);
        app.log(ex.rhinoException);
      }
    });
    res.commit();
    start = end;
    app.log(java.lang.String.format("Processed %.0f of %.0f %s objects", start, max, prototype.name));
  }

  return;
}

convertMetadata(File);
convertMetadata(Image);
convertMetadata(Layout);
convertMetadata(Site);
convertMetadata(Story, "content");
convertMetadata(User, "account");

sql.execute("drop column metadata from account");
sql.execute("drop column metadata from content");
sql.execute("drop column metadata from file");
sql.execute("drop column metadata from image");
sql.execute("drop column metadata from layout");
sql.execute("drop column metadata from site");
