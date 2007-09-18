#-----------------------------------
#-- Database
#-----------------------------------

CREATE DATABASE IF NOT EXISTS antville;
USE antville;

#------------------------------
#-- Database-User
#------------------------------

GRANT SELECT,INSERT,UPDATE,DELETE ON antville.* TO antville@localhost IDENTIFIED BY 'antville';

#------------------------------
# Table structure for AV_ACCESSLOG
#------------------------------

create table AV_ACCESSLOG (
   ACCESSLOG_ID mediumint(10) not null auto_increment,
   ACCESSLOG_F_SITE mediumint(10),
   ACCESSLOG_F_TEXT mediumint(10),
   ACCESSLOG_REFERRER text,
   ACCESSLOG_IP varchar(20),
   ACCESSLOG_BROWSER varchar(255),
   ACCESSLOG_DATE timestamp,
   primary key (ACCESSLOG_ID)
);

#---------------------------
# Indexes on table AV_ACCESSLOG
#---------------------------

create index IDX_ACCESSLOG_F_TEXT on AV_ACCESSLOG (ACCESSLOG_F_TEXT);
create index IDX_ACCESSLOG_MIXED on AV_ACCESSLOG (ACCESSLOG_F_SITE,ACCESSLOG_DATE);

#----------------------------
# Table structure for AV_CHOICE
#----------------------------

create table AV_CHOICE (
   CHOICE_ID mediumint(10) not null,
   CHOICE_F_POLL mediumint(10),
   CHOICE_TITLE varchar(255),
   CHOICE_CREATETIME datetime,
   CHOICE_MODIFYTIME datetime,
   primary key (CHOICE_ID)
);

#----------------------------
# Indexes on table AV_CHOICE
#----------------------------

CREATE INDEX IDX_CHOICE_F_POLL ON AV_CHOICE (CHOICE_F_POLL);

#----------------------------
# Table structure for AV_FILE
#----------------------------
create table AV_FILE (
  FILE_ID mediumint(10) not null,
  FILE_F_SITE mediumint(10),
  FILE_ALIAS tinytext,
  FILE_MIMETYPE tinytext,
  FILE_NAME tinytext,
  FILE_SIZE mediumint(10),
  FILE_DESCRIPTION mediumtext,
  FILE_REQUESTCNT mediumint(10),
  FILE_CREATETIME datetime,
  FILE_F_USER_CREATOR mediumint(10),
  FILE_MODIFYTIME datetime,
  FILE_F_USER_MODIFIER mediumint(10),
  primary key (FILE_ID)
);

#----------------------------
# Indexes on table AV_FILE
#----------------------------

CREATE INDEX IDX_FILE_F_SITE ON AV_FILE (FILE_F_SITE);
CREATE INDEX IDX_FILE_ALIAS ON AV_FILE (FILE_ALIAS(20));
CREATE INDEX IDX_FILE_F_USER_CREATOR ON AV_FILE (FILE_F_USER_CREATOR);

#----------------------------
# Table structure for AV_IMAGE
#----------------------------
create table AV_IMAGE (
   IMAGE_ID mediumint(10) not null,
   IMAGE_F_SITE mediumint(10),
   IMAGE_F_LAYOUT mediumint(10),
   IMAGE_F_IMAGE_PARENT mediumint(10),
   IMAGE_F_IMAGE_THUMB mediumint(10),
   IMAGE_PROTOTYPE varchar(20),
   IMAGE_ALIAS tinytext,
   IMAGE_TOPIC varchar(255),
   IMAGE_FILENAME tinytext,
   IMAGE_FILEEXT tinytext,
   IMAGE_WIDTH mediumint(4),
   IMAGE_HEIGHT mediumint(4),
   IMAGE_ALTTEXT mediumtext,
   IMAGE_FILESIZE mediumint(10),
   IMAGE_CREATETIME datetime,
   IMAGE_F_USER_CREATOR mediumint(10),
   IMAGE_MODIFYTIME datetime,
   IMAGE_F_USER_MODIFIER mediumint(10),
   primary key (IMAGE_ID)
);

#----------------------------
# Indexes on table AV_IMAGE
#----------------------------

