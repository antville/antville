use antville;

alter table AV_SKINSET
   change column SKINSET_ID LAYOUT_ID mediumint(10) not null default '0',
   change column SKINSET_NAME LAYOUT_TITLE varchar(128) null,
   change column SKINSET_F_SITE LAYOUT_F_SITE mediumint(10) null,
   change column SKINSET_F_SKINSET_PARENT LAYOUT_F_LAYOUT_PARENT mediumint(10) null,
   change column SKINSET_CREATETIME LAYOUT_CREATETIME datetime null,
   change column SKINSET_MODIFYTIME LAYOUT_MODIFYTIME datetime null,
   change column SKINSET_F_USER_CREATOR LAYOUT_F_USER_CREATOR mediumint(10) null,
   change column SKINSET_F_USER_MODIFIER LAYOUT_F_USER_MODIFIER mediumint(10) null,
   change column SKINSET_SHARED LAYOUT_SHARED tinyint(1) null;

alter table AV_SKINSET rename AV_LAYOUT;
alter table AV_LAYOUT add column LAYOUT_ALIAS varchar(128) null after LAYOUT_ID;
alter table AV_LAYOUT add column LAYOUT_PREFERENCES mediumtext null after LAYOUT_F_LAYOUT_PARENT;
alter table AV_LAYOUT add column LAYOUT_DESCRIPTION mediumtext null after LAYOUT_PREFERENCES;
alter table AV_LAYOUT change column LAYOUT_SHARED LAYOUT_SHAREABLE tinyint(1) null;

alter table AV_SKIN change column SKIN_F_SKINSET SKIN_F_LAYOUT mediumint(10) null;
alter table AV_IMAGE add column IMAGE_F_LAYOUT mediumint(10) null after IMAGE_F_SITE;
alter table AV_IMAGE add column IMAGE_PROTOTYPE varchar(20) null after IMAGE_F_IMAGE_THUMB;

# create an initial layout object
alter table AV_LAYOUT change column LAYOUT_ID LAYOUT_ID mediumint(10) not null auto_increment;

insert into AV_LAYOUT (LAYOUT_ALIAS, LAYOUT_TITLE, LAYOUT_PREFERENCES, LAYOUT_DESCRIPTION, LAYOUT_SHAREABLE)
values ('default', 'antville.org', '<?xml version="1.0" encoding="UTF-8"?>\r\n<xmlroot xmlns:hop="http://www.helma.org/docs/guide/features/database">\r\n  <hopobject id="t234" name="HopObject" prototype="HopObject" created="1069430202375" lastModified="1069430202375">\r\n    <smallcolor>666666</smallcolor>\r\n    <textcolor>000000</textcolor>\r\n    <vlinkcolor>ff3300</vlinkcolor>\r\n    <titlecolor>cc0000</titlecolor>\r\n    <smallsize>11px</smallsize>\r\n    <alinkcolor>ff0000</alinkcolor>\r\n    <textsize>13px</textsize>\r\n    <titlesize>15px</titlesize>\r\n    <linkcolor>ff3300</linkcolor>\r\n    <smallfont>Verdana, Arial, Helvetica, sans-serif</smallfont>\r\n    <textfont>Verdana, Helvetica, Arial, sans-serif</textfont>\r\n    <titlefont>Verdana, Helvetica, Arial, sans-serif</titlefont>\r\n    <bgcolor>ffffff</bgcolor>\r\n  </hopobject>\r\n</xmlroot>', 'The layout of antville.org', 1);

alter table AV_LAYOUT change column LAYOUT_ID LAYOUT_ID mediumint(10) not null;

# updata all default images so that they're part of the above created layout
select @layoutID:=LAYOUT_ID from AV_LAYOUT where LAYOUT_ALIAS = 'default' and LAYOUT_F_SITE is null and LAYOUT_F_LAYOUT_PARENT is null;
update AV_IMAGE set IMAGE_F_LAYOUT = @layoutID where IMAGE_F_SITE is null;
update AV_IMAGE set IMAGE_PROTOTYPE = 'image' where IMAGE_F_SITE is not null;
update AV_IMAGE set IMAGE_PROTOTYPE = 'layoutimage' where IMAGE_F_LAYOUT is not null;