use antville;

alter table WEBLOG
add column  TIMEZONE varchar(32) null after COUNTRY;