CREATE INDEX IDX_IMAGE_F_USER_CREATOR ON AV_IMAGE (IMAGE_F_USER_CREATOR);
CREATE INDEX IDX_IMAGE_MIXED ON AV_IMAGE (IMAGE_F_SITE,IMAGE_ALIAS(20),IMAGE_F_IMAGE_PARENT);
CREATE INDEX IDX_IMAGE_MIXED_LAYOUT ON AV_IMAGE (IMAGE_F_LAYOUT,IMAGE_ALIAS(20),IMAGE_F_IMAGE_PARENT);

#----------------------------
# records for table AV_IMAGE
#----------------------------

alter table AV_IMAGE change column IMAGE_ID IMAGE_ID mediumint(10) not null auto_increment;
insert into AV_IMAGE (IMAGE_PROTOTYPE,IMAGE_ALIAS,IMAGE_FILENAME,IMAGE_FILEEXT,IMAGE_WIDTH,IMAGE_HEIGHT,IMAGE_ALTTEXT) values ('layoutimage','big','big','gif',404,53,'antville.org');
insert into AV_IMAGE (IMAGE_PROTOTYPE,IMAGE_ALIAS,IMAGE_FILENAME,IMAGE_FILEEXT,IMAGE_WIDTH,IMAGE_HEIGHT) values ('layoutimage','headbg','headbg','gif',3,52);
insert into AV_IMAGE (IMAGE_PROTOTYPE,IMAGE_ALIAS,IMAGE_FILENAME,IMAGE_FILEEXT,IMAGE_WIDTH,IMAGE_HEIGHT,IMAGE_ALTTEXT) values ('layoutimage','menu','menu','gif',36,13,'menu');
insert into AV_IMAGE (IMAGE_PROTOTYPE,IMAGE_ALIAS,IMAGE_FILENAME,IMAGE_FILEEXT,IMAGE_WIDTH,IMAGE_HEIGHT,IMAGE_ALTTEXT) values ('layoutimage','recent','recent','gif',123,13,'recently modified');
insert into AV_IMAGE (IMAGE_PROTOTYPE,IMAGE_ALIAS,IMAGE_FILENAME,IMAGE_FILEEXT,IMAGE_WIDTH,IMAGE_HEIGHT,IMAGE_ALTTEXT) values ('layoutimage','status','status','gif',48,13,'status');
insert into AV_IMAGE (IMAGE_PROTOTYPE,IMAGE_ALIAS,IMAGE_FILENAME,IMAGE_FILEEXT,IMAGE_WIDTH,IMAGE_HEIGHT,IMAGE_ALTTEXT) values ('layoutimage','dot','dot','gif',30,30,'dots');
insert into AV_IMAGE (IMAGE_PROTOTYPE,IMAGE_ALIAS,IMAGE_FILENAME,IMAGE_FILEEXT,IMAGE_WIDTH,IMAGE_HEIGHT,IMAGE_ALTTEXT) values ('layoutimage','bullet','bullet','gif',3,10,'bullet');
insert into AV_IMAGE (IMAGE_PROTOTYPE,IMAGE_ALIAS,IMAGE_FILENAME,IMAGE_FILEEXT,IMAGE_WIDTH,IMAGE_HEIGHT,IMAGE_ALTTEXT) values ('layoutimage','webloghead','webloghead','gif',404,53,'head');
insert into AV_IMAGE (IMAGE_PROTOTYPE,IMAGE_ALIAS,IMAGE_FILENAME,IMAGE_FILEEXT,IMAGE_WIDTH,IMAGE_HEIGHT,IMAGE_ALTTEXT) values ('layoutimage','manage','manage','gif',50,13,'manage');
alter table AV_IMAGE change column IMAGE_ID IMAGE_ID mediumint(10) not null;

#-------------------------------
# Table structure for AV_MEMBERSHIP
#-------------------------------
create table AV_MEMBERSHIP (
   MEMBERSHIP_ID mediumint(10) not null,
   MEMBERSHIP_F_SITE mediumint(10),
   MEMBERSHIP_F_USER mediumint(10),
   MEMBERSHIP_USERNAME tinytext,
   MEMBERSHIP_LEVEL mediumint(10),
   MEMBERSHIP_CREATETIME datetime,
   MEMBERSHIP_MODIFYTIME datetime,
   MEMBERSHIP_F_USER_MODIFIER mediumint(10),
   primary key (MEMBERSHIP_ID)
);

#----------------------------
# Indexes on table AV_MEMBERSHIP
#----------------------------

