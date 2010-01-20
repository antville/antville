--
-- The Antville Project
-- http://code.google.com/p/antville
--
-- Copyright 2001-2007 by The Antville People
--
-- Licensed under the Apache License, Version 2.0 (the License'');
-- you may not use this file except in compliance with the License.
-- You may obtain a copy of the License at
--
--    http://www.apache.org/licenses/LICENSE-2.0
--
-- Unless required by applicable law or agreed to in writing, software
-- distributed under the License is distributed on an AS IS'' BASIS,
-- WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
-- See the License for the specific language governing permissions and
-- limitations under the License.
--
-- $Revision$
-- $LastChangedBy$
-- $LastChangedDate$
-- $URL$
--

create user antville password 'antville';

-- This returns an error in PostgreSql database
alter user antville admin true;

-- These return errors in H2 database
create database antville owner antville; 
\connect antville;

create schema antville authorization antville;

create table antville.choice (
  id int4 primary key,
  poll_id int4,
  title varchar(255),
  created timestamp,
  modified timestamp
);

create table antville.content (
  id int4 primary key,
  prototype varchar(20),
  name varchar(255),
  site_id int4,
  story_id int4,
  parent_id int4,
  parent_type varchar(20),
  metadata text,
  status varchar(20),
  mode varchar(20),
  comment_mode varchar(20),
  requests int4,
  created timestamp,
  creator_id int4,
  modified timestamp,
  modifier_id int4
);

create table antville.file (
  id int4 primary key,
  prototype varchar(20),
  name varchar(255),
  site_id int4,
  parent_id int4,
  parent_type varchar(20),
  metadata text,
  requests int4,
  created timestamp,
  creator_id int4,
  modified timestamp,
  modifier_id int4
);

create table antville.image (
  id int4 primary key,
  name varchar(255),
  prototype varchar(20),
  parent_id int4,
  parent_type varchar(20),
  metadata text,
  created timestamp,
  creator_id int4,
  modified timestamp,
  modifier_id int4
);

create table antville.layout (
  id int4 primary key,
  site_id int4,
  metadata text,
  mode varchar(20),
  created timestamp,
  creator_id int4,
  modified timestamp,
  modifier_id int4
);

create sequence antville.log_id_seq;

create table antville.log (
  id int4 not null default nextval('antville.log_id_seq'),
  context_id int4,
  context_type varchar(20),
  referrer text,
  action varchar(255),
  created timestamp,
  creator_id int4
);

-- This returns an error in H2 database
alter sequence antville.log_id_seq owned by antville.log.id;

create table antville.membership (
  id int4 primary key,
  name varchar(255),
  site_id int4,
  role varchar(20),
  created timestamp,
  creator_id int4,
  modified timestamp,
  modifier_id int4
);

create table antville.poll (
  id int4 primary key,
  site_id int4,
  question text,
  status varchar(20),
  closed timestamp,
  created timestamp,
  creator_id int4,
  modified timestamp,
  modifier_id int4
);

create table antville.site (
  id int4 primary key,
  name varchar(255),
  layout_id int4,
  metadata text,
  status varchar(20),
  mode varchar(20),
  created timestamp,
  creator_id int4,
  modified timestamp,
  modifier_id int4
);

create table antville.skin (
  id int4 primary key,
  name varchar(255),
  prototype varchar(30),
  source text,
  layout_id int4,
  created timestamp,
  creator_id int4,
  modified timestamp,
  modifier_id int4
);

create table antville.tag (
  id int4 primary key,
  name varchar(255),
  site_id int4,
  type varchar(20)
);

create table antville.tag_hub (
  id int4 primary key,
  tag_id int4,
  tagged_id int4,
  tagged_type varchar(20),
  user_id int4
);

-- "user" is a reserved keyword in PostgreSql
create table antville.account (
  id int4 primary key,
  name varchar(255),
  metadata text,
  email varchar(255),
  status varchar(20),
  visited timestamp,
  created timestamp,
  modified timestamp
);

create table antville.vote (
  id int4 primary key,
  poll_id int4,
  choice_id int4,
  creator_name varchar(255),
  created timestamp,
  creator_id int4,
  modified timestamp
);

insert into antville.layout (id, site_id, mode) values ('1', '1', 'default');

insert into antville.site (id, name, layout_id, status, mode) 
	values ('1', 'www', '1', 'trusted', 'public');

grant select,insert,update,delete on antville.choice, antville.content, 
	antville.file, antville.image, antville.layout, antville.log, 
	antville.membership, antville.poll, antville.site, antville.skin, 
	antville.tag, antville.tag_hub, antville.account, antville.vote to antville;

-- This returns an error in H2 database
grant usage on antville.log_id_seq to antville;
