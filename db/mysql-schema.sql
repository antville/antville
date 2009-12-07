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

CREATE DATABASE IF NOT EXISTS antville character set latin1 collate latin1_general_ci;

USE antville;

GRANT SELECT,INSERT,UPDATE,DELETE ON antville.* TO antville@localhost IDENTIFIED BY 'antville';

SET FOREIGN_KEY_CHECKS = 0;


CREATE TABLE `choice` (
  `id` int(10) unsigned NOT NULL default '0',
  `poll_id` int(10) unsigned default NULL,
  `title` varchar(255) default NULL,
  `created` datetime default NULL,
  `modified` datetime default NULL,
  PRIMARY KEY  (`id`),
  KEY `poll_id` (`poll_id`)
) ENGINE=InnoDB;


CREATE TABLE `content` (
  `id` int(10) unsigned NOT NULL default '0',
  `prototype` enum('Story','Comment') default 'Story',
  `name` varchar(255) default NULL,
  `site_id` int(10) unsigned default NULL,
  `story_id` int(10) unsigned default NULL,
  `parent_id` int(10) unsigned default NULL,
  `parent_type` enum('Story','Comment') default 'Story',
  `metadata` mediumtext,
  `status` enum('closed','pending','readonly','public','shared','open') default 'closed',
  `mode` enum('hidden','featured') default 'featured',
  `comment_mode` enum('closed','readonly','moderated','open') default 'open',
  `requests` int(10) unsigned default '0',
  `created` datetime default NULL,
  `creator_id` int(10) unsigned default NULL,
  `modified` datetime default NULL,
  `modifier_id` int(10) unsigned default NULL,
  PRIMARY KEY  (`id`),
  KEY `story_id` (`story_id`),
  KEY `parent_id` (`parent_id`),
  KEY `creator_id` (`creator_id`),
  KEY `type` (`site_id`,`prototype`,`status`,`created`,`modified`,`id`),
  KEY `all` (`site_id`,`modified`,`status`,`prototype`,`id`)
) ENGINE=InnoDB;


CREATE TABLE `file` (
  `id` int(10) unsigned NOT NULL default '0',
  `prototype` enum('File') default 'File',
  `name` varchar(255) default NULL,
  `site_id` int(10) unsigned default NULL,
  `parent_id` int(10) unsigned default NULL,
  `parent_type` enum('Site') default 'Site',
  `metadata` mediumtext,
  `requests` int(10) unsigned default '0',
  `created` datetime default NULL,
  `creator_id` int(10) unsigned default NULL,
  `modified` datetime default NULL,
  `modifier_id` int(10) unsigned default NULL,
  PRIMARY KEY  (`id`),
  KEY `site_id` (`site_id`),
  KEY `name` (`name`(20)),
  KEY `creator_id` (`creator_id`)
) ENGINE=InnoDB;


CREATE TABLE `image` (
  `id` int(10) unsigned NOT NULL default '0',
  `name` varchar(255) default NULL,
  `prototype` enum('Image') default 'Image',
  `parent_id` int(10) unsigned default NULL,
  `parent_type` enum('Site','Layout') default NULL,
  `metadata` mediumtext,
  `created` datetime default NULL,
  `creator_id` int(10) unsigned default NULL,
  `modified` datetime default NULL,
  `modifier_id` int(10) unsigned default NULL,
  PRIMARY KEY  (`id`),
  KEY `creator_id` (`creator_id`),
  KEY `type` (`name`,`prototype`)
) ENGINE=InnoDB;


CREATE TABLE `layout` (
  `id` int(10) unsigned NOT NULL default '0',
  `site_id` int(10) unsigned default NULL,
  `metadata` mediumtext,
  `mode` enum('default','shared') default NULL,
  `created` datetime default NULL,
  `creator_id` int(10) unsigned default NULL,
  `modified` datetime default NULL,
  `modifier_id` int(10) unsigned default NULL,
  PRIMARY KEY  (`id`),
  KEY `site_id` (`site_id`)
) ENGINE=InnoDB;


CREATE TABLE `log` (
  `id` int(10) unsigned NOT NULL auto_increment,
  `context_id` int(10) unsigned default NULL,
  `context_type` enum('Root','User','Site','Story') default NULL,
  `referrer` mediumtext,
  `action` varchar(255) default NULL,
  `created` datetime default NULL,
  `creator_id` int(10) unsigned default NULL,
  PRIMARY KEY  (`id`)
) ENGINE=InnoDB;


