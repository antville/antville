use antville;

alter table AV_IMAGE change column IMAGE_ID IMAGE_ID mediumint(10) not null auto_increment;
insert into AV_IMAGE (IMAGE_ALIAS,IMAGE_FILENAME,IMAGE_FILEEXT,IMAGE_WIDTH,IMAGE_HEIGHT,IMAGE_ALTTEXT) values ('marquee','marquee','gif',15,15,'marquee');
alter table AV_IMAGE change column IMAGE_ID IMAGE_ID mediumint(10) not null;
