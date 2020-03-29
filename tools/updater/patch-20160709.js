// The Antville Project
// http://code.google.com/p/antville
//
// Copyright 2001–2016 by the Workers of Antville.
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

// Apply with enabled updater repository using `ant patch -Dpatch.id=20160709`
var sql = new Sql();
var template;

sql.execute('alter database antville character set utf8mb4 collate utf8mb4_unicode_ci;');

template = 'alter table $0 convert to character set utf8mb4 collate utf8mb4_unicode_ci';

sql.execute(template, 'account');
sql.execute(template, 'choice');
sql.execute(template, 'content');
sql.execute(template, 'file');
sql.execute(template, 'image');
sql.execute(template, 'layout');
sql.execute(template, 'log');
sql.execute(template, 'membership');
sql.execute(template, 'metadata');
sql.execute(template, 'poll');
sql.execute(template, 'site');
sql.execute(template, 'skin');
sql.execute(template, 'tag');
sql.execute(template, 'tag_hub');
sql.execute(template, 'vote');

template = 'alter table $0 change $1 $1 $2 character set utf8mb4 collate utf8mb4_unicode_ci;'

sql.execute(template, 'account', 'name', 'varchar(500)');
sql.execute(template, 'account', 'email', 'varchar(500)');
sql.execute(template, 'account', 'status', 'varchar(50)');
sql.execute("alter table account drop key name;");
sql.execute("alter table account add key name (name(191));");
sql.execute("alter table account drop key email;");
sql.execute("alter table account add key email (email(191));");

sql.execute(template, 'choice', 'title', 'text');

sql.execute(template, 'content', 'prototype', 'varchar(50)');
sql.execute(template, 'content', 'name', 'name', 'varchar(500)');
sql.execute(template, 'content', 'parent_type', 'varchar(50)');
sql.execute(template, 'content', 'status', 'varchar(50)');
sql.execute(template, 'content', 'mode', 'varchar(50)');
sql.execute(template, 'content', 'comment_mode', 'varchar(50)');

sql.execute(template, 'file', 'prototype', 'varchar(50)');
sql.execute(template, 'file', 'name', 'varchar(500)');
sql.execute(template, 'file', 'parent_type', 'varchar(50)');
sql.execute("alter table file drop key name;");
sql.execute("alter table file add key name (name(191));");

sql.execute(template, 'image', 'name', 'varchar(500)');
sql.execute(template, 'image', 'prototype', 'varchar(50)');
sql.execute(template, 'image', 'parent_type', 'varchar(50)');
sql.execute("alter table image drop key type;");
sql.execute("alter table image add key type (name(191), prototype);");

sql.execute(template, 'layout', 'mode', 'varchar(50)');

sql.execute(template, 'log', 'context_type', 'varchar(50)');
sql.execute(template, 'log', 'action', 'varchar(500)');

sql.execute(template, 'membership', 'name', 'varchar(500)');
sql.execute(template, 'membership', 'role', 'varchar(50)');
sql.execute("alter table membership drop key name;");
sql.execute("alter table membership add key name (name(191));");

sql.execute(template, 'metadata', 'parent_type', 'varchar(50)');
sql.execute(template, 'metadata', 'name', 'varchar(500)');
sql.execute(template, 'metadata', 'value', 'mediumtext');
sql.execute("alter table metadata drop key name;");
sql.execute("alter table metadata add key name (name(191));");
sql.execute("alter table metadata drop key value;");
sql.execute("alter table metadata add key value (value(191));");

sql.execute(template, 'poll', 'question', 'text');
sql.execute(template, 'poll', 'status', 'varchar(50)');

sql.execute(template, 'site', 'name', 'varchar(500)');
sql.execute(template, 'site', 'status', 'varchar(50)');
sql.execute(template, 'site', 'mode', 'varchar(50)');
sql.execute("alter table site drop key name;");
sql.execute("alter table site add key name (name(191));");

sql.execute(template, 'skin', 'name', 'varchar(500)');
sql.execute(template, 'skin', 'prototype', 'varchar(50)');
sql.execute("alter table skin drop key type;");
sql.execute("alter table skin add key type (layout_id, prototype, name(191));");

sql.execute(template, 'tag', 'name', 'varchar(500)');
sql.execute(template, 'tag', 'type', 'varchar(50)');

sql.execute(template, 'tag_hub', 'tagged_type', 'varchar(50)');

sql.execute(template, 'vote', 'creator_name', 'varchar(500)');
sql.execute("alter table vote drop key creator_name;");
sql.execute("alter table vote add key creator_name (creator_name(191));");
