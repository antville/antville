create table GOODIE (
  ID mediumint(9) not null,
  WEBLOG_ID mediumint(9),
  ALIAS tinytext,
  MIMETYPE tinytext,
  FILE tinytext,
  FILESIZE mediumint(9),
  DESCRIPTION mediumtext,
  REQUESTCNT mediumint,
  CREATETIME datetime,
  CREATOR mediumint(9),
  MODIFYTIME datetime,
  MODIFIER mediumint(9),
  unique ID(ID));

update STORY set EDITABLEBY = 2 where EDITABLEBY = 3;
