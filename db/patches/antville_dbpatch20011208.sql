use antville;
alter table WEBLOG
 add column  SMALLFONT tinytext null after TITLESIZE,
 add column  SMALLCOLOR varchar(6) null after SMALLFONT,
 add column  SMALLSIZE varchar(4) null after SMALLCOLOR;

update WEBLOG set SMALLFONT = "Arial,Helvetica,sans-serif", SMALLCOLOR = "999999", SMALLSIZE = "8pt";

alter table WEBLOG
 change column DATEFORMAT LONGDATEFORMAT varchar(50) null,
 add column  SHORTDATEFORMAT varchar(50) null after LONGDATEFORMAT;
 