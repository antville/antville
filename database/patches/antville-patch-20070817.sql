use antville;

## After conversion to Metadata these columns are obsolete
alter table av_user drop column hash;
alter table av_user drop column salt;
alter table av_user drop column user_url;

## Passwords are not stored in the database anymore
alter table av_user drop column user_password;

## Option to display e-mail in public is obsolete
alter table av_user drop column user_email_ispublic;

## Site-wide user status is now stored in one column
alter table av_user drop column user_isblocked;
alter table av_user drop column user_istrusted;
alter table av_user drop column user_issysadmin;

## Renaming the remaining columns with more legible names
alter table av_user change column user_id id mediumint(10);
alter table av_user change column user_name name varchar(255);
alter table av_user change column user_email email varchar(255);
alter table av_user change column user_registered created datetime;
alter table av_user change column user_lastvisit modified datetime;
