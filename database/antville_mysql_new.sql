-- MySQL dump 10.11
--
-- ------------------------------------------------------
-- Server version	5.0.45-log

--
-- Table structure for table `choice`
--

CREATE TABLE `choice` (
  `id` mediumint(10) NOT NULL default '0',
  `poll_id` mediumint(10) default NULL,
  `title` varchar(255) default NULL,
  `created` datetime default NULL,
  `modified` datetime default NULL,
  PRIMARY KEY  (`id`),
  KEY `IDX_CHOICE_F_POLL` (`poll_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Table structure for table `content`
--

CREATE TABLE `content` (
  `id` mediumint(10) NOT NULL default '0',
  `prototype` enum('Story','Comment') default NULL,
  `name` varchar(255) default NULL,
  `site_id` mediumint(10) default NULL,
  `story_id` mediumint(10) default NULL,
  `parent_id` mediumint(10) default NULL,
  `parent_type` varchar(30) default NULL,
  `metadata` mediumtext,
  `status` enum('closed','pending','readonly','public','shared','open') default NULL,
  `mode` enum('hidden','featured') default NULL,
  `comment_mode` enum('disabled','readonly','moderated','enabled') default NULL,
  `requests` mediumint(10) default NULL,
  `created` datetime default NULL,
  `creator_id` mediumint(10) default NULL,
  `modified` datetime default NULL,
  `modifier_id` mediumint(10) default NULL,
  PRIMARY KEY  (`id`),
  KEY `story_id` (`story_id`),
  KEY `parent_id` (`parent_id`),
  KEY `creator_id` (`creator_id`),
  KEY `type` (`site_id`,`prototype`,`status`,`created`,`modified`,`id`),
  KEY `all` (`site_id`,`modified`,`status`,`prototype`,`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Table structure for table `file`
--

CREATE TABLE `file` (
  `id` mediumint(10) NOT NULL default '0',
  `prototype` varchar(30) default NULL,
  `name` varchar(255) default NULL,
  `site_id` mediumint(10) default NULL,
  `parent_id` mediumint(10) default NULL,
  `parent_type` varchar(30) default NULL,
  `metadata` mediumtext,
  `requests` mediumint(10) default NULL,
  `created` datetime default NULL,
  `creator_id` mediumint(10) default NULL,
  `modified` datetime default NULL,
  `modifier_id` mediumint(10) default NULL,
  PRIMARY KEY  (`id`),
  KEY `site_id` (`site_id`),
  KEY `name` (`name`(20)),
  KEY `creator_id` (`creator_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Table structure for table `image`
--

CREATE TABLE `image` (
  `id` mediumint(10) NOT NULL default '0',
  `name` varchar(30) default NULL,
  `prototype` varchar(30) default NULL,
  `site_id` mediumint(10) default NULL,
  `parent_id` mediumint(10) default NULL,
  `parent_type` varchar(30) default NULL,
  `metadata` mediumtext,
  `created` datetime default NULL,
  `creator_id` mediumint(10) default NULL,
  `modified` datetime default NULL,
  `modifier_id` mediumint(10) default NULL,
  PRIMARY KEY  (`id`),
  KEY `creator_id` (`creator_id`),
  KEY `type` (`site_id`,`name`,`prototype`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Table structure for table `layout`
--

CREATE TABLE `layout` (
  `id` mediumint(10) NOT NULL default '0',
  `name` varchar(30) default NULL,
  `site_id` mediumint(10) default NULL,
  `layout_id` mediumint(10) default NULL,
  `metadata` mediumtext,
  `mode` enum('default','shared') default NULL,
  `created` datetime default NULL,
  `creator_id` mediumint(10) default NULL,
  `modified` datetime default NULL,
  `modifier_id` mediumint(10) default NULL,
  PRIMARY KEY  (`id`),
  KEY `name` (`name`),
  KEY `site_id` (`site_id`),
  KEY `layout_id` (`layout_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Table structure for table `log`
--

CREATE TABLE `log` (
  `id` int(11) NOT NULL auto_increment,
  `context_id` mediumint(10) default NULL,
  `context_type` varchar(20) default NULL,
  `referrer` mediumtext,
  `action` varchar(255) default NULL,
  `ip` varchar(20) default NULL,
  `created` datetime default NULL,
  `creator_id` mediumint(10) default NULL,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Table structure for table `membership`
--

CREATE TABLE `membership` (
  `id` mediumint(10) NOT NULL default '0',
  `name` tinytext,
  `site_id` mediumint(10) default NULL,
  `role` enum('Subscriber','Contributor','Manager','Owner') NOT NULL default 'Subscriber',
  `created` datetime default NULL,
  `creator_id` mediumint(10) default NULL,
  `modified` datetime default NULL,
  `modifier_id` mediumint(10) default NULL,
  PRIMARY KEY  (`id`),
  KEY `site_id` (`site_id`),
  KEY `creator_id` (`creator_id`),
  KEY `name` (`name`(20))
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Table structure for table `poll`
--

CREATE TABLE `poll` (
  `id` mediumint(10) NOT NULL default '0',
  `site_id` mediumint(10) default NULL,
  `question` mediumtext,
  `status` enum('closed','readonly','open') default NULL,
  `closed` datetime default NULL,
  `created` datetime default NULL,
  `creator_id` mediumint(10) default NULL,
  `modified` datetime default NULL,
  `modifier_id` mediumint(10) default NULL,
  PRIMARY KEY  (`id`),
  KEY `site_id` (`site_id`),
  KEY `creator_id` (`creator_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Table structure for table `site`
--

CREATE TABLE `site` (
  `id` mediumint(10) NOT NULL default '0',
  `name` varchar(30) NOT NULL,
  `layout_id` mediumint(10) default NULL,
  `metadata` mediumtext,
  `status` enum('blocked','regular','trusted') NOT NULL,
  `mode` enum('closed','restricted','public','open') NOT NULL,
  `created` datetime default NULL,
  `creator_id` mediumint(10) default NULL,
  `modified` datetime default NULL,
  `modifier_id` mediumint(10) default NULL,
  PRIMARY KEY  (`id`),
  KEY `name` (`name`(20)),
  KEY `creator_id` (`creator_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Table structure for table `skin`
--

CREATE TABLE `skin` (
  `id` mediumint(10) NOT NULL default '0',
  `name` varchar(30) default NULL,
  `prototype` varchar(30) default NULL,
  `layout_id` mediumint(10) default NULL,
  `created` datetime default NULL,
  `creator_id` mediumint(10) default NULL,
  `modified` datetime default NULL,
  `modifier_id` mediumint(10) default NULL,
  PRIMARY KEY  (`id`),
  KEY `type` (`layout_id`,`prototype`(10),`name`(10))
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Table structure for table `tag`
--

CREATE TABLE `tag` (
  `id` int(11) NOT NULL default '0',
  `name` varchar(255) default NULL,
  `site_id` int(11) default NULL,
  `type` enum('Story','Image') default NULL,
  PRIMARY KEY  (`id`),
  KEY `tags` (`site_id`,`type`,`name`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Table structure for table `tag_hub`
--

CREATE TABLE `tag_hub` (
  `id` int(11) NOT NULL default '0',
  `tag_id` int(11) default NULL,
  `tagged_id` int(11) default NULL,
  `tagged_type` enum('Story','Image') default NULL,
  `user_id` int(11) default NULL,
  PRIMARY KEY  (`id`),
  KEY `tagged` (`tag_id`,`tagged_type`,`tagged_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` mediumint(10) NOT NULL default '0',
  `name` varchar(255) default NULL,
  `metadata` mediumtext,
  `email` varchar(255) default NULL,
  `status` enum('blocked','regular','trusted','privileged') NOT NULL default 'regular',
  `visited` datetime default NULL,
  `created` datetime default NULL,
  `modified` datetime default NULL,
  PRIMARY KEY  (`id`),
  KEY `name` (`name`(20))
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Table structure for table `vote`
--

CREATE TABLE `vote` (
  `id` mediumint(10) NOT NULL default '0',
  `poll_id` mediumint(10) default NULL,
  `choice_id` mediumint(10) default NULL,
  `creator_name` varchar(255) default NULL,
  `created` datetime default NULL,
  `creator_id` mediumint(10) default NULL,
  `modified` datetime default NULL,
  PRIMARY KEY  (`id`),
  KEY `poll_id` (`poll_id`),
  KEY `creator_id` (`creator_id`),
  KEY `choice_id` (`choice_id`),
  KEY `creator_name` (`creator_name`(20))
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

INSERT INTO `user` (`id`,`name`,`metadata`,`email`,`status`,`created`,`modified`) VALUES ('1','queen','({hash:"0e9f0fa4073104f670e236c85a55f9ee", salt:"4r0XkGb3FKA="})',NULL,'privileged',NULL,NULL);

INSERT INTO `site` (`id`,`name`,`status`,`mode`,`metadata`,`layout_id`,`created`,`creator_id`,`modified`,`modifier_id`) VALUES ('1','www','trusted','closed','({title:"Antville"})','1',NULL,'1',NULL,'1');

INSERT INTO `layout` (`id`,`name`,`site_id`,`layout_id`,`metadata`,`created`,`modified`,`creator_id`,`modifier_id`,`mode`) VALUES ('1','default','1', NULL,'({})',NULL,NULL,'1','1','default');

INSERT INTO `membership` (`id`,`name`,`site_id`,`role`,`created`,`creator_id`,`modified`,`modifier_id`) VALUES ('1','queen','1','Owner',NULL,'1',NULL,'1');

-- Dump completed on 2007-10-06 13:30:24
