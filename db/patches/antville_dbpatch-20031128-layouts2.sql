use antville;

alter table AV_SITE add column SITE_F_LAYOUT mediumint(10) null after SITE_EMAIL;
alter table AV_LAYOUT add column LAYOUT_ISIMPORT tinyint(1) null after LAYOUT_SHAREABLE;
alter table AV_SKIN add column SKIN_ISCUSTOM tinyint(1) null after SKIN_NAME;

update AV_SKIN set SKIN_ISCUSTOM = 0;

update AV_SKIN set SKIN_NAME = "mgrlistitem" where SKIN_PROTOTYPE = "file" and SKIN_NAME = "preview";
update AV_SKIN set SKIN_NAME = "mgrlistitem" where SKIN_PROTOTYPE = "image" and SKIN_NAME = "preview";
update AV_SKIN set SKIN_NAME = "mgrlistitem" where SKIN_PROTOTYPE = "poll" and SKIN_NAME = "listitem";
update AV_SKIN set SKIN_NAME = "mgrlistitem" where SKIN_PROTOTYPE = "layout" and SKIN_NAME = "listitem";
update AV_SKIN set SKIN_NAME = "mgrlistitem" where SKIN_PROTOTYPE = "story" and SKIN_NAME = "listitem";
update AV_SKIN set SKIN_NAME = "mgrlistitem" where SKIN_PROTOTYPE = "membership" and SKIN_NAME = "preview";
update AV_SKIN set SKIN_NAME = "mailregconfirm" where SKIN_PROTOTYPE = "membermgr" and SKIN_NAME = "mailbody";
update AV_SKIN set SKIN_NAME = "mailpassword" where SKIN_PROTOTYPE = "membermgr" and SKIN_NAME = "pwdmail";
update AV_SKIN set SKIN_NAME = "mailstatuschange" where SKIN_PROTOTYPE = "membership" and SKIN_NAME = "mailbody";

