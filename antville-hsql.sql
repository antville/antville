#
# SQL CREATE TABLE statements modified to work with HypersoniqSQL.
# Hannes Wallnoefer, 16.10.2001
#
#----------------------------
# Table structure for COMMENT
#----------------------------
create table COMMENT (
   ID int(9) not null primary key,
   WEBLOG_ID int(9),
   STORY_ID int(9),
   PARENT_ID int(9),
   TITLE longvarchar,
   TEXT longvarchar,
   AUTHOR int(9),
   CREATETIME datetime,
   MODIFYTIME datetime,
   ISONLINE tinyint(1),
   IPADDRESS varchar(20));

#----------------------------
# No records for table COMMENT
#----------------------------

#----------------------------
# Table structure for IMAGE
#----------------------------
create table IMAGE (
   ID int(9) not null primary key,
   WEBLOG_ID int(9),
   PARENT_ID int(9),
   THUMBNAIL_ID int(9),
   ALIAS varchar(255),
   FILENAME varchar(255),
   FILEEXT varchar(255),
   WIDTH int(9),
   HEIGHT int(9),
   ALTTEXT varchar(255),
   CREATETIME datetime,
   CREATOR int(9),
   MODIFYTIME datetime,
   MODIFIER int(9));

#----------------------------
# No records for table IMAGE
#----------------------------

#----------------------------
# Table structure for SKIN
#----------------------------
create table SKIN (
   ID int(9) not null primary key,
   WEBLOG_ID int(9),
   PROTO varchar(255),
   NAME varchar(255),
   SOURCE longvarchar,
   CREATOR int(9),
   CREATETIME datetime,
   MODIFYTIME datetime);

#----------------------------
# No records for table SKIN
#----------------------------

#----------------------------
# Table structure for STORY
#----------------------------
create table STORY (
   ID int(9) not null primary key,
   WEBLOG_ID int(9),
   DAY varchar(10),
   TITLE longvarchar,
   TEXT longvarchar,
   ISONLINE tinyint(1),
   EDITABLEBY tinyint(1),
   AUTHOR int(9),
   CREATETIME datetime,
   MODIFYTIME datetime,
   MODIFIER int(9));

#----------------------------
# No records for table STORY
#----------------------------

#----------------------------
# Table structure for USER
#----------------------------
create table USER (
   ID int(9) not null primary key,
   USERNAME varchar(255),
   PASSWORD varchar(255),
   EMAIL varchar(255),
   DESCRIPTION longvarchar,
   URL varchar(255),
   REGISTERED datetime,
   LASTVISIT datetime,
   ISBLOCKED tinyint(1));

#----------------------------
# No records for table USER
#----------------------------

#----------------------------
# Table structure for WEBLOG
#----------------------------
create table WEBLOG (
   ID int(9) not null primary key,
   TITLE varchar(255),
   ALIAS varchar(255),
   TAGLINE varchar(255),
   BIRTHDATE datetime,
   BGCOLOR varchar(6),
   TEXTFONT varchar(255),
   TEXTCOLOR varchar(6),
   TEXTSIZE varchar(4),
   LINKCOLOR varchar(6),
   ALINKCOLOR varchar(6),
   VLINKCOLOR varchar(6),
   TITLEFONT varchar(255),
   TITLECOLOR varchar(6),
   TITLESIZE varchar(4),
   ISONLINE tinyint(1),
   ISBLOCKED tinyint(1),
   LASTUPDATE datetime,
   HASDISCUSSIONS tinyint(1),
   USERMAYCONTRIB tinyint(1),
   USERMAYSIGNUP tinyint(1),
   SHOWDAYS tinyint(4),
   SHOWARCHIVE tinyint(1),
   LANGUAGE varchar(2),
   COUNTRY varchar(2),
   DATEFORMAT varchar(50),
   CREATETIME datetime,
   CREATOR int(9),
   MODIFYTIME datetime,
   MODIFIER int(9));

#----------------------------
# No records for table WEBLOG
#----------------------------

#----------------------------
# Table structure for MEMBER
#----------------------------
create table MEMBER (
   ID int(9) not null primary key,
   WEBLOG_ID int(9),
   USER_ID int(9),
   USERNAME varchar(255),
   LEVEL tinyint(1),
   CREATETIME datetime,
   MODIFIER int(9),
   MODIFYTIME datetime);

#----------------------------
# No records for table MEMBER
#----------------------------


