CREATE DATABASE IF NOT EXISTS antville;
USE antville;
GRANT SELECT,INSERT,UPDATE,DELETE ON antville.* TO antville@localhost IDENTIFIED BY 'antville';

#----------------------------
# Table structure for COMMENT
#----------------------------
create table COMMENT (
   ID mediumint(9) not null,
   WEBLOG_ID mediumint(9),
   STORY_ID mediumint(9),
   PARENT_ID mediumint(9),
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
   ID mediumint(9) not null,
   WEBLOG_ID mediumint(9),
   PARENT_ID mediumint(9),
   THUMBNAIL_ID mediumint(9),
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
# records for table IMAGE
#----------------------------

alter table IMAGE change column ID ID mediumint(9) not null auto_increment;
insert into IMAGE (ALIAS,FILENAME,FILEEXT,WIDTH,HEIGHT,ALTTEXT) values ('big','big','gif',404,53,'antville.org');
insert into IMAGE (ALIAS,FILENAME,FILEEXT,WIDTH,HEIGHT,ALTTEXT) values ('smallanim','smallanim','gif',98,30,'resident of antville.org');
insert into IMAGE (ALIAS,FILENAME,FILEEXT,WIDTH,HEIGHT,ALTTEXT) values ('smallchaos','smallchaos','gif',107,29,'resident of antville.org');
insert into IMAGE (ALIAS,FILENAME,FILEEXT,WIDTH,HEIGHT,ALTTEXT) values ('smallstraight','smallstraight','gif',107,24,'resident of antville.org');
insert into IMAGE (ALIAS,FILENAME,FILEEXT,WIDTH,HEIGHT,ALTTEXT) values ('smalltrans','smalltrans','gif',98,30,'resident of antville.org');
insert into IMAGE (ALIAS,FILENAME,FILEEXT,WIDTH,HEIGHT,ALTTEXT) values ('pixel','pixel','gif',1,1,'pixel');
insert into IMAGE (ALIAS,FILENAME,FILEEXT,WIDTH,HEIGHT) values ('headbg','headbg','gif',3,52);
insert into IMAGE (ALIAS,FILENAME,FILEEXT,WIDTH,HEIGHT,ALTTEXT) values ('menu','menu','gif',36,13,'menu');
insert into IMAGE (ALIAS,FILENAME,FILEEXT,WIDTH,HEIGHT,ALTTEXT) values ('recent','recent','gif',123,13,'recently modified');
insert into IMAGE (ALIAS,FILENAME,FILEEXT,WIDTH,HEIGHT,ALTTEXT) values ('status','status','gif',48,13,'status');
insert into IMAGE (ALIAS,FILENAME,FILEEXT,WIDTH,HEIGHT,ALTTEXT) values ('dot','dot','gif',30,30,'dots');
insert into IMAGE (ALIAS,FILENAME,FILEEXT,WIDTH,HEIGHT,ALTTEXT) values ('bullet','bullet','gif',3,10,'bullet');
insert into IMAGE (ALIAS,FILENAME,FILEEXT,WIDTH,HEIGHT,ALTTEXT) values ('webloghead','webloghead','gif',404,53,'head');
insert into IMAGE (ALIAS,FILENAME,FILEEXT,WIDTH,HEIGHT,ALTTEXT) values ('hop','hop','gif',124,25,'helma object publisher');
alter table IMAGE change column ID ID mediumint(9) not null;

#----------------------------
# Table structure for SKIN
#----------------------------
create table SKIN (
   ID mediumint(9) not null,
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
   ID mediumint(9) not null,
   WEBLOG_ID mediumint(9),
   DAY varchar(10),
   TITLE mediumtext,
   TEXT mediumtext,
   ISONLINE tinyint(1),
   EDITABLEBY tinyint(1),
   AUTHOR mediumint(9),
   CREATETIME datetime,
   MODIFYTIME datetime,
   MODIFIER mediumint(9),
   unique ID (ID));

#----------------------------
# No records for table STORY
#----------------------------

#----------------------------
# Table structure for USER
#----------------------------
create table USER (
   ID mediumint(9) not null,
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
   ID mediumint(9) not null,
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
   USERMAYCONTRIB tinyint(1),
   USERMAYSIGNUP tinyint(1),
   SHOWDAYS tinyint(4),
   SHOWARCHIVE tinyint(1),
   LANGUAGE varchar(2),
   COUNTRY varchar(2),
   DATEFORMAT varchar(50),
   CREATETIME datetime,
   CREATOR mediumint(9),
   MODIFYTIME datetime,
   MODIFIER mediumint(9),
   unique ID (ID));

#----------------------------
# No records for table WEBLOG
#----------------------------

#----------------------------
# Table structure for MEMBER
#----------------------------
create table MEMBER (
   ID mediumint(9) not null,
   WEBLOG_ID mediumint(9),
   USER_ID mediumint(9),
   USERNAME tinytext,
   LEVEL tinyint(1),
   CREATETIME datetime,
   MODIFIER mediumint(9),
   MODIFYTIME datetime,
   unique ID (ID));

#----------------------------
# No records for table MEMBER
#----------------------------

#----------------------------
# Table structure for GOODIE
#----------------------------
create table GOODIE (
  ID mediumint(9) not null,
  WEBLOG_ID mediumint(9),
  ALIAS tinytext,
  MIMETYPE tinytext,
  `FILE` tinytext,
  FILESIZE mediumint(9),
  DESCRIPTION mediumtext,
  REQUESTCNT mediumint(9),
  CREATETIME datetime,
  CREATOR mediumint(9),
  MODIFYTIME datetime,
  MODIFIER mediumint(9),
  unique ID(ID));

#----------------------------
# No records for table GOODIE
#----------------------------
