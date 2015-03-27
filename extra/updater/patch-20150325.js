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

// Apply with enabled updater repository using `ant patch -Dpatch.id=20150325`
var sql = new Sql();

var next_id;
sql.retrieve("select max(id) as max_id from metadata");
sql.traverse(function () {
  next_id = this.max_id + 1;
});

sql.retrieve("select s.id, s.name as site_name, m.name, m.value from site s left outer join metadata m on m.parent_type = 'Site' and m.parent_id = s.id and m.name = 'trollFilter' order by s.name");
sql.traverse(function () {
  writeln('Processing site ' + this.site_name);
  if (!this.name) {
    writeln('- Initialize trollFilter');
    sql.execute("insert into metadata values($0, $1, 'Site', 'trollFilter', '[]', 'Array')", next_id, this.id);
    next_id += 1;
  }
  writeln('- Initialize imageDimensionLimits');
  sql.execute("insert into metadata values($0, $1, 'Site', 'imageDimensionLimits', '[400,400]', 'Array')", next_id, this.id);
  next_id += 1;
});
