use antville;
alter table AV_SITE add column SITE_DISKUSAGE mediumint(10) null after SITE_PREFERENCES;
alter table AV_IMAGE add column IMAGE_FILESIZE mediumint(10) null after IMAGE_ALTTEXT;
