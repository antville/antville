use antville;
create table MEMBER (
   ID mediumint(9) not null default '0',
   WEBLOG_ID mediumint(9),
   USER_ID mediumint(9),
   USERNAME tinytext,
   ISADMIN tinyint(1),
   ISCONTRIBUTOR tinyint(1),
   CREATETIME datetime,
   MODIFIER mediumint(9),
   MODIFYTIME datetime,
   unique ID (ID));

insert into MEMBER (ID,WEBLOG_ID,USER_ID,USERNAME,ISADMIN,ISCONTRIBUTOR,CREATETIME)
  select t1.ID,t2.ID, t1.ID, t1.USERNAME, 1, 0, NOW() from USER as t1, WEBLOG as t2 where t2.OWNER_ID = t1.ID;

alter table WEBLOG drop column OWNER_ID;

alter table WEBLOG add column USERMAYCONTRIB tinyint(1) null after HASDISCUSSIONS;

alter table WEBLOG add column USERMAYSIGNUP tinyint(1) null after USERMAYCONTRIB;

alter table USER drop column WEBLOG_ID;