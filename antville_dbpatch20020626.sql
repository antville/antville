use antville;

#----------------------------
# ACCESS
#----------------------------

alter table ACCESS
change column ID ACCESSLOG_ID mediumint(10) not null auto_increment,
change column WEBLOG_ID ACCESSLOG_F_SITE mediumint(10) null,
change column STORY_ID ACCESSLOG_F_TEXT mediumint(10) null,
change column REFERRER ACCESSLOG_REFERRER text null,
change column IP ACCESSLOG_IP varchar(20) null,
change column BROWSER ACCESSLOG_BROWSER varchar(255) null,
change column `DATE` ACCESSLOG_DATE timestamp null,
drop primary key,
drop index IDX_WEBLOG_ID,
drop index IDX_STORY_ID,
drop index IDX_DATE,
drop index IDX_REFERRER,
add primary key (ACCESSLOG_ID),
add index IDX_ACCESSLOG_F_SITE(ACCESSLOG_F_SITE),
add index IDX_ACCESSLOG_F_TEXT(ACCESSLOG_F_TEXT),
add index IDX_ACCESSLOG_DATE(ACCESSLOG_DATE),
type=MyISAM;
alter table ACCESS rename to AV_ACCESSLOG;


#----------------------------
# CHOICE
#----------------------------

alter table CHOICE
change column ID CHOICE_ID mediumint(10) not null default '0',
change column POLL_ID CHOICE_F_POLL mediumint(10) null,
change column TITLE CHOICE_TITLE varchar(255) null,
change column CREATETIME CHOICE_CREATETIME datetime null,
change column MODIFYTIME CHOICE_MODIFYTIME datetime null,
drop index IDX_POLL_ID,
drop primary key,
add primary key (CHOICE_ID),
add index IDX_CHOICE_F_POLL(CHOICE_F_POLL),
type=MyISAM;
alter table CHOICE rename to AV_CHOICE;


#----------------------------
# GOODIE
#----------------------------

alter table GOODIE
change column ID FILE_ID mediumint(10) not null default '0',
change column WEBLOG_ID FILE_F_SITE mediumint(10) null,
change column ALIAS FILE_ALIAS tinytext null,
change column MIMETYPE FILE_MIMETYPE tinytext null,
change column `FILE` FILE_NAME tinytext null,
change column FILESIZE FILE_SIZE mediumint(10) null,
change column DESCRIPTION FILE_DESCRIPTION mediumtext null,
change column REQUESTCNT FILE_REQUESTCNT mediumint(10) null,
change column CREATETIME FILE_CREATETIME datetime null,
change column CREATOR FILE_F_USER_CREATOR mediumint(10) null,
change column MODIFYTIME FILE_MODIFYTIME datetime null,
change column MODIFIER FILE_F_USER_MODIFIER mediumint(10) null,
drop primary key,
drop index IDX_WEBLOG_ID,
drop index IDX_ALIAS,
drop index IDX_CREATOR,
add primary key (FILE_ID),
add index IDX_FILE_F_SITE(FILE_F_SITE),
add index IDX_FILE_ALIAS(FILE_ALIAS(20)),
add index IDX_FILE_F_USER_CREATOR(FILE_F_USER_CREATOR),
type=MyISAM;
alter table GOODIE rename to AV_FILE;

#----------------------------
# IMAGE
#----------------------------

alter table IMAGE
change column ID IMAGE_ID mediumint(10) not null default '0',
change column WEBLOG_ID IMAGE_F_SITE mediumint(10) null,
change column PARENT_ID IMAGE_F_IMAGE_PARENT mediumint(10) null,
change column THUMBNAIL_ID IMAGE_F_IMAGE_THUMB mediumint(10) null,
change column ALIAS IMAGE_ALIAS tinytext null,
change column FILENAME IMAGE_FILENAME tinytext null,
change column FILEEXT IMAGE_FILEEXT tinytext null,
change column WIDTH IMAGE_WIDTH mediumint(4) null,
change column HEIGHT IMAGE_HEIGHT mediumint(4) null,
change column ALTTEXT IMAGE_ALTTEXT tinytext null,
change column CREATETIME IMAGE_CREATETIME datetime null,
change column CREATOR IMAGE_F_USER_CREATOR mediumint(10) null,
change column MODIFYTIME IMAGE_MODIFYTIME datetime null,
change column MODIFIER IMAGE_F_USER_MODIFIER mediumint(10) null,
drop primary key,
drop index IDX_WEBLOG_ID,
drop index IDX_ALIAS,
drop index IDX_PARENT_ID,
drop index IDX_THUMBNAIL_ID,
drop index IDX_CREATOR,
add primary key (IMAGE_ID),
add index IDX_IMAGE_F_SITE(IMAGE_F_SITE),
add index IDX_IMAGE_ALIAS(IMAGE_ALIAS(20)),
add index IDX_IMAGE_F_IMAGE_PARENT(IMAGE_F_IMAGE_PARENT),
add index IDX_IMAGE_F_IMAGE_THUMB(IMAGE_F_IMAGE_THUMB),
add index IDX_IMAGE_F_USER_CREATOR(IMAGE_F_USER_CREATOR),
type=MyISAM;
alter table IMAGE rename to AV_IMAGE;

