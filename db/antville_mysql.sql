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
   IMAGE_F_IMAGE_PARENT mediumint(10),
   IMAGE_F_IMAGE_THUMB mediumint(10),
   IMAGE_ALIAS tinytext,
   IMAGE_FILENAME tinytext,
   IMAGE_FILEEXT tinytext,
   IMAGE_WIDTH mediumint(4),
   IMAGE_HEIGHT mediumint(4),
   IMAGE_ALTTEXT tinytext,
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

#----------------------------
# records for table AV_IMAGE
#----------------------------

alter table AV_IMAGE change column IMAGE_ID IMAGE_ID mediumint(10) not null auto_increment;
insert into AV_IMAGE (IMAGE_ALIAS,IMAGE_FILENAME,IMAGE_FILEEXT,IMAGE_WIDTH,IMAGE_HEIGHT,IMAGE_ALTTEXT) values ('big','big','gif',404,53,'antville.org');
insert into AV_IMAGE (IMAGE_ALIAS,IMAGE_FILENAME,IMAGE_FILEEXT,IMAGE_WIDTH,IMAGE_HEIGHT,IMAGE_ALTTEXT) values ('smallanim','smallanim','gif',98,30,'resident of antville.org');
insert into AV_IMAGE (IMAGE_ALIAS,IMAGE_FILENAME,IMAGE_FILEEXT,IMAGE_WIDTH,IMAGE_HEIGHT,IMAGE_ALTTEXT) values ('smallchaos','smallchaos','gif',107,29,'resident of antville.org');
insert into AV_IMAGE (IMAGE_ALIAS,IMAGE_FILENAME,IMAGE_FILEEXT,IMAGE_WIDTH,IMAGE_HEIGHT,IMAGE_ALTTEXT) values ('smallstraight','smallstraight','gif',107,24,'resident of antville.org');
insert into AV_IMAGE (IMAGE_ALIAS,IMAGE_FILENAME,IMAGE_FILEEXT,IMAGE_WIDTH,IMAGE_HEIGHT,IMAGE_ALTTEXT) values ('smalltrans','smalltrans','gif',98,30,'resident of antville.org');
insert into AV_IMAGE (IMAGE_ALIAS,IMAGE_FILENAME,IMAGE_FILEEXT,IMAGE_WIDTH,IMAGE_HEIGHT,IMAGE_ALTTEXT) values ('pixel','pixel','gif',1,1,'pixel');
insert into AV_IMAGE (IMAGE_ALIAS,IMAGE_FILENAME,IMAGE_FILEEXT,IMAGE_WIDTH,IMAGE_HEIGHT) values ('headbg','headbg','gif',3,52);
insert into AV_IMAGE (IMAGE_ALIAS,IMAGE_FILENAME,IMAGE_FILEEXT,IMAGE_WIDTH,IMAGE_HEIGHT,IMAGE_ALTTEXT) values ('menu','menu','gif',36,13,'menu');
insert into AV_IMAGE (IMAGE_ALIAS,IMAGE_FILENAME,IMAGE_FILEEXT,IMAGE_WIDTH,IMAGE_HEIGHT,IMAGE_ALTTEXT) values ('recent','recent','gif',123,13,'recently modified');
insert into AV_IMAGE (IMAGE_ALIAS,IMAGE_FILENAME,IMAGE_FILEEXT,IMAGE_WIDTH,IMAGE_HEIGHT,IMAGE_ALTTEXT) values ('status','status','gif',48,13,'status');
insert into AV_IMAGE (IMAGE_ALIAS,IMAGE_FILENAME,IMAGE_FILEEXT,IMAGE_WIDTH,IMAGE_HEIGHT,IMAGE_ALTTEXT) values ('dot','dot','gif',30,30,'dots');
insert into AV_IMAGE (IMAGE_ALIAS,IMAGE_FILENAME,IMAGE_FILEEXT,IMAGE_WIDTH,IMAGE_HEIGHT,IMAGE_ALTTEXT) values ('bullet','bullet','gif',3,10,'bullet');
insert into AV_IMAGE (IMAGE_ALIAS,IMAGE_FILENAME,IMAGE_FILEEXT,IMAGE_WIDTH,IMAGE_HEIGHT,IMAGE_ALTTEXT) values ('webloghead','webloghead','gif',404,53,'head');
insert into AV_IMAGE (IMAGE_ALIAS,IMAGE_FILENAME,IMAGE_FILEEXT,IMAGE_WIDTH,IMAGE_HEIGHT,IMAGE_ALTTEXT) values ('hop','hop','gif',124,25,'helma object publisher');
insert into AV_IMAGE (IMAGE_ALIAS,IMAGE_FILENAME,IMAGE_FILEEXT,IMAGE_WIDTH,IMAGE_HEIGHT,IMAGE_ALTTEXT) values ('xmlbutton','xmlbutton','gif',36,14,'xml version of this page');
insert into AV_IMAGE (IMAGE_ALIAS,IMAGE_FILENAME,IMAGE_FILEEXT,IMAGE_WIDTH,IMAGE_HEIGHT,IMAGE_ALTTEXT) values ('marquee','marquee','gif',15,15,'marquee');
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

