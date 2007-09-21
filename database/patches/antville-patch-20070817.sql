use antville;

##
## Update table av_user
##

## After conversion to Metadata these columns are obsolete
alter table av_user drop column hash;
alter table av_user drop column salt;
alter table av_user drop column user_url;

## Passwords are not stored in the database anymore
alter table av_user drop column user_password;

## Option to display e-mail in public is obsolete
alter table av_user drop column user_email_ispublic;

## User status is now stored in one column
alter table av_user drop column user_isblocked;
alter table av_user drop column user_istrusted;
alter table av_user drop column user_issysadmin;

## Renaming the remaining columns with more legible names
alter table av_user change column user_id id mediumint(10);
alter table av_user change column user_name name varchar(30);
alter table av_user change column user_email email varchar(255);
alter table av_user change column user_registered created datetime;
alter table av_user change column user_lastvisit modified datetime;

alter table av_user rename user;

##
## Update table av_text
##

alter table av_text change column text_content_new metadata mediumtext;

##
## Update table av_site
##

## Drop legacy columns
alter table av_site drop column SITE_BGCOLOR;
alter table av_site drop column SITE_TEXTFONT;
alter table av_site drop column SITE_TEXTCOLOR;
alter table av_site drop column SITE_TEXTSIZE;
alter table av_site drop column SITE_LINKCOLOR;
alter table av_site drop column SITE_ALINKCOLOR;
alter table av_site drop column SITE_VLINKCOLOR;
alter table av_site drop column SITE_TITLEFONT;
alter table av_site drop column SITE_TITLECOLOR;
alter table av_site drop column SITE_TITLESIZE;
alter table av_site drop column SITE_SMALLFONT;
alter table av_site drop column SITE_SMALLCOLOR;
alter table av_site drop column SITE_SMALLSIZE;

## After conversion to Metadata these columns are obsolete
alter table av_site drop column SITE_TAGLINE;
alter table av_site drop column SITE_DISKUSAGE;
alter table av_site drop column SITE_USERMAYCONTRIB;
alter table av_site drop column SITE_HASDISCUSSIONS;
alter table av_site drop column SITE_SHOWDAYS;
alter table av_site drop column SITE_SHOWARCHIVE;
alter table av_site drop column SITE_LANGUAGE;
alter table av_site drop column SITE_COUNTRY;
alter table av_site drop column SITE_TIMEZONE;
alter table av_site drop column SITE_LONGDATEFORMAT;
alter table av_site drop column SITE_SHORTDATEFORMAT;
alter table av_site drop column SITE_PREFERENCES_OLD;
alter table av_site drop column SITE_EMAIL;
alter table av_site drop column SITE_LASTUPDATE;
alter table av_site drop column SITE_LASTOFFLINE;
alter table av_site drop column SITE_LASTBLOCKWARN;
alter table av_site drop column SITE_LASTDELWARN;
alter table av_site drop column SITE_LASTPING;
alter table av_site drop column SITE_ENABLEPING;

## Site mode has moved to new column (now 'online' or 'offline')
alter table av_site drop column site_isonline;

## Site status is now stored in one column
alter table av_site drop column site_isblocked;
alter table av_site drop column site_istrusted;

## Renaming the remaining columns with more legible names
alter table av_site change column site_id id mediumint(10);
alter table av_site change column site_alias name varchar(30);
alter table av_site change column site_f_layout layout_id mediumint(10);
alter table av_site change column site_title title varchar(255);
alter table av_site change column site_f_user_creator creator mediumint(10);
alter table av_site change column site_f_user_modifier modifier mediumint(10);
alter table av_site change column site_createtime created datetime;
alter table av_site change column site_modifytime modified datetime;

alter table av_site rename site;

##
## Update table av_membership
##

alter table av_membership change column membership_id id mediumint(10);
alter table av_membership change column membership_f_site site_id mediumint(10);
alter table av_membership change column membership_name name varchar(30);
alter table av_membership change column membership_level level mediumint(10);
alter table av_membership change column membership_createtime created datetime;
alter table av_membership change column membership_f_user creator_id mediumint(10);
alter table av_membership change column membership_modifytime modified datetime;
alter table av_membership change column membership_f_modifier modifier_id mediumint(10);

alter table av_membership rename membership;

##
## Update table av_accesslog
##

alter table av_accesslog change column accesslog_id id int(11);
alter table av_accesslog change column accesslog_referrer referrer mediumtext;
alter table av_accesslog change column accesslog_ip ip varchar(20);
alter table av_accesslog change column accesslog_date created datetime;
alter table av_accesslog change column accesslog_f_site context_id mediumint(10);

alter table av_accesslog rename log;

## Copy contents of av_syslog to log
insert into log (context_type, context_id, created, creator_id, action) select 'User', user.id, syslog_createtime, syslog_f_user_creator, syslog_entry from user, av_syslog where syslog_object = user.name and syslog_type = 'user';
insert into log (context_type, context_id, created, creator_id, action) select 'Site', site.id, syslog_createtime, syslog_f_user_creator, syslog_entry from site, av_syslog where syslog_object = site.name and (syslog_type = 'site' or syslog_type = 'weblog');
insert into log (context_type, context_id, created, creator_id, action) select 'Root', 1, syslog_createtime, syslog_f_user_creator, 'setup' from av_syslog where syslog_type = 'system';

##
## Update table av_layout
##

alter table av_layout drop column layout_title;
alter table av_layout drop column layout_preferences;
alter table av_layout drop column layout_description;
alter table av_layout drop column layout_isimport;

alter table av_layout change column layout_id id mediumint(10);
alter table av_layout change column layout_alias name varchar(30);
alter table av_layout change column layout_f_site site_id mediumint(10);
alter table av_layout change column layout_f_layout_parent layout_id mediumint(10);
alter table av_layout change column layout_preferences_new metadata mediumtext;
alter table av_layout change column layout_createtime created datetime;
alter table av_layout change column layout_modifytime modified datetime;
alter table av_layout change column layout_f_user_creator creator_id mediumint(10);
alter table av_layout change column layout_f_user_modifier modifier_id mediumint(10);
alter table av_layout change column layout_shareable mode enum('default','shared');

alter table av_layout rename layout;

###
### Update table av_skin
###

alter table av_skin change column skin_id id mediumint(10);
alter table av_skin change column skin_f_layout layout_id mediumint(10);
alter table av_skin change column skin_prototype prototype varchar(30);
alter table av_skin change column skin_name name varchar(30);
alter table av_skin change column skin_f_user_creator creator_id mediumint(10);
alter table av_skin change column skin_f_user_modifier modifier_id mediumint(10);
alter table av_skin change column skin_createtime created datetime;
alter table av_skin change column skin_modifytime modified datetime;

alter table av_skin rename skin;
