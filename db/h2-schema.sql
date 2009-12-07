##
## The Antville Project
## http://code.google.com/p/antville
##
## Copyright 2001-2007 by The Antville People
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

CREATE TABLE `choice` (
  `id` int(10) unsigned NOT NULL default '0',
  `poll_id` int(10) unsigned default NULL,
  `title` varchar(255) default NULL,
  `created` datetime default NULL,
  `modified` datetime default NULL,
  PRIMARY KEY  (`id`)
);

CREATE TABLE `content` (
  `id` int(10) unsigned NOT NULL default '0',
  `prototype` varchar(20) default 'Story',
  `name` varchar(255) default NULL,
  `site_id` int(10) unsigned default NULL,
  `story_id` int(10) unsigned default NULL,
  `parent_id` int(10) unsigned default NULL,
  `parent_type` varchar(20) default 'Story',
  `metadata` mediumtext,
  `status` varchar(20) default 'closed',
  `mode` varchar(20) default 'featured',
  `comment_mode` varchar(20) default 'open',
  `requests` int(10) unsigned default '0',
  `created` datetime default NULL,
  `creator_id` int(10) unsigned default NULL,
  `modified` datetime default NULL,
  `modifier_id` int(10) unsigned default NULL,
  PRIMARY KEY  (`id`)
);

CREATE TABLE `file` (
  `id` int(10) unsigned NOT NULL default '0',
  `prototype` varchar(20) default 'File',
  `name` varchar(255) default NULL,
  `site_id` int(10) unsigned default NULL,
  `parent_id` int(10) unsigned default NULL,
  `parent_type` varchar(20) default 'Site',
  `metadata` mediumtext,
  `requests` int(10) unsigned default '0',
  `created` datetime default NULL,
  `creator_id` int(10) unsigned default NULL,
  `modified` datetime default NULL,
  `modifier_id` int(10) unsigned default NULL,
  PRIMARY KEY  (`id`)
);

CREATE TABLE `image` (
  `id` int(10) unsigned NOT NULL default '0',
  `name` varchar(255) default NULL,
  `prototype` varchar(20) default 'Image',
  `parent_id` int(10) unsigned default NULL,
  `parent_type` varchar(20) default NULL,
  `metadata` mediumtext,
  `created` datetime default NULL,
  `creator_id` int(10) unsigned default NULL,
  `modified` datetime default NULL,
  `modifier_id` int(10) unsigned default NULL,
  PRIMARY KEY  (`id`)
);

CREATE TABLE `layout` (
  `id` int(10) unsigned NOT NULL default '0',
  `site_id` int(10) unsigned default NULL,
  `metadata` mediumtext,
  `mode` varchar(20) default NULL,
  `created` datetime default NULL,
  `creator_id` int(10) unsigned default NULL,
  `modified` datetime default NULL,
  `modifier_id` int(10) unsigned default NULL,
  PRIMARY KEY  (`id`)
);

CREATE TABLE `log` (
  `id` int(10) unsigned NOT NULL auto_increment,
  `context_id` int(10) unsigned default NULL,
  `context_type` varchar(20) default NULL,
  `referrer` mediumtext,
  `action` varchar(255) default NULL,
  `created` datetime default NULL,
  `creator_id` int(10) unsigned default NULL,
  PRIMARY KEY  (`id`)
);

CREATE TABLE `membership` (
  `id` int(10) unsigned NOT NULL default '0',
  `name` varchar(255) default NULL,
  `site_id` int(10) unsigned default NULL,
  `role` varchar(20) default 'Subscriber',
  `created` datetime default NULL,
  `creator_id` int(10) unsigned default NULL,
  `modified` datetime default NULL,
  `modifier_id` int(10) unsigned default NULL,
  PRIMARY KEY  (`id`)
);

CREATE TABLE `poll` (
  `id` int(10) unsigned NOT NULL default '0',
  `site_id` int(10) unsigned default NULL,
  `question` text,
  `status` varchar(20) default NULL,
  `closed` datetime default NULL,
  `created` datetime default NULL,
  `creator_id` int(10) unsigned default NULL,
  `modified` datetime default NULL,
  `modifier_id` int(10) unsigned default NULL,
  PRIMARY KEY  (`id`)
);

CREATE TABLE `site` (
  `id` int(10) unsigned NOT NULL default '0',
  `name` varchar(255) default NULL,
  `layout_id` int(10) unsigned default NULL,
  `metadata` mediumtext,
  `status` varchar(20) default 'regular',
  `mode` varchar(20) default 'closed',
  `created` datetime default NULL,
  `creator_id` int(10) unsigned default NULL,
  `modified` datetime default NULL,
  `modifier_id` int(10) unsigned default NULL,
  PRIMARY KEY  (`id`)
);

CREATE TABLE `skin` (
  `id` int(10) unsigned NOT NULL default '0',
  `name` varchar(255) default NULL,
  `prototype` varchar(30) default NULL,
  `layout_id` int(10) unsigned default NULL,
  `created` datetime default NULL,
  `creator_id` int(10) unsigned default NULL,
  `modified` datetime default NULL,
  `modifier_id` int(10) unsigned default NULL,
  PRIMARY KEY  (`id`)
);

CREATE TABLE `tag` (
  `id` int(10) unsigned NOT NULL default '0',
  `name` varchar(255) default NULL,
  `site_id` int(10) unsigned default NULL,
  `type` varchar(20) default NULL,
  PRIMARY KEY  (`id`)
);

CREATE TABLE `tag_hub` (
  `id` int(10) unsigned NOT NULL default '0',
  `tag_id` int(10) unsigned default NULL,
  `tagged_id` int(10) unsigned default NULL,
  `tagged_type` varchar(20) default NULL,
  `user_id` int(10) unsigned default NULL,
  PRIMARY KEY  (`id`)
);

CREATE TABLE `user` (
  `id` int(10) unsigned NOT NULL default '0',
  `name` varchar(255) default NULL,
  `metadata` mediumtext,
  `email` varchar(255) default NULL,
  `status` varchar(20) default 'regular',
  `visited` datetime default NULL,
  `created` datetime default NULL,
  `modified` datetime default NULL,
  PRIMARY KEY  (`id`)
);

CREATE TABLE `vote` (
  `id` int(10) unsigned NOT NULL default '0',
  `poll_id` int(10) unsigned default NULL,
  `choice_id` int(10) unsigned default NULL,
  `creator_name` varchar(255) default NULL,
  `created` datetime default NULL,
  `creator_id` int(10) unsigned default NULL,
  `modified` datetime default NULL,
  PRIMARY KEY  (`id`)
);

insert into `layout` ( `id`, `site_id`, `mode`) values ( '1', '1', 'default');
insert into `site` ( `id`, `name`, `layout_id`, `status`, `mode`) values ( '1', 'www', '1', 'trusted', 'public');
