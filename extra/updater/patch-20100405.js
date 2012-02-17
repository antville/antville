// The Antville Project
// http://code.google.com/p/antville
//
// Copyright 2007-2011 by Tobi Schäfer.
//
// Copyright 2001–2007 Robert Gaggl, Hannes Wallnöfer, Tobi Schäfer,
// Matthias & Michael Platzer, Christoph Lincke.
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

// Apply with enabled updater repository via ant patch -Dpatch.id=20100405

var sql = new Sql;
var template;

// Remove MySQL-specific constraints (enum types)
// The database user needs “alter” permission for this patch:
// mysql -e "grant all on antville.* to 'antville'@'localhost'"
// Afterwards user permissions should be restored:
// mysql -e "grant select, insert, update, delete on antville.* to 'antville'@'localhost'"
if (app.getDbSource("antville").isMySQL()) {
   template = "alter table $0 modify column $1 varchar(20) default null";
   sql.execute(template, "account", "status");
   sql.execute(template, "content", "comment_mode");
   sql.execute(template, "content", "mode");
   sql.execute(template, "content", "parent_type");
   sql.execute(template, "content", "prototype");
   sql.execute(template, "content", "status");
   sql.execute(template, "file", "prototype");
   sql.execute(template, "file", "parent_type");
   sql.execute(template, "image", "prototype");
   sql.execute(template, "image", "parent_type");
   sql.execute(template, "layout", "mode");
   sql.execute(template, "log", "context_type");
   sql.execute(template, "membership", "role");
   sql.execute(template, "poll", "status");
   sql.execute(template, "site", "status");
   sql.execute(template, "site", "mode");
   sql.execute(template, "tag", "type");
   sql.execute(template, "tag_hub", "tagged_type");
}

// Convert membership roles to lowercase
template = "update membership set role = '$0' where role = '$1'";
sql.execute(template, "subscriber", "Subscriber");
sql.execute(template, 'contributor', 'Contributor');
sql.execute(template, 'manager', 'Manager');
sql.execute(template, 'owner', 'Owner');

// Convert notification modes to lowercase
root.forEach(function() {
   if (this.notificationMode !== null) {
      this.notificationMode = this.notificationMode.toLowerCase()
   }
});
