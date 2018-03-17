# The Antville Project
# http://code.google.com/p/antville
#
# Copyright 2001–2014 by the Workers of Antville.
#
# Licensed under the Apache License, Version 2.0 (the ``License'');
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an ``AS IS'' BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

create database if not exists antville character set utf8mb4
      collate utf8mb4_unicode_ci;

use antville;

grant select, insert, update, delete on antville.* to antville@localhost
      identified by 'antville';

set foreign_key_checks = 0;

create table account (
  id int(10) unsigned not null default '0',
  name varchar(500),
  email varchar(500),
  status varchar(50),
  created datetime,
  modified datetime,
  primary key (id),
  key name (name(191)),
  key email (email(191)),
  key status (status),
  key created (created),
  key modified (modified)
);

create table choice (
  id int(10) unsigned not null default '0',
  poll_id int(10) unsigned,
  title text,
  created datetime,
  modified datetime,
  primary key (id),
  key poll_id (poll_id)
);

create table content (
  id int(10) unsigned not null default '0',
  prototype varchar(50),
  name varchar(500),
  site_id int(10) unsigned,
  story_id int(10) unsigned,
  parent_id int(10) unsigned,
  parent_type varchar(50),
  status varchar(50),
  mode varchar(50),
  comment_mode varchar(50),
  requests int(10) unsigned,
  created datetime,
  creator_id int(10) unsigned,
  modified datetime,
  modifier_id int(10) unsigned,
  primary key (id),
  key story_id (story_id),
  key parent_id (parent_id),
  key creator_id (creator_id),
  key type (site_id, prototype, status, created, modified, id),
  key modified (site_id, modified, status, prototype,id)
);

create table file (
  id int(10) unsigned not null default '0',
  prototype varchar(50),
  name varchar(500),
  site_id int(10) unsigned,
  parent_id int(10) unsigned,
  parent_type varchar(50),
  requests int(10) unsigned,
  created datetime,
  creator_id int(10) unsigned,
  modified datetime,
  modifier_id int(10) unsigned,
  primary key (id),
  key site_id (site_id),
  key name (name(191)),
  key creator_id (creator_id)
);

create table image (
  id int(10) unsigned not null default '0',
  name varchar(500),
  prototype varchar(50),
  parent_id int(10) unsigned,
  parent_type varchar(50),
  created datetime,
  creator_id int(10) unsigned,
  modified datetime,
  modifier_id int(10) unsigned,
  primary key (id),
  key creator_id (creator_id),
  key type (name(191), prototype)
);

create table layout (
  id int(10) unsigned not null default '0',
  site_id int(10) unsigned,
  mode varchar(50),
  created datetime,
  creator_id int(10) unsigned,
  modified datetime,
  modifier_id int(10) unsigned,
  primary key (id),
  key site_id (site_id)
);

create table log (
  id int(10) unsigned not null auto_increment,
  context_id int(10) unsigned,
  context_type varchar(50),
  referrer text,
  action varchar(500),
  created datetime,
  creator_id int(10) unsigned,
  primary key (id)
);

create table membership (
  id int(10) unsigned not null default '0',
  name varchar(500),
  site_id int(10) unsigned,
  role varchar(50),
  created datetime,
  creator_id int(10) unsigned,
  modified datetime,
  modifier_id int(10) unsigned,
  primary key (id),
  key site_id (site_id),
  key creator_id (creator_id),
  key name (name(191))
);

#!helma <% #metadata %>

create table metadata (
  id int(10) unsigned not null default '0',
  parent_id int(10) unsigned,
  parent_type varchar(50),
  name varchar(500),
  value mediumtext,
  type varchar(500),
  primary key (id),
  key parent (parent_type, parent_id),
  key name (name(191)),
  key value (value(191))
);

#!helma <% #end_of_metadata %>

create table poll (
  id int(10) unsigned not null default '0',
  site_id int(10) unsigned,
  question text,
  status varchar(50),
  closed datetime,
  created datetime,
  creator_id int(10) unsigned,
  modified datetime,
  modifier_id int(10) unsigned,
  primary key (id),
  key site_id (site_id),
  key creator_id (creator_id)
);

create table site (
  id int(10) unsigned not null default '0',
  name varchar(500),
  layout_id int(10) unsigned,
  status varchar(50),
  mode varchar(50),
  created datetime,
  creator_id int(10) unsigned,
  modified datetime,
  modifier_id int(10) unsigned,
  primary key (id),
  key name (name(191)),
  key creator_id (creator_id)
);

create table skin (
  id int(10) unsigned not null default '0',
  name varchar(500),
  prototype varchar(50),
  source mediumtext,
  layout_id int(10) unsigned,
  created datetime,
  creator_id int(10) unsigned,
  modified datetime,
  modifier_id int(10) unsigned,
  primary key (id),
  key type (layout_id, prototype, name(191))
);

create table tag (
  id int(10) unsigned not null default '0',
  name varchar(500),
  site_id int(10) unsigned,
  type varchar(50),
  primary key (id),
  key tags (site_id, type, name(191))
);

create table tag_hub (
  id int(10) unsigned not null default '0',
  tag_id int(10) unsigned,
  tagged_id int(10) unsigned,
  tagged_type varchar(50),
  primary key (id),
  key tagged (tag_id, tagged_type, tagged_id)
);

create table vote (
  id int(10) unsigned not null default '0',
  poll_id int(10) unsigned,
  choice_id int(10) unsigned,
  creator_name varchar(500),
  created datetime,
  creator_id int(10) unsigned,
  modified datetime,
  primary key (id),
  key poll_id (poll_id),
  key creator_id (creator_id),
  key choice_id (choice_id),
  key creator_name (creator_name(191))
);

set foreign_key_checks = 1;

insert into layout (id, site_id, mode) values ( '1', '1', 'default');

insert into site (id, name, layout_id, status, mode)
      values ('1', 'www', '1', 'trusted', 'public');
