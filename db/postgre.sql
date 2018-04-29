--
-- The Antville Project
-- http://code.google.com/p/antville
--
-- Copyright 2001–2014 by the Workers of
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

create user antville password 'antville';

-- This returns an error in PostgreSql database
alter user antville admin true;

-- These return errors in H2 database
create database antville;
\connect antville;

create table account (
  -- "user" is a reserved keyword in PostgreSql
  id int4 primary key,
  name varchar(255),
  email varchar(255),
  status varchar(20),
  created timestamp,
  modified timestamp
);

create index account_name_idx on account (name);
create index account_email_idx on account (email);
create index account_status_idx on account (status);
create index account_created_idx on account (created);
create index account_modified_idx on account (modified);

create table choice (
  id int4 primary key,
  poll_id int4,
  title varchar(255),
  created timestamp,
  modified timestamp
);

create index poll_choice_idx on choice (poll_id);

create table content (
  id int4 primary key,
  prototype varchar(20),
  name varchar(255),
  site_id int4,
  story_id int4,
  parent_id int4,
  parent_type varchar(20),
  status varchar(20),
  mode varchar(20),
  comment_mode varchar(20),
  requests int4,
  created timestamp,
  creator_id int4,
  modified timestamp,
  modifier_id int4
);

create index content_prototype_idx on content (prototype);
create index content_site_idx on content (site_id);
create index content_story_idx on content (story_id);
create index content_parent_idx on content (parent_id, parent_type);
create index content_status_idx on content (status);
create index content_mode_idx on content (mode);
create index content_requests_idx on content (requests);
create index content_created_idx on content (created);
create index content_creator_idx on content (creator_id);

create table file (
  id int4 primary key,
  prototype varchar(20),
  name varchar(255),
  site_id int4,
  parent_id int4,
  parent_type varchar(20),
  requests int4,
  created timestamp,
  creator_id int4,
  modified timestamp,
  modifier_id int4
);

create index file_name_idx on file (name);
create index file_site_idx on file (site_id);
create index file_requests_idx on file (requests);
create index file_created_idx on file (created);
create index file_creator_idx on file (creator_id);

create table image (
  id int4 primary key,
  name varchar(255),
  prototype varchar(20),
  parent_id int4,
  parent_type varchar(20),
  created timestamp,
  creator_id int4,
  modified timestamp,
  modifier_id int4
);

create index image_name_idx on image (name);
create index image_prototype_idx on image (prototype);
create index image_parent_idx on image (parent_id, parent_type);
create index image_created_idx on image (created);
create index image_creator_idx on image (creator_id);

create table layout (
  id int4 primary key,
  site_id int4,
  mode varchar(20),
  created timestamp,
  creator_id int4,
  modified timestamp,
  modifier_id int4
);

create index layout_site_idx on layout (site_id);

create sequence log_id_seq;

create table log (
  id int4 not null default nextval('log_id_seq'),
  context_id int4,
  context_type varchar(20),
  referrer text,
  action varchar(255),
  created timestamp,
  creator_id int4
);

-- This returns an error in H2 database
alter sequence log_id_seq owned by log.id;

create index log_context_idx on log (context_id, context_type);
create index log_created_idx on log (created);

create table membership (
  id int4 primary key,
  name varchar(255),
  site_id int4,
  role varchar(20),
  created timestamp,
  creator_id int4,
  modified timestamp,
  modifier_id int4
);

create index membership_name_idx on membership (name);
create index membership_site_idx on membership (site_id);
create index membership_role_idx on membership (role);
create index membership_creator_idx on membership (creator_id);

--!helma <% #metadata %>

create table metadata (
  id int4 primary key,
  parent_id int4,
  parent_type varchar,
  name varchar(255),
  value text,
  type varchar(255)
);

create index metadata_parent_idx on metadata (parent_type, parent_id);
create index metadata_name_idx on metadata (name);
create index metadata_value_idx on metadata using hash (value);

--!helma <% #end_of_metadata %>

create table poll (
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

create index poll_site_idx on poll (site_id);
create index poll_status_idx on poll (status);
create index poll_created_idx on poll (created);
create index poll_creator_idx on poll (creator_id);

create table site (
  id int4 primary key,
  name varchar(255),
  layout_id int4,
  status varchar(20),
  mode varchar(20),
  created timestamp,
  creator_id int4,
  modified timestamp,
  modifier_id int4
);

create index site_name_idx on site (name);
create index site_status_idx on site (status);
create index site_created_idx on site (created);
create index site_creator_idx on site (creator_id);

create table skin (
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

create index skin_layout_index on skin (layout_id);
create index skin_created_index on site (created);

create table tag (
  id int4 primary key,
  name varchar(255),
  site_id int4,
  type varchar(20)
);

create index tag_name_idx on tag (name);
create index tag_site_idx on tag (site_id);
create index tag_type_idx on tag (type);

create table tag_hub (
  id int4 primary key,
  tag_id int4,
  tagged_id int4,
  tagged_type varchar(20)
);

create index tagged_idx on tag_hub (tag_id, tagged_id, tagged_type);

create table vote (
  id int4 primary key,
  poll_id int4,
  choice_id int4,
  creator_name varchar(255),
  created timestamp,
  creator_id int4,
  modified timestamp
);

create index vote_poll_idx on vote (poll_id, choice_id);

insert into layout (id, site_id, mode) values ('1', '1', 'default');

insert into site (id, name, layout_id, status, mode)
	values ('1', 'www', '1', 'trusted', 'public');

-- These return errors in H2 database
grant select, insert, update, delete on all tables in schema public to antville;
grant usage on log_id_seq to antville;
