alter table WEBLOG add column LASTOFFLINE datetime null after LASTUPDATE;
alter table WEBLOG add column LASTBLOCKWARN datetime null after LASTOFFLINE;
alter table WEBLOG add column LASTDELWARN datetime null after LASTBLOCKWARN;
alter table WEBLOG add column ISTRUSTED tinyint(1) null after ISBLOCKED;
alter table USER add column ISTRUSTED tinyint(1) null after ISBLOCKED;
alter table USER add column ISSYSADMIN tinyint(1) null after ISTRUSTED;

create table SYSLOG
(
  ID mediumint(9) not null,
  TYPE tinytext null,
  OBJECT tinytext null,
  LOGENTRY mediumtext null,
  SYSADMIN_ID mediumint(9) null,
  CREATETIME datetime null,
  primary key (ID)
)

# set LASTOFFLINE-Timestamp of weblogs
update WEBLOG set LASTOFFLINE = LASTUPDATE where ISONLINE = 0 AND LASTUPDATE is not null AND LASTOFFLINE is null;
update WEBLOG set LASTOFFLINE = CREATETIME where ISONLINE = 0 AND LASTOFFLINE is null;