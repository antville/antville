use antville ;
alter table WEBLOG
 add column  LANGUAGE varchar2(2) null after SHOWARCHIVE
, add column  COUNTRY varchar2(2) null after SHOWARCHIVE