CREATE INDEX IDX_MEMBERSHIP_F_SITE ON AV_MEMBERSHIP (MEMBERSHIP_F_SITE);
CREATE INDEX IDX_MEMBERSHIP_F_USER ON AV_MEMBERSHIP (MEMBERSHIP_F_USER);
CREATE INDEX IDX_MEMBERSHIP_USERNAME ON AV_MEMBERSHIP (MEMBERSHIP_USERNAME(20));
CREATE INDEX IDX_MEMBERSHIP_LEVEL ON AV_MEMBERSHIP (MEMBERSHIP_LEVEL);

#----------------------------
# Table structure for AV_POLL
#----------------------------

create table AV_POLL (
   POLL_ID mediumint(10) not null,
   POLL_F_SITE mediumint(10),
   POLL_TITLE varchar(255),
   POLL_QUESTION mediumtext,
   POLL_ISONLINE tinyint(1),
   POLL_CLOSED tinyint(4),
   POLL_CLOSETIME datetime,
   POLL_CREATETIME datetime,
   POLL_F_USER_CREATOR mediumint(10),
   POLL_MODIFYTIME datetime,
   POLL_F_USER_MODIFIER mediumint(10),
   primary key (POLL_ID)
);

#----------------------------
# Indexes on table AV_POLL
#----------------------------

CREATE INDEX IDX_POLL_F_SITE ON AV_POLL (POLL_F_SITE);
CREATE INDEX IDX_POLL_F_USER_CREATOR ON AV_POLL (POLL_F_USER_CREATOR);

#------------------------------
# Table structure for AV_LAYOUT
#------------------------------
create table AV_LAYOUT (
   LAYOUT_ID mediumint(10) not null,
   LAYOUT_ALIAS varchar(128),
   LAYOUT_TITLE varchar(128),
   LAYOUT_F_SITE mediumint(10),
   LAYOUT_F_LAYOUT_PARENT mediumint(10),
   LAYOUT_PREFERENCES mediumtext,
   LAYOUT_DESCRIPTION mediumtext,
   LAYOUT_CREATETIME datetime,
   LAYOUT_MODIFYTIME datetime,
   LAYOUT_F_USER_CREATOR mediumint(10),
   LAYOUT_F_USER_MODIFIER mediumint(10),
   LAYOUT_SHAREABLE tinyint(1),
   LAYOUT_ISIMPORT tinyint(1),
   primary key (LAYOUT_ID)
);

# create an initial layout object
alter table AV_LAYOUT change column LAYOUT_ID LAYOUT_ID mediumint(10) not null auto_increment;
insert into AV_LAYOUT (LAYOUT_ALIAS, LAYOUT_TITLE, LAYOUT_PREFERENCES, LAYOUT_DESCRIPTION, LAYOUT_SHAREABLE)
values ('default', 'antville.org', '<?xml version="1.0" encoding="UTF-8"?>\r\n<xmlroot xmlns:hop="http://www.helma.org/docs/guide/features/database">\r\n  <hopobject id="t234" name="HopObject" prototype="HopObject" created="1069430202375" lastModified="1069430202375">\r\n    <smallcolor>959595</smallcolor>\r\n    <textcolor>000000</textcolor>\r\n    <vlinkcolor>ff4040</vlinkcolor>\r\n    <titlecolor>d50000</titlecolor>\r\n    <smallsize>11px</smallsize>\r\n    <alinkcolor>ff4040</alinkcolor>\r\n    <textsize>13px</textsize>\r\n    <titlesize>15px</titlesize>\r\n    <linkcolor>ff4040</linkcolor>\r\n    <smallfont>Verdana, Arial, Helvetica, sans-serif</smallfont>\r\n    <textfont>Verdana, Helvetica, Arial, sans-serif</textfont>\r\n    <titlefont>Verdana, Helvetica, Arial, sans-serif</titlefont>\r\n    <bgcolor>ffffff</bgcolor>\r\n  </hopobject>\r\n</xmlroot>', 'The layout of antville.org', 1);
alter table AV_LAYOUT change column LAYOUT_ID LAYOUT_ID mediumint(10) not null;
# mark all default images as layout images of default layout
select @layoutID:=LAYOUT_ID from AV_LAYOUT where LAYOUT_ALIAS = 'default' and LAYOUT_F_SITE is null and LAYOUT_F_LAYOUT_PARENT is null;
update AV_IMAGE set IMAGE_F_LAYOUT = @layoutID where IMAGE_F_SITE is null;

