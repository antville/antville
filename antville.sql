CREATE DATABASE IF NOT EXISTS antville;
USE antville;
GRANT SELECT,INSERT,UPDATE,DELETE ON antville.* TO antville@localhost IDENTIFIED BY 'antville';

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
   primary key (ID)
};

#----------------------------
# Indexes on table IMAGE
#----------------------------

CREATE INDEX IDX_WEBLOG_ID ON IMAGE (WEBLOG_ID);
CREATE INDEX IDX_ALIAS ON IMAGE (ALIAS(50));
CREATE INDEX IDX_PARENT_ID ON IMAGE (PARENT_ID);
CREATE INDEX IDX_THUMBNAIL_ID ON IMAGE (THUMBNAIL_ID);
CREATE INDEX IDX_CREATOR ON IMAGE (CREATOR);

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
insert into IMAGE (ALIAS,FILENAME,FILEEXT,WIDTH,HEIGHT,ALTTEXT) values ('xmlbutton','xmlbutton','gif',36,14,'xml version of this page');
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
   primary key (ID)
);

#----------------------------
# Indexes on table SKIN
#----------------------------

CREATE INDEX IDX_WEBLOG_ID ON SKIN (WEBLOG_ID);
CREATE INDEX IDX_PROTO ON SKIN (PROTO(10));
CREATE INDEX IDX_NAME ON SKIN (NAME(30));

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
   ISTRUSTED tinyint(1),
   ISSYSADMIN tinyint(1),
   primary key (ID)
);

#----------------------------
# Indexes on table USER
#----------------------------

CREATE INDEX IDX_USERNAME ON USER (USERNAME(30));
CREATE INDEX IDX_PASSWORD ON USER (PASSWORD(30));
CREATE INDEX IDX_ISBLOCKED ON USER (ISBLOCKED);
CREATE INDEX IDX_ISTRUSTED ON USER (ISTRUSTED);
CREATE INDEX IDX_ISSYSADMIN ON USER (ISSYSADMIN);

#----------------------------
# Table structure for WEBLOG
#----------------------------
create table WEBLOG (
   ID mediumint(9) not null,
   TITLE tinytext,
   ALIAS tinytext,
   TAGLINE tinytext,
   BIRTHDATE datetime,
   EMAIL tinytext,
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
   SMALLFONT tinytext,
   SMALLCOLOR varchar(6),
   SMALLSIZE varchar(4),
   ISONLINE tinyint(1),
   ISBLOCKED tinyint(1),
   ISTRUSTED tinyint(1),
   LASTUPDATE datetime,
   LASTOFFLINE datetime,
   LASTBLOCKWARN datetime,
   LASTDELWARN datetime,
   LASTPING datetime,
   ENABLEPING tinyint(1),
   HASDISCUSSIONS tinyint(1),
   USERMAYCONTRIB tinyint(1),
   SHOWDAYS tinyint(4),
   SHOWARCHIVE tinyint(1),
   LANGUAGE varchar(2),
   COUNTRY varchar(2),
   LONGDATEFORMAT varchar(50),
   SHORTDATEFORMAT varchar(50),
   CREATETIME datetime,
   CREATOR mediumint(9),
   MODIFYTIME datetime,
   MODIFIER mediumint(9),
   primary key (ID)
);

#----------------------------
# Indexes on table WEBLOG
#----------------------------

CREATE INDEX IDX_ALIAS ON WEBLOG (ALIAS(50));
CREATE INDEX IDX_ISONLINE ON WEBLOG (ISONLINE);
CREATE INDEX IDX_CREATOR ON WEBLOG (CREATOR);

#----------------------------
# Table structure for MEMBER
#----------------------------
create table MEMBER (
   ID mediumint(9) not null,
   WEBLOG_ID mediumint(9),
   USER_ID mediumint(9),
   USERNAME tinytext,
   LEVEL mediumint(10),
   CREATETIME datetime,
   MODIFIER mediumint(9),
   MODIFYTIME datetime,
   primary key (ID)
);

#----------------------------
# Indexes on table MEMBER
#----------------------------

CREATE INDEX IDX_WEBLOG_ID ON MEMBER (WEBLOG_ID);
CREATE INDEX IDX_USER_ID ON MEMBER (USER_ID);
CREATE INDEX IDX_USERNAME ON MEMBER (USERNAME(30));
CREATE INDEX IDX_LEVEL ON MEMBER (LEVEL);

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
  primary key (ID)
);

#----------------------------
# Indexes on table GOODIE
#----------------------------

