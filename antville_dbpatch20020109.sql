use antville;
alter table WEBLOG drop column USERMAYSIGNUP;
alter table MEMBER change column LEVEL LEVEL mediumint(10) null;
update MEMBER set LEVEL = 131071 where LEVEL = 2;
update MEMBER set LEVEL = 9361 where LEVEL = 1;
update STORY set EDITABLEBY = null where EDITABLEBY > 1;