#----------------------------
# Indexes on table AV_LAYOUT
#----------------------------

CREATE INDEX IDX_LAYOUT_ALIAS ON AV_LAYOUT (LAYOUT_ALIAS);
CREATE INDEX IDX_LAYOUT_F_SITE ON AV_LAYOUT (LAYOUT_F_SITE);
CREATE INDEX IDX_LAYOUT_F_LAYOUT_PARENT ON AV_LAYOUT (LAYOUT_F_LAYOUT_PARENT);

#----------------------------
# Table structure for AV_SKIN
#----------------------------
create table AV_SKIN (
   SKIN_ID mediumint(10) not null,
   SKIN_F_LAYOUT mediumint(10),
   SKIN_PROTOTYPE tinytext,
   SKIN_NAME tinytext,
   SKIN_ISCUSTOM tinyint(1),
   SKIN_SOURCE mediumtext,
   SKIN_CREATETIME datetime,
   SKIN_F_USER_CREATOR mediumint(10),
   SKIN_MODIFYTIME datetime,
   SKIN_F_USER_MODIFIER mediumint(10),
   primary key (SKIN_ID)
);

#----------------------------
# Indexes on table AV_SKIN
#----------------------------

CREATE INDEX IDX_SKIN_MIXED ON AV_SKIN (SKIN_F_LAYOUT,SKIN_PROTOTYPE(10),SKIN_NAME(10));

#----------------------------
# Table structure for AV_SYSLOG
#----------------------------

create table AV_SYSLOG (
  SYSLOG_ID mediumint(10) not null,
  SYSLOG_TYPE tinytext null,
  SYSLOG_OBJECT tinytext null,
  SYSLOG_ENTRY mediumtext null,
  SYSLOG_CREATETIME datetime null,
  SYSLOG_F_USER_CREATOR mediumint(10) null,
  primary key (SYSLOG_ID)
);

CREATE INDEX IDX_SYSLOG_TYPE ON AV_SYSLOG (SYSLOG_TYPE(10));
CREATE INDEX IDX_SYSLOG_OBJECT ON AV_SYSLOG (SYSLOG_OBJECT(10));

#----------------------------
# Table structure for AV_TEXT
#----------------------------

create table AV_TEXT (
   TEXT_ID mediumint(10) not null,
   TEXT_F_SITE mediumint(10),
   TEXT_DAY varchar(10),
   TEXT_TOPIC varchar(255),
   TEXT_PROTOTYPE varchar(20),
   TEXT_F_TEXT_STORY mediumint(10),
   TEXT_F_TEXT_PARENT mediumint(10),
   TEXT_ALIAS varchar(255),
   TEXT_TITLE mediumtext,
   TEXT_TEXT mediumtext,
   TEXT_CONTENT mediumtext,
   TEXT_RAWCONTENT mediumtext,
   TEXT_ISONLINE tinyint(4),
   TEXT_EDITABLEBY tinyint(4),
   TEXT_HASDISCUSSIONS tinyint(1),
   TEXT_CREATETIME datetime,
   TEXT_F_USER_CREATOR mediumint(10),
   TEXT_MODIFYTIME datetime,
   TEXT_F_USER_MODIFIER mediumint(10),
   TEXT_READS mediumint(10),
   TEXT_IPADDRESS varchar(20),
   primary key (TEXT_ID)
);

#----------------------------
# Indexes on table AV_TEXT
#----------------------------

CREATE INDEX IDX_TEXT_F_TEXT_STORY ON AV_TEXT (TEXT_F_TEXT_STORY);
CREATE INDEX IDX_TEXT_F_TEXT_PARENT ON AV_TEXT (TEXT_F_TEXT_PARENT);
CREATE INDEX IDX_TEXT_F_USER_CREATOR ON AV_TEXT (TEXT_F_USER_CREATOR);
CREATE INDEX IDX_TEXT_MIXED_ALL ON AV_TEXT (TEXT_F_SITE,TEXT_MODIFYTIME,TEXT_ISONLINE,TEXT_PROTOTYPE,TEXT_ID);
CREATE INDEX IDX_TEXT_MIXED_TOPIC ON AV_TEXT (TEXT_F_SITE,TEXT_TOPIC);
CREATE INDEX IDX_TEXT_MIXED_DAY ON AV_TEXT (TEXT_F_SITE,TEXT_DAY);
CREATE INDEX IDX_TEXT_MIXED_STORIES ON AV_TEXT (TEXT_F_SITE,TEXT_PROTOTYPE,TEXT_ISONLINE,TEXT_CREATETIME,TEXT_ID,TEXT_DAY);


