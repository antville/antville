##
## The Antville Project
## http://code.google.com/p/antville
##
## Copyright 2001-2011 by The Antville People
##
## Licensed under the Apache License, Version 2.0 (the ``License'');
## you may not use this file except in compliance with the License.
## You may obtain a copy of the License at
##
##    http://www.apache.org/licenses/LICENSE-2.0
##
## Unless required by applicable law or agreed to in writing, software
## distributed under the License is distributed on an ``AS IS'' BASIS,
## WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
## See the License for the specific language governing permissions and
## limitations under the License.
##
## $Revision$
## $LastChangedBy$
## $LastChangedDate$
## $URL$
##

create database if not exists antville character set latin1 
      collate latin1_general_ci;

use antville;

grant select, insert, update, delete on antville.* to antville@localhost 
      identified by 'antville';

set foreign_key_checks = 0;

create table account (
  id int(10) unsigned not null default '0',
  name varchar(255) character set utf8 collate utf8_general_ci,
  metadata mediumtext,
  email varchar(255) character set utf8 collate utf8_general_ci,
  status varchar(20),
  created datetime,
  modified datetime,
  primary key (id),
  key name (name(20)),
  key email (email(20)),
  key status (status),
  key created (created),
  key modified (modified)
);

create table choice (
  id int(10) unsigned not null default '0',
  poll_id int(10) unsigned,
  title text character set utf8 collate utf8_general_ci,
  created datetime,
  modified datetime,
  primary key (id),
  key poll_id (poll_id)
);

create table content (
  id int(10) unsigned not null default '0',
  prototype varchar(20),
  name varchar(255) character set utf8 collate utf8_general_ci,
  site_id int(10) unsigned,
  story_id int(10) unsigned,
  parent_id int(10) unsigned,
  parent_type varchar(20),
  metadata mediumtext,
  status varchar(20),
  mode varchar(20),
  comment_mode varchar(20),
  requests int(10) unsigned,
  created datetime,
  creator_id int(10) unsigned,
  modified datetime,
  modifier_id int(10) unsigned,
  primary key  (id),
  key story_id (story_id),
  key parent_id (parent_id),
  key creator_id (creator_id),
  key type (site_id,prototype,status,created,modified,id),
  key modified (site_id,modified,status,prototype,id)
);

create table file (
  id int(10) unsigned not null default '0',
  prototype varchar(20),
  name varchar(255) character set utf8 collate utf8_general_ci,
  site_id int(10) unsigned,
  parent_id int(10) unsigned,
  parent_type varchar(20),
  metadata mediumtext,
  requests int(10) unsigned,
  created datetime,
  creator_id int(10) unsigned,
  modified datetime,
  modifier_id int(10) unsigned,
  primary key  (id),
  key site_id (site_id),
  key name (name(20)),
  key creator_id (creator_id)
);

create table image (
  id int(10) unsigned not null default '0',
  name varchar(255) character set utf8 collate utf8_general_ci,
  prototype varchar(20),
  parent_id int(10) unsigned,
  parent_type varchar(20),
  metadata mediumtext,
  created datetime,
  creator_id int(10) unsigned,
  modified datetime,
  modifier_id int(10) unsigned,
  primary key  (id),
  key creator_id (creator_id),
  key type (name,prototype)
);

create table layout (
  id int(10) unsigned not null default '0',
  site_id int(10) unsigned,
  metadata mediumtext,
  mode varchar(20),
  created datetime,
  creator_id int(10) unsigned,
  modified datetime,
  modifier_id int(10) unsigned,
  primary key  (id),
  key site_id (site_id)
);

create table log (
  id int(10) unsigned not null auto_increment,
  context_id int(10) unsigned,
  context_type varchar(20),
  referrer text,
  action varchar(255) character set utf8 collate utf8_general_ci,
  created datetime,
  creator_id int(10) unsigned,
  primary key  (id)
);

create table membership (
  id int(10) unsigned not null default '0',
  name varchar(255) character set utf8 collate utf8_general_ci,
  site_id int(10) unsigned,
  role varchar(20),
  created datetime,
  creator_id int(10) unsigned,
  modified datetime,
  modifier_id int(10) unsigned,
  primary key  (id),
  key site_id (site_id),
  key creator_id (creator_id),
  key name (name(20))
);

#!helma <% #metadata %>

create table metadata (
  id int(10) unsigned not null default '0',
  parent_id int(10) unsigned,
  parent_type varchar(20),
  name varchar(255) character set utf8 collate utf8_general_ci,
  value text character set utf8 collate utf8_general_ci,
  type varchar(255),
  primary key (id),
  key key_idx (parent_id, parent_type, name),
  key value (value)
);

#!helma <% #end_of_metadata %>

create table poll (
  id int(10) unsigned not null default '0',
  site_id int(10) unsigned,
  question text character set utf8 collate utf8_general_ci,
  status varchar(20),
  closed datetime,
  created datetime,
  creator_id int(10) unsigned,
  modified datetime,
  modifier_id int(10) unsigned,
  primary key  (id),
  key site_id (site_id),
  key creator_id (creator_id)
);

create table site (
  id int(10) unsigned not null default '0',
  name varchar(255) character set utf8 collate utf8_general_ci,
  layout_id int(10) unsigned,
  metadata mediumtext,
  status varchar(20),
  mode varchar(20),
  created datetime,
  creator_id int(10) unsigned,
  modified datetime,
  modifier_id int(10) unsigned,
  primary key  (id),
  key name (name(20)),
  key creator_id (creator_id)
);

create table skin (
  id int(10) unsigned not null default '0',
  name varchar(255) character set utf8 collate utf8_general_ci,
  prototype varchar(30),
  source mediumtext,
  layout_id int(10) unsigned,
  created datetime,
  creator_id int(10) unsigned,
  modified datetime,
  modifier_id int(10) unsigned,
  primary key  (id),
  key type (layout_id,prototype(10),name(10))
);

create table tag (
  id int(10) unsigned not null default '0',
  name varchar(255) character set utf8 collate utf8_general_ci,
  site_id int(10) unsigned,
  type varchar(20),
  primary key  (id),
  key tags (site_id,type,name)
);

create table tag_hub (
  id int(10) unsigned not null default '0',
  tag_id int(10) unsigned,
  tagged_id int(10) unsigned,
  tagged_type varchar(20),
  user_id int(10) unsigned,
  primary key  (id),
  key tagged (tag_id,tagged_type,tagged_id)
);

create table vote (
  id int(10) unsigned not null default '0',
  poll_id int(10) unsigned,
  choice_id int(10) unsigned,
  creator_name varchar(255) character set utf8 collate utf8_general_ci,
  created datetime,
  creator_id int(10) unsigned,
  modified datetime,
  primary key  (id),
  key poll_id (poll_id),
  key creator_id (creator_id),
  key choice_id (choice_id),
  key creator_name (creator_name(20))
);

set foreign_key_checks = 1;

insert into layout (id, site_id, mode) values ( '1', '1', 'default');

insert into site (id, name, layout_id, status, mode) 
      values ('1', 'www', '1', 'trusted', 'public');
