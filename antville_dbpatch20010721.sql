use antville;

alter table MEMBER add column LEVEL tinyint(1) null after USERNAME;

update MEMBER set LEVEL = 0 where ISADMIN = 0 and ISCONTRIBUTOR = 0;
update MEMBER set LEVEL = 1 where ISADMIN = 0 and ISCONTRIBUTOR = 1;
update MEMBER set LEVEL = 2 where ISADMIN = 1 and ISCONTRIBUTOR = 0;

alter table STORY
 add column  EDITABLEBY tinyint(1) null after ISONLINE;

alter table STORY
 add column  MODIFIER mediumint(9) null after MODIFYTIME;

update STORY set EDITABLEBY = 3;
update STORY set MODIFIER = AUTHOR where MODIFIER is null;