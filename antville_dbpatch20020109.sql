use antville;
alter table WEBLOG drop column USERMAYSIGNUP;
update MEMBER set LEVEL = 3 where LEVEL = 2;