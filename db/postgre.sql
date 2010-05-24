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

create table antville.account (
  -- "user" is a reserved keyword in PostgreSql
  id int4 primary key,
  name varchar(255),
  metadata text,
  email varchar(255),
  status varchar(20),
  created timestamp,
  modified timestamp
);

create index account_name_idx on antville.account (name);
create index account_email_idx on antville.account (email);
create index account_status_idx on antville.account (status);
create index account_created_idx on antville.account (created);
create index account_modified_idx on antville.account (modified);

create table antville.choice (
  id int4 primary key,
  poll_id int4,
  title varchar(255),
  created timestamp,
  modified timestamp
);

create index poll_choice_idx on antville.choice (poll_id);

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

create index content_prototype_idx on antville.content (prototype);
create index content_site_idx on antville.content (site_id);
create index content_story_idx on antville.content (story_id);
create index content_parent_idx on antville.content (parent_id, parent_type);
create index content_status_idx on antville.content (status);
create index content_mode_idx on antville.content (mode);
create index content_requests_idx on antville.content (requests);
create index content_created_idx on antville.content (created);
create index content_creator_idx on antville.content (creator_id);

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

create index file_name_idx on antville.file (name);
create index file_site_idx on antville.file (site_id);
create index file_requests_idx on antville.file (requests);
create index file_created_idx on antville.file (created);
create index file_creator_idx on antville.file (creator_id);

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

create index image_name_idx on antville.image (name);
create index image_prototype_idx on antville.image (prototype);
create index image_parent_idx on antville.image (parent_id, parent_type);
create index image_created_idx on antville.image (created);
create index image_creator_idx on antville.image (creator_id);

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

create index layout_site_idx on antville.layout (site_id);

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

create index log_context_idx on antville.log (context_id, context_type);
create index log_created_idx on antville.log (created);

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

create index membership_name_idx on antville.membership (name);
create index membership_site_idx on antville.membership (site_id);
create index membership_role_idx on antville.membership (role);
create index membership_creator_idx on antville.membership (creator_id);

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

create index poll_site_idx on antville.poll (site_id);
create index poll_status_idx on antville.poll (status);
create index poll_created_idx on antville.poll (created);
create index poll_creator_idx on antville.poll (creator_id);

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

create index site_name_idx on antville.site (name);
create index site_status_idx on antville.site (status);
create index site_created_idx on antville.site (created);
create index site_creator_idx on antville.site (creator_id);

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

create index skin_layout_index on antville.skin (layout_id);
create index skin_created_index on antville.site (created);

create table antville.tag (
  id int4 primary key,
  name varchar(255),
  site_id int4,
  type varchar(20)
);

create index tag_name_idx on antville.tag (name);
create index tag_site_idx on antville.tag (site_id);
create index tag_type_idx on antville.tag (type);

create table antville.tag_hub (
  id int4 primary key,
  tag_id int4,
  tagged_id int4,
  tagged_type varchar(20),
  user_id int4
);

create index tagged_idx on antville.tag_hub (tag_id, tagged_id, tagged_type);

create table antville.vote (
  id int4 primary key,
  poll_id int4,
  choice_id int4,
  creator_name varchar(255),
  created timestamp,
  creator_id int4,
  modified timestamp
);

create index vote_poll_idx on antville.vote (poll_id, choice_id);

insert into antville.layout (id, site_id, mode) values ('1', '1', 'default');

insert into antville.site (id, name, layout_id, status, mode) 
	values ('1', 'www', '1', 'trusted', 'public');

grant select, insert, update, delete on antville.choice, antville.content, 
	antville.file, antville.image, antville.layout, antville.log, 
	antville.membership, antville.poll, antville.site, antville.skin, 
	antville.tag, antville.tag_hub, antville.account, antville.vote to antville;

-- This returns an error in H2 database
grant usage on antville.log_id_seq to antville;
