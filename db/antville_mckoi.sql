#------------------------------
# Table structure for AV_ACCESSLOG
#------------------------------
create table AV_ACCESSLOG (
   ACCESSLOG_ID int(10) default UNIQUEKEY('AV_ACCESSLOG') not null,
   ACCESSLOG_F_SITE int(10),
   ACCESSLOG_F_TEXT int(10),
   ACCESSLOG_REFERRER text,
   ACCESSLOG_IP varchar(20),
   ACCESSLOG_BROWSER varchar(255),
   ACCESSLOG_DATE timestamp default DATEOB(),
   primary key (ACCESSLOG_ID)
);

#---------------------------
# Indexes on table AV_ACCESSLOG
#---------------------------

create index IDX_ACCESSLOG_F_SITE on AV_ACCESSLOG (ACCESSLOG_F_SITE);
create index IDX_ACCESSLOG_F_TEXT on AV_ACCESSLOG (ACCESSLOG_F_TEXT);
create index IDX_ACCESSLOG_DATE on AV_ACCESSLOG (ACCESSLOG_DATE);

#----------------------------
# Table structure for AV_CHOICE
#----------------------------

create table AV_CHOICE (
   CHOICE_ID int(10) not null,
   CHOICE_F_POLL int(10),
   CHOICE_TITLE varchar(255),
   CHOICE_CREATETIME timestamp,
   CHOICE_MODIFYTIME timestamp,
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
  FILE_ID int(10) not null,
  FILE_F_SITE int(10),
  FILE_ALIAS varchar(128),
  FILE_MIMETYPE varchar(128),
  FILE_NAME varchar(128),
  FILE_SIZE int(10),
  FILE_DESCRIPTION text,
  FILE_REQUESTCNT int(10),
  FILE_CREATETIME timestamp,
  FILE_F_USER_CREATOR int(10),
  FILE_MODIFYTIME timestamp,
  FILE_F_USER_MODIFIER int(10),
  primary key (FILE_ID)
);

#----------------------------
# Indexes on table AV_FILE
#----------------------------

CREATE INDEX IDX_FILE_F_SITE ON AV_FILE (FILE_F_SITE);
CREATE INDEX IDX_FILE_ALIAS ON AV_FILE (FILE_ALIAS);
CREATE INDEX IDX_FILE_F_USER_CREATOR ON AV_FILE (FILE_F_USER_CREATOR);

#----------------------------
# Table structure for AV_IMAGE
#----------------------------
create table AV_IMAGE (
   IMAGE_ID int(10) not null,
   IMAGE_F_SITE int(10),
   IMAGE_F_LAYOUT int(10),
   IMAGE_F_IMAGE_PARENT int(10),
   IMAGE_F_IMAGE_THUMB int(10),
   IMAGE_PROTOTYPE varchar(20),
   IMAGE_ALIAS varchar(128),
   IMAGE_TOPIC varchar(255),
   IMAGE_FILENAME varchar(128),
   IMAGE_FILEEXT varchar(128),
   IMAGE_WIDTH int(4),
   IMAGE_HEIGHT int(4),
   IMAGE_ALTTEXT varchar(128),
   IMAGE_CREATETIME timestamp,
   IMAGE_F_USER_CREATOR int(10),
   IMAGE_MODIFYTIME timestamp,
   IMAGE_F_USER_MODIFIER int(10),
   primary key (IMAGE_ID)
);

#----------------------------
# Indexes on table AV_IMAGE
#----------------------------

CREATE INDEX IDX_IMAGE_F_SITE ON AV_IMAGE (IMAGE_F_SITE);
CREATE INDEX IDX_IMAGE_F_LAYOUT ON AV_IMAGE (IMAGE_F_LAYOUT);
CREATE INDEX IDX_IMAGE_ALIAS ON AV_IMAGE (IMAGE_ALIAS);
CREATE INDEX IDX_IMAGE_F_IMAGE_PARENT ON AV_IMAGE (IMAGE_F_IMAGE_PARENT);
CREATE INDEX IDX_IMAGE_F_IMAGE_THUMB ON AV_IMAGE (IMAGE_F_IMAGE_THUMB);
CREATE INDEX IDX_IMAGE_F_USER_CREATOR ON AV_IMAGE (IMAGE_F_USER_CREATOR);

