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

// Apply with enabled updater repository via ant patch -Dpatch.id=20110301

var sql = new Sql();
var sql2 = new Sql();
for each (let table in ["file", "image", "tag"]) {
  sql.retrieve("select * from $0 where name like '%?%';", table);
  sql.traverse(function() {
    var name = "-".repeat(this.name.count("?"));
    sql2.execute("update $0 set name = '$1' where id = $2", table, name, this.id);
  });
}
