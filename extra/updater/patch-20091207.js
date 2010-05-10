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

// Apply with enabled updater repository via ant patch -Dpatch.id=20091207

var sql = new Sql;
var template;

// Add deleted mode to site table
sql.execute("alter table antville.site change column mode mode \
      enum('deleted','closed','restricted','public','open') \
      character set latin1 collate latin1_general_ci default 'closed'");

// Rename user table to conform to standard SQL / Postgre specification
sql.execute("alter table antville.user rename to account");

// Enable UTF-8 encoding in name columns
template = "alter table $0 modify name varchar(255) character set utf8 collate utf8_general_ci";
sql.execute(template, "account");
sql.execute(template, "content");
sql.execute(template, "image");
sql.execute(template, "file");
sql.execute(template, "membership");
sql.execute(template, "site");
sql.execute(template, "skin");
sql.execute(template, "tag");

// Enable UTF-8 encoding in other columns
template = "alter table $0 modify $1 $2 character set utf8 collate utf8_general_ci";
sql.execute(template, "account", "email", "varchar(255)");
sql.execute(template, "choice", "title", "text");
sql.execute(template, "log", "action", "varchar(255)");
sql.execute(template, "poll", "question", "text");
sql.execute(template, "vote", "creator_name", "varchar(255)");