#----------------------------
# records for table AV_IMAGE
#----------------------------
insert into AV_IMAGE (IMAGE_ID,IMAGE_F_LAYOUT,IMAGE_ALIAS,IMAGE_FILENAME,IMAGE_FILEEXT,IMAGE_WIDTH,IMAGE_HEIGHT,IMAGE_ALTTEXT) values (1,1,'big','big','gif',404,53,'antville.org');
insert into AV_IMAGE (IMAGE_ID,IMAGE_F_LAYOUT,IMAGE_ALIAS,IMAGE_FILENAME,IMAGE_FILEEXT,IMAGE_WIDTH,IMAGE_HEIGHT) values (2,1,'headbg','headbg','gif',3,52);
insert into AV_IMAGE (IMAGE_ID,IMAGE_F_LAYOUT,IMAGE_ALIAS,IMAGE_FILENAME,IMAGE_FILEEXT,IMAGE_WIDTH,IMAGE_HEIGHT,IMAGE_ALTTEXT) values (3,1,'menu','menu','gif',36,13,'menu');
insert into AV_IMAGE (IMAGE_ID,IMAGE_F_LAYOUT,IMAGE_ALIAS,IMAGE_FILENAME,IMAGE_FILEEXT,IMAGE_WIDTH,IMAGE_HEIGHT,IMAGE_ALTTEXT) values (4,1,'recent','recent','gif',123,13,'recently modified');
insert into AV_IMAGE (IMAGE_ID,IMAGE_F_LAYOUT,IMAGE_ALIAS,IMAGE_FILENAME,IMAGE_FILEEXT,IMAGE_WIDTH,IMAGE_HEIGHT,IMAGE_ALTTEXT) values (5,1,'status','status','gif',48,13,'status');
insert into AV_IMAGE (IMAGE_ID,IMAGE_F_LAYOUT,IMAGE_ALIAS,IMAGE_FILENAME,IMAGE_FILEEXT,IMAGE_WIDTH,IMAGE_HEIGHT,IMAGE_ALTTEXT) values (6,1,'dot','dot','gif',30,30,'dots');
insert into AV_IMAGE (IMAGE_ID,IMAGE_F_LAYOUT,IMAGE_ALIAS,IMAGE_FILENAME,IMAGE_FILEEXT,IMAGE_WIDTH,IMAGE_HEIGHT,IMAGE_ALTTEXT) values (7,1,'bullet','bullet','gif',3,10,'bullet');
insert into AV_IMAGE (IMAGE_ID,IMAGE_F_LAYOUT,IMAGE_ALIAS,IMAGE_FILENAME,IMAGE_FILEEXT,IMAGE_WIDTH,IMAGE_HEIGHT,IMAGE_ALTTEXT) values (8,1,'webloghead','webloghead','gif',404,53,'head');
insert into AV_IMAGE (IMAGE_ID,IMAGE_F_LAYOUT,IMAGE_ALIAS,IMAGE_FILENAME,IMAGE_FILEEXT,IMAGE_WIDTH,IMAGE_HEIGHT,IMAGE_ALTTEXT) values (9,1,'manage','manage','gif',50,13,'manage');

#-------------------------------
# Table structure for AV_MEMBERSHIP
#-------------------------------
create table AV_MEMBERSHIP (
   MEMBERSHIP_ID int(10) not null,
   MEMBERSHIP_F_SITE int(10),
   MEMBERSHIP_F_USER int(10),
   MEMBERSHIP_USERNAME varchar(128),
   MEMBERSHIP_LEVEL int(10),
   MEMBERSHIP_CREATETIME timestamp,
   MEMBERSHIP_MODIFYTIME timestamp,
   MEMBERSHIP_F_USER_MODIFIER int(10),
   primary key (MEMBERSHIP_ID)
);

#----------------------------
# Indexes on table AV_MEMBERSHIP
#----------------------------

CREATE INDEX IDX_MEMBERSHIP_F_SITE ON AV_MEMBERSHIP (MEMBERSHIP_F_SITE);
CREATE INDEX IDX_MEMBERSHIP_F_USER ON AV_MEMBERSHIP (MEMBERSHIP_F_USER);
CREATE INDEX IDX_MEMBERSHIP_USERNAME ON AV_MEMBERSHIP (MEMBERSHIP_USERNAME);
CREATE INDEX IDX_MEMBERSHIP_LEVEL ON AV_MEMBERSHIP (MEMBERSHIP_LEVEL);

#----------------------------
# Table structure for AV_POLL
#----------------------------

