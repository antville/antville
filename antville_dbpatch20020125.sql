use antville;

create table choice (
   ID bigint(20) not null,
   POLL_ID bigint(20),
   TITLE mediumtext,
   CREATETIME datetime,
   MODIFYTIME datetime,
   unique ID (ID));

create table poll (
   ID bigint(20) not null,
   WEBLOG_ID bigint(20),
   USER_ID bigint(20),
   TITLE mediumtext,
   QUESTION mediumtext,
   ISONLINE tinyint(1),
   CLOSED tinyint(4),
   CLOSETIME datetime,
   CREATETIME datetime,
   MODIFYTIME datetime,
   unique ID (ID));

create table vote (
   ID bigint(20) not null,
   POLL_ID bigint(20),
   USER_ID bigint(20),
   CHOICE_ID bigint(20),
   USERNAME tinytext,
   CREATETIME datetime,
   MODIFYTIME datetime,
   unique ID (ID));
