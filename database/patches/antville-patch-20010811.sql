use antville;
alter table image
 add column  PARENT_ID mediumint(9) null after WEBLOG_ID,
 add column  THUMBNAIL_ID mediumint(9) null after PARENT_ID

