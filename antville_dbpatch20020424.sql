use antville;

alter table ACCESS
change column REFERRER REFERRER text null, 
change column IP IP varchar(20) null, 
change column URL URL text null, 
change column PATH PATH varchar(255) null, 
change column `ACTION` `ACTION` varchar(50) null, 
change column BROWSER BROWSER varchar(255) null;

add column STORY_ID bigint(20) not null after WEBLOG_ID;