#----------------------------
# Table structure for AV_USER
#----------------------------

create table AV_USER (
   USER_ID mediumint(10) not null,
   USER_NAME tinytext,
   USER_PASSWORD tinytext,
   USER_EMAIL tinytext,
   USER_EMAIL_ISPUBLIC tinyint(1),
   USER_URL tinytext,
   USER_REGISTERED datetime,
   USER_LASTVISIT datetime,
   USER_ISBLOCKED tinyint(1),
   USER_ISTRUSTED tinyint(1),
   USER_ISSYSADMIN tinyint(1),
   primary key (USER_ID)
);

#----------------------------
# Indexes on table AV_USER
#----------------------------

CREATE INDEX IDX_USER_NAME ON AV_USER (USER_NAME(20));
CREATE INDEX IDX_USER_PASSWORD ON AV_USER (USER_PASSWORD(20));
CREATE INDEX IDX_USER_ISBLOCKED ON AV_USER (USER_ISBLOCKED);
CREATE INDEX IDX_USER_ISTRUSTED ON AV_USER (USER_ISTRUSTED);
CREATE INDEX IDX_USER_ISSYSADMIN ON AV_USER (USER_ISSYSADMIN);

#----------------------------
# Table structure for AV_VOTE
#----------------------------

create table AV_VOTE (
   VOTE_ID mediumint(10) not null,
   VOTE_F_POLL mediumint(10),
   VOTE_F_USER mediumint(10),
   VOTE_F_CHOICE mediumint(10),
   VOTE_USERNAME tinytext,
   VOTE_CREATETIME datetime,
   VOTE_MODIFYTIME datetime,
   primary key (VOTE_ID)
);

#----------------------------
# Indexes on table AV_VOTE
#----------------------------

CREATE INDEX IDX_VOTE_F_POLL ON AV_VOTE (VOTE_F_POLL);
CREATE INDEX IDX_VOTE_F_USER ON AV_VOTE (VOTE_F_USER);
CREATE INDEX IDX_VOTE_F_CHOICE ON AV_VOTE (VOTE_F_CHOICE);
CREATE INDEX IDX_VOTE_USERNAME ON AV_VOTE (VOTE_USERNAME(20));

#----------------------------
# Table structure for AV_SITE
#----------------------------
create table AV_SITE (
   SITE_ID mediumint(10) not null,
   SITE_TITLE tinytext,
   SITE_ALIAS tinytext,
   SITE_EMAIL tinytext,
   SITE_F_LAYOUT mediumint(10),
   SITE_ISONLINE tinyint(1),
   SITE_ISBLOCKED tinyint(1),
   SITE_ISTRUSTED tinyint(1),
   SITE_LASTUPDATE datetime,
   SITE_LASTOFFLINE datetime,
   SITE_LASTBLOCKWARN datetime,
   SITE_LASTDELWARN datetime,
   SITE_LASTPING datetime,
   SITE_ENABLEPING tinyint(1),
   SITE_PREFERENCES mediumtext,
   SITE_DISKUSAGE mediumint(10),
   SITE_CREATETIME datetime,
   SITE_F_USER_CREATOR mediumint(10),
   SITE_MODIFYTIME datetime,
   SITE_F_USER_MODIFIER mediumint(10),
   primary key (SITE_ID)
);

#----------------------------
# Indexes on table AV_SITE
#----------------------------

CREATE INDEX IDX_SITE_ALIAS ON AV_SITE (SITE_ALIAS(20));
CREATE INDEX IDX_SITE_ISONLINE ON AV_SITE (SITE_ISONLINE);
CREATE INDEX IDX_SITE_ISBLOCKED ON AV_SITE (SITE_ISBLOCKED);
CREATE INDEX IDX_SITE_ENABLEPING ON AV_SITE (SITE_ENABLEPING);
CREATE INDEX IDX_SITE_LASTPING ON AV_SITE (SITE_LASTPING);
CREATE INDEX IDX_SITE_F_USER_CREATOR ON AV_SITE (SITE_F_USER_CREATOR);