#----------------------------
# MEMBER
#----------------------------

alter table MEMBER
change column ID MEMBERSHIP_ID mediumint(10) not null default '0',
change column WEBLOG_ID MEMBERSHIP_F_SITE mediumint(10) null,
change column USER_ID MEMBERSHIP_F_USER mediumint(10) null,
change column USERNAME MEMBERSHIP_USERNAME tinytext null,
change column LEVEL MEMBERSHIP_LEVEL mediumint(10) null,
change column CREATETIME MEMBERSHIP_CREATETIME datetime null,
change column MODIFIER MEMBERSHIP_MODIFYTIME datetime null,
change column MODIFYTIME MEMBERSHIP_F_USER_MODIFIER mediumint(10) null,
drop primary key,
drop index IDX_WEBLOG_ID,
drop index IDX_USER_ID,
drop index IDX_USERNAME,
drop index IDX_LEVEL,
add primary key (MEMBERSHIP_ID),
add index IDX_MEMBERSHIP_F_SITE(MEMBERSHIP_F_SITE),
add index IDX_MEMBERSHIP_F_USER(MEMBERSHIP_F_USER),
add index IDX_MEMBERSHIP_USERNAME(MEMBERSHIP_USERNAME(20)),
add index IDX_MEMBERSHIP_LEVEL(MEMBERSHIP_LEVEL),
type=MyISAM;
alter table MEMBER rename to AV_MEMBERSHIP;


#----------------------------
# POLL
#----------------------------

alter table POLL
change column ID POLL_ID mediumint(10) not null default '0',
change column WEBLOG_ID POLL_F_SITE mediumint(10) null,
change column USER_ID POLL_TITLE varchar(255) null,
change column TITLE POLL_QUESTION mediumtext null,
change column QUESTION POLL_CLOSED tinyint(4) null,
change column ISONLINE POLL_CLOSETIME datetime null,
change column CLOSED POLL_CREATETIME datetime null,
change column CLOSETIME POLL_F_USER_CREATOR mediumint(10) null,
change column CREATETIME POLL_MODIFYTIME datetime null,
change column MODIFYTIME POLL_F_USER_MODIFIER mediumint(10) null,
drop primary key,
drop index IDX_WEBLOG_ID,
drop index IDX_USER_ID,
add primary key (POLL_ID),
add index IDX_POLL_F_SITE(POLL_F_SITE),
add index IDX_POLL_F_USER_CREATOR(POLL_F_USER_CREATOR),
type=MyISAM;
alter table POLL rename to AV_POLL;

#----------------------------
# SKIN
#----------------------------

alter table SKIN
add column  SKIN_F_USER_MODIFIER mediumint(10) null after SKIN_MODIFYTIME,
change column ID SKIN_ID mediumint(10) not null default '0',
change column WEBLOG_ID SKIN_F_SITE mediumint(10) null,
change column PROTO SKIN_PROTOTYPE tinytext null,
change column NAME SKIN_NAME tinytext null,
change column SOURCE SKIN_SOURCE mediumtext null,
change column CREATOR SKIN_CREATETIME datetime null,
change column CREATETIME SKIN_F_USER_CREATOR mediumint(10) null,
change column MODIFYTIME SKIN_MODIFYTIME datetime null,
drop primary key,
drop index IDX_WEBLOG_ID,
drop index IDX_PROTO,
drop index IDX_NAME,
add primary key (SKIN_ID),
add index IDX_SKIN_F_SITE(SKIN_F_SITE),
add index IDX_SKIN_PROTOTYPE(SKIN_PROTOTYPE(10)),
add index IDX_SKIN_NAME(SKIN_NAME(20)),
type=MyISAM;
alter table SKIN rename to AV_SKIN;
update AV_SKIN set SKIN_PROTOTYPE = "site" where SKIN_PROTOTYPE = "weblog";
update AV_SKIN set SKIN_PROTOTYPE = "file" where SKIN_PROTOTYPE = "goodie";
update AV_SKIN set SKIN_PROTOTYPE = "membermgr" where SKIN_PROTOTYPE = "membership";
update AV_SKIN set SKIN_PROTOTYPE = "membership" where SKIN_PROTOTYPE = "member";

#----------------------------
# SYSLOG
#----------------------------

