use antville;

create table AV_SHORTCUT (
  SHORTCUT_ID mediumint(9) not null,
  SHORTCUT_F_SITE mediumint(9) null,
  SHORTCUT_F_USER_CREATOR mediumint(9) null,
  SHORTCUT_TITLE varchar(255) null,
  SHORTCUT_CONTENT mediumtext null,
  SHORTCUT_CREATETIME datetime null,
  SHORTCUT_MODIFYTIME datetime null,
  primary key (SHORTCUT_ID)
);
