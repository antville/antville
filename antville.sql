use antville ;
#----------------------------
# Table structure for COMMENT
#----------------------------
create table COMMENT (
   ID mediumint(9) not null default '0',
   WEBLOG_ID mediumint(9),
   STORY_ID mediumint(9),
   PARENT_ID mediumint(9) default '0',
   TITLE mediumtext,
   TEXT mediumtext,
   AUTHOR mediumint(9),
   CREATETIME datetime,
   MODIFYTIME datetime,
   ISONLINE tinyint(1),
   IPADDRESS varchar(20),
   unique ID (ID));

#----------------------------
# No records for table COMMENT
#----------------------------

#----------------------------
# Table structure for IMAGE
#----------------------------
create table IMAGE (
   ID mediumint(9) not null default '0',
   WEBLOG_ID mediumint(9),
   ALIAS tinytext,
   FILENAME tinytext,
   FILEEXT tinytext,
   WIDTH mediumint(9),
   HEIGHT mediumint(9),
   ALTTEXT tinytext,
   CREATETIME datetime,
   CREATOR mediumint(9),
   MODIFYTIME datetime,
   MODIFIER mediumint(9),
   unique ID (ID));

#----------------------------
# No records for table IMAGE
#----------------------------

#----------------------------
# Table structure for SKIN
#----------------------------
create table SKIN (
   ID mediumint(9) not null default '0',
   WEBLOG_ID mediumint(9),
   PROTO tinytext,
   NAME tinytext,
   SOURCE mediumtext,
   CREATOR mediumint(9),
   CREATETIME datetime,
   MODIFYTIME datetime,
   unique ID (ID));

#----------------------------
# No records for table SKIN
#----------------------------

#----------------------------
# Table structure for STORY
#----------------------------
create table STORY (
   ID mediumint(9) not null default '0',
   WEBLOG_ID mediumint(9),
   DAY varchar(10),
   TITLE mediumtext,
   TEXT mediumtext,
   ISONLINE tinyint(1),
   AUTHOR mediumint(9),
   CREATETIME datetime,
   MODIFYTIME datetime,
   unique ID (ID));

#----------------------------
# No records for table STORY
#----------------------------

#----------------------------
# Table structure for USER
#----------------------------
create table USER (
   ID mediumint(9) not null default '0',
   WEBLOG_ID mediumint(9),
   USERNAME tinytext,
   PASSWORD tinytext,
   EMAIL tinytext,
   DESCRIPTION mediumtext,
   URL tinytext,
   REGISTERED datetime,
   LASTVISIT datetime,
   ISBLOCKED tinyint(1),
   unique ID (ID));

#----------------------------
# No records for table USER
#----------------------------

#----------------------------
# Table structure for WEBLOG
#----------------------------
create table WEBLOG (
   ID mediumint(9) not null default '0',
   OWNER_ID mediumint(9),
   TITLE tinytext,
   ALIAS tinytext,
   TAGLINE tinytext,
   BIRTHDATE datetime,
   BGCOLOR varchar(6),
   TEXTFONT tinytext,
   TEXTCOLOR varchar(6),
   TEXTSIZE varchar(4),
   LINKCOLOR varchar(6),
   ALINKCOLOR varchar(6),
   VLINKCOLOR varchar(6),
   TITLEFONT tinytext,
   TITLECOLOR varchar(6),
   TITLESIZE varchar(4),
   ISONLINE tinyint(1),
   ISBLOCKED tinyint(1),
   LASTUPDATE datetime,
   HASDISCUSSIONS tinyint(1),
   SHOWDAYS tinyint(4),
   SHOWARCHIVE tinyint(1),
   CREATETIME datetime,
   CREATOR mediumint(9),
   MODIFYTIME datetime,
   MODIFIER mediumint(9),
   unique ID (ID));

#----------------------------
# No records for table WEBLOG
#----------------------------


