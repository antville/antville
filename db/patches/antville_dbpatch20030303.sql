alter table AV_IMAGE change column IMAGE_ID IMAGE_ID mediumint(9) not null auto_increment;
insert into AV_IMAGE (IMAGE_ALIAS,IMAGE_FILENAME,IMAGE_FILEEXT,IMAGE_WIDTH,IMAGE_HEIGHT,IMAGE_ALTTEXT) 
   values ('manage','manage','gif',50,13,'manage');
alter table AV_IMAGE change column IMAGE_ID IMAGE_ID mediumint(9) not null;