create table AV_POLL (
   POLL_ID int(10) not null,
   POLL_F_SITE int(10),
   POLL_TITLE varchar(255),
   POLL_QUESTION text,
   POLL_ISONLINE tinyint(1),
   POLL_CLOSED tinyint(4),
   POLL_CLOSETIME timestamp,
   POLL_CREATETIME timestamp,
   POLL_F_USER_CREATOR int(10),
   POLL_MODIFYTIME timestamp,
   POLL_F_USER_MODIFIER int(10),
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
   LAYOUT_ID int(10) not null,
   LAYOUT_ALIAS varchar(128),
   LAYOUT_TITLE varchar(128),
   LAYOUT_F_SITE int(10),
   LAYOUT_F_LAYOUT_PARENT int(10),
   LAYOUT_PREFERENCES text,
   LAYOUT_DESCRIPTION text,
   LAYOUT_CREATETIME timestamp,
   LAYOUT_MODIFYTIME timestamp,
   LAYOUT_F_USER_CREATOR int(10),
   LAYOUT_F_USER_MODIFIER int(10),
   LAYOUT_SHAREABLE tinyint(1),
   LAYOUT_ISIMPORT tinyint(1),
   primary key (LAYOUT_ID)
);
# create an initial layout object
insert into AV_LAYOUT (LAYOUT_ID, LAYOUT_ALIAS, LAYOUT_TITLE, LAYOUT_PREFERENCES, LAYOUT_DESCRIPTION, LAYOUT_SHAREABLE)
values (1, 'default', 'antville.org', '<?xml version="1.0" encoding="UTF-8"?>\r\n<xmlroot xmlns:hop="http://www.helma.org/docs/guide/features/database">\r\n  <hopobject id="t234" name="HopObject" prototype="HopObject" created="1069430202375" lastModified="1069430202375">\r\n    <smallcolor>959595</smallcolor>\r\n    <textcolor>000000</textcolor>\r\n    <vlinkcolor>ff4040</vlinkcolor>\r\n    <titlecolor>d50000</titlecolor>\r\n    <smallsize>11px</smallsize>\r\n    <alinkcolor>ff4040</alinkcolor>\r\n    <textsize>13px</textsize>\r\n    <titlesize>15px</titlesize>\r\n    <linkcolor>ff4040</linkcolor>\r\n    <smallfont>Verdana, Arial, Helvetica, sans-serif</smallfont>\r\n    <textfont>Verdana, Helvetica, Arial, sans-serif</textfont>\r\n    <titlefont>Verdana, Helvetica, Arial, sans-serif</titlefont>\r\n    <bgcolor>ffffff</bgcolor>\r\n  </hopobject>\r\n</xmlroot>', 'The layout of antville.org', 1);

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
   SKIN_ID int(10) not null,
   SKIN_F_LAYOUT int(10),
   SKIN_PROTOTYPE varchar(128),
   SKIN_NAME varchar(128),
   SKIN_ISCUSTOM tinyint(1),
   SKIN_SOURCE text,
   SKIN_CREATETIME timestamp,
   SKIN_F_USER_CREATOR int(10),
   SKIN_MODIFYTIME timestamp,
   SKIN_F_USER_MODIFIER int(10),
   primary key (SKIN_ID)
);

#----------------------------
# Indexes on table AV_SKIN
#----------------------------

CREATE INDEX IDX_SKIN_F_SITE ON AV_SKIN (SKIN_F_SITE);
CREATE INDEX IDX_SKIN_PROTOTYPE ON AV_SKIN (SKIN_PROTOTYPE);
CREATE INDEX IDX_SKIN_NAME ON AV_SKIN (SKIN_NAME);

#----------------------------
# Table structure for AV_SYSLOG
#----------------------------

create table AV_SYSLOG (
  SYSLOG_ID int(10) not null,
  SYSLOG_TYPE varchar(128) null,
  SYSLOG_OBJECT varchar(128) null,
  SYSLOG_ENTRY text null,
  SYSLOG_CREATETIME timestamp null,
  SYSLOG_F_USER_CREATOR int(10) null,
  primary key (SYSLOG_ID)
);

CREATE INDEX IDX_SYSLOG_TYPE ON AV_SYSLOG (SYSLOG_TYPE);
CREATE INDEX IDX_SYSLOG_OBJECT ON AV_SYSLOG (SYSLOG_OBJECT);

#----------------------------
# Table structure for AV_TEXT
#----------------------------

create table AV_TEXT (
   TEXT_ID int(10) not null,
   TEXT_F_SITE int(10),
   TEXT_DAY varchar(10),
   TEXT_TOPIC varchar(255),
   TEXT_PROTOTYPE varchar(20),
   TEXT_F_TEXT_STORY int(10),
   TEXT_F_TEXT_PARENT int(10),
   TEXT_ALIAS varchar(255),
   TEXT_TITLE text,
   TEXT_TEXT text,
   TEXT_CONTENT text,
   TEXT_RAWCONTENT text,
   TEXT_ISONLINE tinyint(1),
   TEXT_EDITABLEBY tinyint(1),
   TEXT_HASDISCUSSIONS tinyint(1),
   TEXT_CREATETIME timestamp,
   TEXT_F_USER_CREATOR int(10),
   TEXT_MODIFYTIME timestamp,
   TEXT_F_USER_MODIFIER int(10),
   TEXT_READS int(10),
   TEXT_IPADDRESS varchar(20),
   primary key (TEXT_ID)
);

#----------------------------
# Indexes on table AV_TEXT
#----------------------------

