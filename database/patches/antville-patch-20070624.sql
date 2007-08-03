update AV_IMAGE add column IMAGE_PARENT_PROTOTYPE mediumint(10) default NULL;

update AV_IMAGE set IMAGE_PARENT_PROTOTYPE = 'Site' where IMAGE_PROTOTYPE = 'Image';
update AV_IMAGE set IMAGE_PARENT_PROTOTYPE = 'Layout' where IMAGE_PROTOTYPE = 'LayoutImage';
update AV_IMAGE set IMAGE_PROTOTYPE = "Image" where IMAGE_PROTOTYPE = "LayoutImage"

update AV_IMAGE add column IMAGE_PARENT varchar(20) default NULL:

update AV_IMAGE set IMAGE_PARENT = IMAGE_F_IMAGE_PARENT, IMAGE_PARENT_PROTOTYPE = "Image" where IMAGE_F_IMAGE_PARENT is not null;
update AV_IMAGE set IMAGE_PARENT = IMAGE_F_SITE where IMAGE_F_SITE is not null and IMAGE_PARENT is null;
update AV_IMAGE set IMAGE_PARENT = IMAGE_F_LAYOUT where IMAGE_F_LAYOUT is not null and IMAGE_PARENT is null;

update AV_IMAGE add column IMAGE_METADATA mediumtext default NULL;