alter table SYSLOG
change column ID SYSLOG_ID mediumint(10) not null default '0',
change column `TYPE` SYSLOG_TYPE tinytext null,
change column OBJECT SYSLOG_OBJECT tinytext null,
change column LOGENTRY SYSLOG_ENTRY mediumtext null,
change column SYSADMIN_ID SYSLOG_CREATETIME datetime null,
change column CREATETIME SYSLOG_F_USER_CREATOR mediumint(10) null,
drop primary key,
add primary key (SYSLOG_ID),
add index IDX_SYSLOG_TYPE(SYSLOG_TYPE(10)),
add index IDX_SYSLOG_OBJECT(SYSLOG_OBJECT(10)),
type=MyISAM;
alter table SYSLOG rename to AV_SYSLOG;


#----------------------------
# TEXT
#----------------------------

alter table `TEXT`
add column TEXT_CONTENT mediumtext null after TEXT_TEXT,
add column TEXT_RAWCONTENT mediumtext null after TEXT_CONTENT,
add column TEXT_HASDISCUSSIONS tinyint(1) null after TEXT_EDITABLEBY,
change column ID TEXT_ID mediumint(10) not null default '0',
change column WEBLOG_ID TEXT_F_SITE mediumint(10) null,
change column `DAY` TEXT_DAY varchar(10) null,
change column TOPIC TEXT_TOPIC varchar(255) null,
change column PROTOTYPE TEXT_PROTOTYPE varchar(20) null,
change column STORY_ID TEXT_F_TEXT_STORY mediumint(10) null,
change column PARENT_ID TEXT_F_TEXT_PARENT mediumint(10) null,
change column TITLE TEXT_TITLE mediumtext null,
change column `TEXT` TEXT_TEXT mediumtext null,
change column ISONLINE TEXT_ISONLINE tinyint(1) null,
change column EDITABLEBY TEXT_EDITABLEBY tinyint(1) null,
change column AUTHOR TEXT_CREATETIME datetime null,
change column CREATETIME TEXT_F_USER_CREATOR mediumint(10) null,
change column MODIFYTIME TEXT_MODIFYTIME datetime null,
change column MODIFIER TEXT_F_USER_MODIFIER mediumint(10) null,
change column READS TEXT_READS mediumint(10) null,
change column IPADDRESS TEXT_IPADDRESS varchar(20) null,
drop primary key,
drop index IDX_WEBLOG_ID,
drop index IDX_TOPIC,
drop index IDX_DAY,
drop index IDX_PROTOTYPE,
drop index IDX_STORY_ID,
drop index IDX_PARENT_ID,
drop index IDX_ISONLINE,
drop index IDX_CREATOR,
add primary key (TEXT_ID),
add index IDX_TEXT_F_SITE(TEXT_F_SITE),
add index IDX_TEXT_TOPIC(TEXT_TOPIC),
add index IDX_TEXT_DAY(TEXT_DAY),
add index IDX_TEXT_PROTOTYPE(TEXT_PROTOTYPE),
add index IDX_TEXT_F_TEXT_STORY(TEXT_F_TEXT_STORY),
add index IDX_TEXT_F_TEXT_PARENT(TEXT_F_TEXT_PARENT),
add index IDX_TEXT_ISONLINE(TEXT_ISONLINE),
add index IDX_TEXT_F_USER_CREATOR(TEXT_F_USER_CREATOR),
type=MyISAM;
alter table `TEXT` rename to AV_TEXT;

#----------------------------
# USER
#----------------------------

alter table `USER`
drop column DESCRIPTION,
change column ID USER_ID mediumint(10) not null default '0',
change column USERNAME USER_NAME tinytext null,
change column `PASSWORD` USER_PASSWORD tinytext null,
change column EMAIL USER_EMAIL tinytext null,
change column URL USER_URL tinytext null,
change column REGISTERED USER_REGISTERED datetime null,
change column LASTVISIT USER_LASTVISIT datetime null,
change column ISBLOCKED USER_ISBLOCKED tinyint(1) null,
change column ISTRUSTED USER_ISTRUSTED tinyint(1) null,
change column ISSYSADMIN USER_ISSYSADMIN tinyint(1) null,
drop primary key,
drop index IDX_USERNAME,
drop index IDX_PASSWORD,
drop index IDX_ISBLOCKED,
drop index IDX_ISTRUSTED,
drop index IDX_ISSYSADMIN,
add primary key (USER_ID),
add index IDX_USER_NAME(USER_NAME(20)),
add index IDX_USER_PASSWORD(USER_PASSWORD(20)),
add index IDX_USER_ISBLOCKED(USER_ISBLOCKED),
add index IDX_USER_ISTRUSTED(USER_ISTRUSTED),
add index IDX_USER_ISSYSADMIN(USER_ISSYSADMIN),
type=MyISAM;
alter table `USER` rename to AV_USER;

#----------------------------
# VOTE
#----------------------------

