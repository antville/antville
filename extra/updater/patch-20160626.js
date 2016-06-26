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

// Apply with enabled updater repository using `ant patch -Dpatch.id=20160626`
var sql = new Sql();

sql.retrieve("select * from metadata where parent_type in ('Image', 'File') and name = 'origin'");

sql.traverse(function() {
  if (!/(?:https?|ftp):\/\//i.test(this.value)) {
    sql.execute("delete from metadata where id = $0", this.id);
  }
});
