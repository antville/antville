#----------------------------
# Table structure for IMAGE
#----------------------------
create table IMAGE (
   ID int(9) not null primary key,
   WEBLOG_ID int(9),
   PARENT_ID int(9),
   THUMBNAIL_ID int(9),
   ALIAS varchar(128),
   FILENAME varchar(128),
   FILEEXT varchar(128),
   WIDTH int(9),
   HEIGHT int(9),
   ALTTEXT varchar(128),
   CREATETIME datetime,
   CREATOR int(9),
   MODIFYTIME datetime,
   MODIFIER int(9)
   );

#----------------------------
# records for table IMAGE
#----------------------------

alter table IMAGE change column ID ID int(9) not null primary key auto_increment;
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
alter table IMAGE change column ID ID int(9) not null primary key;

#----------------------------
# Table structure for SKIN
#----------------------------
create table SKIN (
   ID int(9) not null primary key,
   WEBLOG_ID int(9),
   PROTO varchar(128),
   NAME varchar(128),
   SOURCE longvarchar,
   CREATOR int(9),
   CREATETIME datetime,
   MODIFYTIME datetime
   );

#----------------------------
# No records for table SKIN
#----------------------------

#----------------------------
# Table structure for USER
#----------------------------
create table USER (
   ID int(9) not null primary key,
   USERNAME varchar(128),
   PASSWORD varchar(128),
   EMAIL varchar(128),
   DESCRIPTION longvarchar,
   URL varchar(128),
   REGISTERED datetime,
   LASTVISIT datetime,
   ISBLOCKED tinyint(1),
   ISTRUSTED tinyint(1),
   ISSYSADMIN tinyint(1)
   );

#----------------------------
# No records for table USER
#----------------------------

#----------------------------
# Table structure for WEBLOG
#----------------------------
create table WEBLOG (
   ID int(9) not null primary key,
   TITLE varchar(128),
   ALIAS varchar(128),
   TAGLINE varchar(128),
   BIRTHDATE datetime,
   EMAIL varchar(128),
   BGCOLOR varchar(6),
   TEXTFONT varchar(128),
   TEXTCOLOR varchar(6),
   TEXTSIZE varchar(4),
   LINKCOLOR varchar(6),
   ALINKCOLOR varchar(6),
   VLINKCOLOR varchar(6),
   TITLEFONT varchar(128),
   TITLECOLOR varchar(6),
   TITLESIZE varchar(4),
   SMALLFONT varchar(128),
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
   CREATOR int(9),
   MODIFYTIME datetime,
   MODIFIER int(9)
   );

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
   USERNAME varchar(128),
   LEVEL int(10),
   CREATETIME datetime,
   MODIFIER int(9),
   MODIFYTIME datetime
   );

#----------------------------
# No records for table MEMBER
#----------------------------

#----------------------------
# Table structure for GOODIE
#----------------------------
create table GOODIE (
  ID int(9) not null primary key,
  WEBLOG_ID int(9),
  ALIAS varchar(128),
  MIMETYPE varchar(128),
  FILE varchar(128),
  FILESIZE int(9),
  DESCRIPTION longvarchar,
  REQUESTCNT int(9),
  CREATETIME datetime,
  CREATOR int(9),
  MODIFYTIME datetime,
  MODIFIER int(9));

#----------------------------
# No records for table GOODIE
#----------------------------

#----------------------------
# Table structure for ACCESS
#----------------------------

create table ACCESS (
   ID bigint(20) not null primary key,
   WEBLOG_ID bigint(20),
   STORY_ID bigint(20),
   REFERRER longvarchar,
   IP varchar(20),
   URL longvarchar,
   PATH varchar(255),
   ACTION varchar(50),
   BROWSER varchar(255),
   DATE datetime
);

#----------------------------
# Table structure for TEXT
#----------------------------

create table TEXT (
   ID int(9) not null primary key,
   WEBLOG_ID int(9),
   DAY varchar(10),
   TOPIC varchar(128),
   PROTOTYPE varchar(20),
   STORY_ID int(9),
   PARENT_ID int(9),
   TITLE longvarchar,
   TEXT longvarchar,
   ISONLINE tinyint(1),
   EDITABLEBY tinyint(1),
   AUTHOR int(9),
   CREATETIME datetime,
   MODIFYTIME datetime,
   MODIFIER int(9),
   READS bigint,
   IPADDRESS varchar(20)
);

#----------------------------
# Table structure for POLL
#----------------------------

create table POLL (
   ID bigint(20) not null primary key,
   WEBLOG_ID bigint(20),
   USER_ID bigint(20),
   TITLE varchar(255),
   QUESTION longvarchar,
   ISONLINE tinyint(1),
   CLOSED tinyint(4),
   CLOSETIME datetime,
   CREATETIME datetime,
   MODIFYTIME datetime
);

#----------------------------
# Table structure for CHOICE
#----------------------------

create table CHOICE (
   ID bigint(20) not null primary key,
   POLL_ID bigint(20),
   TITLE varchar(255),
   CREATETIME datetime,
   MODIFYTIME datetime
);

#----------------------------
# Table structure for VOTE
#----------------------------

create table VOTE (
   ID bigint(20) not null primary key,
   POLL_ID bigint(20),
   USER_ID bigint(20),
   CHOICE_ID bigint(20),
   USERNAME varchar(128),
   CREATETIME datetime,
   MODIFYTIME datetime
);

#----------------------------
# Table structure for SYSLOG
#----------------------------

create table SYSLOG (
  ID int(9) not null primary key,
  TYPE varchar(128) null,
  OBJECT varchar(128) null,
  LOGENTRY longvarchar null,
  SYSADMIN_ID int(9) null,
  CREATETIME datetime null
);
