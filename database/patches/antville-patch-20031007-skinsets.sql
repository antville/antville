use antville;

#------------------------------
# Table structure for AV_SKINSET
#------------------------------
create table AV_SKINSET (
   SKINSET_ID mediumint(10) not null,
   SKINSET_NAME varchar(128),
   SKINSET_F_SITE mediumint(10),
   SKINSET_F_SKINSET_PARENT mediumint(10),
   SKINSET_CREATETIME datetime,
   SKINSET_MODIFYTIME datetime,
   SKINSET_F_USER_CREATOR mediumint(10),
   SKINSET_F_USER_MODIFIER mediumint(10),
   SKINSET_SHARED tinyint(1),
   primary key (SKINSET_ID)
);

# Create a skinset for each existing site with the same primary key
insert into AV_SKINSET (
  SKINSET_ID, 
  SKINSET_NAME, 
  SKINSET_F_SITE, 
  SKINSET_F_SKINSET_PARENT, 
  SKINSET_CREATETIME, 
  SKINSET_MODIFYTIME, 
  SKINSET_F_USER_CREATOR, 
  SKINSET_F_USER_MODIFIER,
  SKINSET_SHARED) 
select 
  SITE_ID, 
  SITE_TITLE, 
  SITE_ID, 
  null, 
  NOW(), 
  null, 
  SITE_F_USER_CREATOR, 
  null,
  0
from AV_SITE;

# Alter skin table site reference to skinset
alter table AV_SKIN 
   change column SKIN_F_SITE 
   SKIN_F_SKINSET mediumint(10);

# that all, folks