CREATE TABLE `membership` (
  `id` int(10) unsigned NOT NULL default '0',
  `name` varchar(255) default NULL,
  `site_id` int(10) unsigned default NULL,
  `role` enum('Subscriber','Contributor','Manager','Owner') default 'Subscriber',
  `created` datetime default NULL,
  `creator_id` int(10) unsigned default NULL,
  `modified` datetime default NULL,
  `modifier_id` int(10) unsigned default NULL,
  PRIMARY KEY  (`id`),
  KEY `site_id` (`site_id`),
  KEY `creator_id` (`creator_id`),
  KEY `name` (`name`(20))
) ENGINE=InnoDB;


CREATE TABLE `poll` (
  `id` int(10) unsigned NOT NULL default '0',
  `site_id` int(10) unsigned default NULL,
  `question` text,
  `status` enum('closed','readonly','open') default NULL,
  `closed` datetime default NULL,
  `created` datetime default NULL,
  `creator_id` int(10) unsigned default NULL,
  `modified` datetime default NULL,
  `modifier_id` int(10) unsigned default NULL,
  PRIMARY KEY  (`id`),
  KEY `site_id` (`site_id`),
  KEY `creator_id` (`creator_id`)
) ENGINE=InnoDB;


CREATE TABLE `site` (
  `id` int(10) unsigned NOT NULL default '0',
  `name` varchar(255) default NULL,
  `layout_id` int(10) unsigned default NULL,
  `metadata` mediumtext,
  `status` enum('blocked','regular','trusted') default 'regular',
  `mode` enum('closed','restricted','public','open') default 'closed',
  `created` datetime default NULL,
  `creator_id` int(10) unsigned default NULL,
  `modified` datetime default NULL,
  `modifier_id` int(10) unsigned default NULL,
  PRIMARY KEY  (`id`),
  KEY `name` (`name`(20)),
  KEY `creator_id` (`creator_id`)
) ENGINE=InnoDB;


CREATE TABLE `skin` (
  `id` int(10) unsigned NOT NULL default '0',
  `name` varchar(255) default NULL,
  `prototype` varchar(30) default NULL,
  `source` mediumtext default NULL,
  `layout_id` int(10) unsigned default NULL,
  `created` datetime default NULL,
  `creator_id` int(10) unsigned default NULL,
  `modified` datetime default NULL,
  `modifier_id` int(10) unsigned default NULL,
  PRIMARY KEY  (`id`),
  KEY `type` (`layout_id`,`prototype`(10),`name`(10))
) ENGINE=InnoDB;


CREATE TABLE `tag` (
  `id` int(10) unsigned NOT NULL default '0',
  `name` varchar(255) default NULL,
  `site_id` int(10) unsigned default NULL,
  `type` enum('Story','Image') default NULL,
  PRIMARY KEY  (`id`),
  KEY `tags` (`site_id`,`type`,`name`)
) ENGINE=InnoDB;


CREATE TABLE `tag_hub` (
  `id` int(10) unsigned NOT NULL default '0',
  `tag_id` int(10) unsigned default NULL,
  `tagged_id` int(10) unsigned default NULL,
  `tagged_type` enum('Story','Image') default NULL,
  `user_id` int(10) unsigned default NULL,
  PRIMARY KEY  (`id`),
  KEY `tagged` (`tag_id`,`tagged_type`,`tagged_id`)
) ENGINE=InnoDB;


CREATE TABLE `user` (
  `id` int(10) unsigned NOT NULL default '0',
  `name` varchar(255) default NULL,
  `metadata` mediumtext,
  `email` varchar(255) default NULL,
  `status` enum('blocked','regular','trusted','privileged') default 'regular',
  `visited` datetime default NULL,
  `created` datetime default NULL,
  `modified` datetime default NULL,
  PRIMARY KEY  (`id`),
  KEY `name` (`name`(20))
) ENGINE=InnoDB;


CREATE TABLE `vote` (
  `id` int(10) unsigned NOT NULL default '0',
  `poll_id` int(10) unsigned default NULL,
  `choice_id` int(10) unsigned default NULL,
  `creator_name` varchar(255) default NULL,
  `created` datetime default NULL,
  `creator_id` int(10) unsigned default NULL,
  `modified` datetime default NULL,
  PRIMARY KEY  (`id`),
  KEY `poll_id` (`poll_id`),
  KEY `creator_id` (`creator_id`),
  KEY `choice_id` (`choice_id`),
  KEY `creator_name` (`creator_name`(20))
) ENGINE=InnoDB;


SET FOREIGN_KEY_CHECKS = 1;

insert into `layout` ( `id`, `site_id`, `mode`) values ( '1', '1', 'default');

insert into `site` ( `id`, `name`, `layout_id`, `status`, `mode`) values ( '1', 'www', '1', 'trusted', 'public');
