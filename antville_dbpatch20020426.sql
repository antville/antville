use antville;

alter table WEBLOG
add column  LASTPING datetime null after LASTDELWARN,
add column  ENABLEPING tinyint(1) null after LASTPING;

alter table ACCESS
drop column URL,
drop column PATH,
drop column `ACTION`;
