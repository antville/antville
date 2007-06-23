use antville;

alter table WEBLOG
   add column LASTPING datetime;

create table ACCESS (
   ID bigint(20) not null auto_increment,
   WEBLOG_ID bigint(20) not null default '0',
   REFERRER mediumtext,
   IP mediumtext,
   URL mediumtext,
   PATH mediumtext,
   `ACTION` mediumtext,
   BROWSER mediumtext,
   `DATE` datetime,
   unique ID (ID)
);