CREATE INDEX IDX_TEXT_F_SITE ON AV_TEXT (TEXT_F_SITE);
CREATE INDEX IDX_TEXT_TOPIC ON AV_TEXT (TEXT_TOPIC);
CREATE INDEX IDX_TEXT_DAY ON AV_TEXT (TEXT_DAY);
CREATE INDEX IDX_TEXT_PROTOTYPE ON AV_TEXT (TEXT_PROTOTYPE);
CREATE INDEX IDX_TEXT_F_TEXT_STORY ON AV_TEXT (TEXT_F_TEXT_STORY);
CREATE INDEX IDX_TEXT_F_TEXT_PARENT ON AV_TEXT (TEXT_F_TEXT_PARENT);
CREATE INDEX IDX_TEXT_ISONLINE ON AV_TEXT (TEXT_ISONLINE);
CREATE INDEX IDX_TEXT_F_USER_CREATOR ON AV_TEXT (TEXT_F_USER_CREATOR);

#----------------------------
# Table structure for AV_USER
#----------------------------

create table AV_USER (
   USER_ID int(10) not null,
   USER_NAME varchar(128),
   USER_PASSWORD varchar(128),
   USER_EMAIL varchar(128),
   USER_EMAIL_ISPUBLIC tinyint(1),
   USER_URL varchar(128),
   USER_REGISTERED timestamp,
   USER_LASTVISIT timestamp,
   USER_ISBLOCKED tinyint(1),
   USER_ISTRUSTED tinyint(1),
   USER_ISSYSADMIN tinyint(1),
   primary key (USER_ID)
);

#----------------------------
# Indexes on table AV_USER
#----------------------------

CREATE INDEX IDX_USER_NAME ON AV_USER (USER_NAME);
CREATE INDEX IDX_USER_PASSWORD ON AV_USER (USER_PASSWORD);
CREATE INDEX IDX_USER_ISBLOCKED ON AV_USER (USER_ISBLOCKED);
CREATE INDEX IDX_USER_ISTRUSTED ON AV_USER (USER_ISTRUSTED);
CREATE INDEX IDX_USER_ISSYSADMIN ON AV_USER (USER_ISSYSADMIN);

#----------------------------
# Table structure for AV_VOTE
#----------------------------

create table AV_VOTE (
   VOTE_ID int(10) not null,
   VOTE_F_POLL int(10),
   VOTE_F_USER int(10),
   VOTE_F_CHOICE int(10),
   VOTE_USERNAME varchar(128),
   VOTE_CREATETIME timestamp,
   VOTE_MODIFYTIME timestamp,
   primary key (VOTE_ID)
);

#----------------------------
# Indexes on table AV_VOTE
#----------------------------

CREATE INDEX IDX_VOTE_F_POLL ON AV_VOTE (VOTE_F_POLL);
CREATE INDEX IDX_VOTE_F_USER ON AV_VOTE (VOTE_F_USER);
CREATE INDEX IDX_VOTE_F_CHOICE ON AV_VOTE (VOTE_F_CHOICE);
CREATE INDEX IDX_VOTE_USERNAME ON AV_VOTE (VOTE_USERNAME);

#----------------------------
# Table structure for AV_SITE
#----------------------------
create table AV_SITE (
   SITE_ID int(10) not null,
   SITE_TITLE varchar(128),
   SITE_ALIAS varchar(128),
   SITE_EMAIL varchar(128),
   SITE_F_LAYOUT int(10),
   SITE_ISONLINE tinyint(1),
   SITE_ISBLOCKED tinyint(1),
   SITE_ISTRUSTED tinyint(1),
   SITE_LASTUPDATE timestamp,
   SITE_LASTOFFLINE timestamp,
   SITE_LASTBLOCKWARN timestamp,
   SITE_LASTDELWARN timestamp,
   SITE_LASTPING timestamp,
   SITE_ENABLEPING tinyint(1),
   SITE_PREFERENCES text,
   SITE_CREATETIME timestamp,
   SITE_F_USER_CREATOR int(10),
   SITE_MODIFYTIME timestamp,
   SITE_F_USER_MODIFIER int(10),
   primary key (SITE_ID)
);

#----------------------------
# Indexes on table AV_SITE
#----------------------------

CREATE INDEX IDX_SITE_ALIAS ON AV_SITE (SITE_ALIAS);
CREATE INDEX IDX_SITE_ISONLINE ON AV_SITE (SITE_ISONLINE);
CREATE INDEX IDX_SITE_ISBLOCKED ON AV_SITE (SITE_ISBLOCKED);
CREATE INDEX IDX_SITE_ENABLEPING ON AV_SITE (SITE_ENABLEPING);
CREATE INDEX IDX_SITE_LASTPING ON AV_SITE (SITE_LASTPING);
CREATE INDEX IDX_SITE_F_USER_CREATOR ON AV_SITE (SITE_F_USER_CREATOR);