CREATE INDEX IDX_WEBLOG_ID ON GOODIE (WEBLOG_ID);
CREATE INDEX IDX_ALIAS ON GOODIE (ALIAS(50));
CREATE INDEX IDX_CREATOR ON GOODIE (CREATOR);

#----------------------------
# Table structure for ACCESS
#----------------------------

create table ACCESS (
   ID mediumint(9) not null auto_increment,
   WEBLOG_ID mediumint(9),
   STORY_ID mediumint(9),
   REFERRER text,
   IP varchar(20),
   BROWSER varchar(255),
   `DATE` datetime,
   primary key (ID)
);

#---------------------------
# Indexes on table ACCESS
#---------------------------

create index IDX_WEBLOG_ID on ACCESS (WEBLOG_ID);
create index IDX_STORY_ID on ACCESS (STORY_ID);
create index IDX_DATE on ACCESS (DATE);
create index IDX_REFERRER on ACCESS (REFERRER(30));

#----------------------------
# Table structure for TEXT
#----------------------------

create table TEXT (
   ID mediumint(9) not null,
   WEBLOG_ID mediumint(9),
   DAY varchar(10),
   TOPIC varchar(128),
   PROTOTYPE varchar(20),
   STORY_ID mediumint(9),
   PARENT_ID mediumint(9),
   TITLE mediumtext,
   TEXT mediumtext,
   ISONLINE tinyint(1),
   EDITABLEBY tinyint(1),
   AUTHOR mediumint(9),
   CREATETIME datetime,
   MODIFYTIME datetime,
   MODIFIER mediumint(9),
   READS mediumint(9),
   IPADDRESS varchar(20),
   primary key (ID)
);

#----------------------------
# Indexes on table TEXT
#----------------------------

CREATE INDEX IDX_WEBLOG_ID ON TEXT (WEBLOG_ID);
CREATE INDEX IDX_TOPIC ON TEXT (TOPIC);
CREATE INDEX IDX_DAY ON TEXT (DAY);
CREATE INDEX IDX_PROTOTYPE ON TEXT (PROTOTYPE);
CREATE INDEX IDX_STORY_ID ON TEXT (STORY_ID);
CREATE INDEX IDX_PARENT_ID ON TEXT (PARENT_ID);
CREATE INDEX IDX_ISONLINE ON TEXT (ISONLINE);
CREATE INDEX IDX_CREATOR ON TEXT (AUTHOR);

#----------------------------
# Table structure for POLL
#----------------------------

create table POLL (
   ID mediumint(9) not null,
   WEBLOG_ID mediumint(9),
   USER_ID mediumint(9),
   TITLE varchar(255),
   QUESTION mediumtext,
   ISONLINE tinyint(1),
   CLOSED tinyint(4),
   CLOSETIME datetime,
   CREATETIME datetime,
   MODIFYTIME datetime,
   primary key (ID)
);

#----------------------------
# Indexes on table POLL
#----------------------------

CREATE INDEX IDX_WEBLOG_ID ON POLL (WEBLOG_ID);
CREATE INDEX IDX_USER_ID ON POLL (USER_ID);

#----------------------------
# Table structure for CHOICE
#----------------------------

create table CHOICE (
   ID mediumint(9) not null,
   POLL_ID mediumint(9),
   TITLE varchar(255),
   CREATETIME datetime,
   MODIFYTIME datetime,
   primary key (ID)
);

#----------------------------
# Indexes on table CHOICE
#----------------------------

CREATE INDEX IDX_POLL_ID ON CHOICE (POLL_ID);

#----------------------------
# Table structure for VOTE
#----------------------------

create table VOTE (
   ID mediumint(9) not null,
   POLL_ID mediumint(9),
   USER_ID mediumint(9),
   CHOICE_ID mediumint(9),
   USERNAME tinytext,
   CREATETIME datetime,
   MODIFYTIME datetime,
   primary key (ID)
);

#----------------------------
# Indexes on table VOTE
#----------------------------

CREATE INDEX IDX_POLL_ID ON VOTE (POLL_ID);
CREATE INDEX IDX_USER_ID ON VOTE (USER_ID);
CREATE INDEX IDX_CHOICE_ID ON VOTE (CHOICE_ID);

#----------------------------
# Table structure for SYSLOG
#----------------------------

create table SYSLOG (
  ID mediumint(9) not null,
  TYPE tinytext null,
  OBJECT tinytext null,
  LOGENTRY mediumtext null,
  SYSADMIN_ID mediumint(9) null,
  CREATETIME datetime null,
  primary key (ID)
);