alter table VOTE
change column ID VOTE_ID mediumint(10) not null default '0',
change column POLL_ID VOTE_F_POLL mediumint(10) null,
change column USER_ID VOTE_F_USER mediumint(10) null,
change column CHOICE_ID VOTE_F_CHOICE mediumint(10) null,
change column USERNAME VOTE_USERNAME tinytext null,
change column CREATETIME VOTE_CREATETIME datetime null,
change column MODIFYTIME VOTE_MODIFYTIME datetime null,
drop primary key,
drop index IDX_POLL_ID,
drop index IDX_USER_ID,
drop index IDX_CHOICE_ID,
add primary key (VOTE_ID),
add index IDX_VOTE_F_POLL(VOTE_F_POLL),
add index IDX_VOTE_F_USER(VOTE_F_USER),
add index IDX_VOTE_F_CHOICE(VOTE_F_CHOICE),
add index IDX_VOTE_USERNAME(VOTE_USERNAME(20)),
type=MyISAM;
alter table VOTE rename to AV_VOTE;


#----------------------------
# WEBLOG
#----------------------------

alter table WEBLOG
drop column BIRTHDATE,
change column ID SITE_ID mediumint(10) not null default '0',
change column TITLE SITE_TITLE tinytext null,
change column ALIAS SITE_ALIAS tinytext null,
change column TAGLINE SITE_TAGLINE tinytext null,
change column EMAIL SITE_EMAIL tinytext null,
change column BGCOLOR SITE_BGCOLOR varchar(6) null,
change column TEXTFONT SITE_TEXTFONT tinytext null,
change column TEXTCOLOR SITE_TEXTCOLOR varchar(6) null,
change column TEXTSIZE SITE_TEXTSIZE varchar(4) null,
change column LINKCOLOR SITE_LINKCOLOR varchar(6) null,
change column ALINKCOLOR SITE_ALINKCOLOR varchar(6) null,
change column VLINKCOLOR SITE_VLINKCOLOR varchar(6) null,
change column TITLEFONT SITE_TITLEFONT tinytext null,
change column TITLECOLOR SITE_TITLECOLOR varchar(6) null,
change column TITLESIZE SITE_TITLESIZE varchar(4) null,
change column SMALLFONT SITE_SMALLFONT tinytext null,
change column SMALLCOLOR SITE_SMALLCOLOR varchar(6) null,
change column SMALLSIZE SITE_SMALLSIZE varchar(4) null,
change column ISONLINE SITE_ISONLINE tinyint(1) null,
change column ISBLOCKED SITE_ISBLOCKED tinyint(1) null,
change column ISTRUSTED SITE_ISTRUSTED tinyint(1) null,
change column LASTUPDATE SITE_LASTUPDATE datetime null,
change column LASTOFFLINE SITE_LASTOFFLINE datetime null,
change column LASTBLOCKWARN SITE_LASTBLOCKWARN datetime null,
change column LASTDELWARN SITE_LASTDELWARN datetime null,
change column LASTPING SITE_LASTPING datetime null,
change column ENABLEPING SITE_ENABLEPING tinyint(1) null,
change column HASDISCUSSIONS SITE_HASDISCUSSIONS tinyint(1) null,
change column USERMAYCONTRIB SITE_USERMAYCONTRIB tinyint(1) null,
change column SHOWDAYS SITE_SHOWDAYS tinyint(4) null,
change column SHOWARCHIVE SITE_SHOWARCHIVE tinyint(1) null,
change column LANGUAGE SITE_LANGUAGE char(2) null,
change column COUNTRY SITE_COUNTRY char(2) null,
change column TIMEZONE SITE_TIMEZONE varchar(32) null,
change column LONGDATEFORMAT SITE_LONGDATEFORMAT varchar(50) null,
change column SHORTDATEFORMAT SITE_SHORTDATEFORMAT varchar(50) null,
change column CREATETIME SITE_CREATETIME datetime null,
change column CREATOR SITE_F_USER_CREATOR mediumint(10) null,
change column MODIFYTIME SITE_MODIFYTIME datetime null,
change column MODIFIER SITE_F_USER_MODIFIER mediumint(10) null,
drop primary key,
drop index IDX_ALIAS,
drop index IDX_ISONLINE,
drop index IDX_CREATOR,
add primary key (SITE_ID),
add index IDX_SITE_ALIAS(SITE_ALIAS(20)),
add index IDX_SITE_ISONLINE(SITE_ISONLINE),
add index IDX_SITE_ISBLOCKED(SITE_ISBLOCKED),
add index IDX_SITE_ENABLEPING(SITE_ENABLEPING),
add index IDX_SITE_LASTPING(SITE_LASTPING),
add index IDX_SITE_F_USER_CREATOR(SITE_F_USER_CREATOR),
type=MyISAM;
alter table WEBLOG rename to AV_SITE;