#----------------------------
# Table structure for AV_SKIN
#----------------------------
create table AV_SKIN (
   SKIN_ID mediumint(10) not null,
   SKIN_F_SITE mediumint(10),
   SKIN_PROTOTYPE tinytext,
   SKIN_NAME tinytext,
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

CREATE INDEX IDX_SKIN_MIXED ON AV_SKIN (SKIN_F_SITE,SKIN_PROTOTYPE(10),SKIN_NAME(10));

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
   TEXT_TITLE mediumtext,
   TEXT_TEXT mediumtext,
   TEXT_CONTENT mediumtext,
   TEXT_RAWCONTENT mediumtext,
   TEXT_ISONLINE tinyint(1),
   TEXT_EDITABLEBY tinyint(1),
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
   SITE_TAGLINE tinytext,
   SITE_EMAIL tinytext,
   SITE_BGCOLOR varchar(6),
   SITE_TEXTFONT tinytext,
   SITE_TEXTCOLOR varchar(6),
   SITE_TEXTSIZE varchar(4),
   SITE_LINKCOLOR varchar(6),
   SITE_ALINKCOLOR varchar(6),
   SITE_VLINKCOLOR varchar(6),
   SITE_TITLEFONT tinytext,
   SITE_TITLECOLOR varchar(6),
   SITE_TITLESIZE varchar(4),
   SITE_SMALLFONT tinytext,
   SITE_SMALLCOLOR varchar(6),
   SITE_SMALLSIZE varchar(4),
   SITE_ISONLINE tinyint(1),
   SITE_ISBLOCKED tinyint(1),
   SITE_ISTRUSTED tinyint(1),
   SITE_LASTUPDATE datetime,
   SITE_LASTOFFLINE datetime,
   SITE_LASTBLOCKWARN datetime,
   SITE_LASTDELWARN datetime,
   SITE_LASTPING datetime,
   SITE_ENABLEPING tinyint(1),
   SITE_HASDISCUSSIONS tinyint(1),
   SITE_USERMAYCONTRIB tinyint(1),
   SITE_SHOWDAYS tinyint(4),
   SITE_SHOWARCHIVE tinyint(1),
   SITE_LANGUAGE varchar(2),
   SITE_COUNTRY varchar(2),
   SITE_TIMEZONE varchar(32),
   SITE_LONGDATEFORMAT varchar(50),
   SITE_SHORTDATEFORMAT varchar(50),
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

#----------------------------
# Table structure for AV_SHORTCUT
#----------------------------

create table AV_SHORTCUT (
  SHORTCUT_ID mediumint(9) not null,
  SHORTCUT_F_SITE mediumint(9) null,
  SHORTCUT_F_USER_CREATOR mediumint(9) null,
  SHORTCUT_TITLE varchar(255) null,
  SHORTCUT_CONTENT mediumtext null,
  SHORTCUT_CREATETIME datetime null,
  SHORTCUT_MODIFYTIME datetime null,
  primary key (SHORTCUT_ID)
);

#----------------------------
# Indexes on table AV_SHORTCUT
#----------------------------

CREATE INDEX IDX_SHORTCUT_SITE ON AV_SHORTCUT (SHORTCUT_F_SITE);
CREATE INDEX IDX_SHORTCUT_CREATOR ON AV_SHORTCUT (SHORTCUT_F_USER_CREATOR);
CREATE INDEX IDX_SHORTCUT_TITLE ON AV_SHORTCUT (SHORTCUT_TITLE);
