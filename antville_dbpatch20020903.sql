use antville;

alter table AV_POLL add column POLL_F_USER_MODIFIER mediumint(10) null after POLL_F_USER_CREATOR;