alter table IMAGE change column ID ID mediumint(9) not null auto_increment;

insert into IMAGE (ALIAS,FILENAME,FILEEXT,WIDTH,HEIGHT,ALTTEXT) 
   values ('big','big','gif',404,53,'antville.org');

insert into IMAGE (ALIAS,FILENAME,FILEEXT,WIDTH,HEIGHT,ALTTEXT) 
   values ('smallanim','smallanim','gif',98,30,'resident of antville.org');

insert into IMAGE (ALIAS,FILENAME,FILEEXT,WIDTH,HEIGHT,ALTTEXT) 
   values ('smallchaos','smallchaos','gif',107,29,'resident of antville.org');

insert into IMAGE (ALIAS,FILENAME,FILEEXT,WIDTH,HEIGHT,ALTTEXT) 
   values ('smallstraight','smallstraight','gif',107,24,'resident of antville.org');

insert into IMAGE (ALIAS,FILENAME,FILEEXT,WIDTH,HEIGHT,ALTTEXT) 
   values ('smalltrans','smalltrans','gif',98,30,'resident of antville.org');

insert into IMAGE (ALIAS,FILENAME,FILEEXT,WIDTH,HEIGHT,ALTTEXT) 
   values ('pixel','pixel','gif',1,1,'pixel');

insert into IMAGE (ALIAS,FILENAME,FILEEXT,WIDTH,HEIGHT) 
   values ('headbg','headbg','gif',3,52);

insert into IMAGE (ALIAS,FILENAME,FILEEXT,WIDTH,HEIGHT,ALTTEXT) 
   values ('menu','menu','gif',36,13,'menu');

insert into IMAGE (ALIAS,FILENAME,FILEEXT,WIDTH,HEIGHT,ALTTEXT) 
   values ('recent','recent','gif',123,13,'recently modified');

insert into IMAGE (ALIAS,FILENAME,FILEEXT,WIDTH,HEIGHT,ALTTEXT) 
   values ('status','status','gif',48,13,'status');

insert into IMAGE (ALIAS,FILENAME,FILEEXT,WIDTH,HEIGHT,ALTTEXT) 
   values ('dot','dot','gif',30,30,'dots');

insert into IMAGE (ALIAS,FILENAME,FILEEXT,WIDTH,HEIGHT,ALTTEXT) 
   values ('bullet','bullet','gif',3,10,'bullet');

insert into IMAGE (ALIAS,FILENAME,FILEEXT,WIDTH,HEIGHT,ALTTEXT) 
   values ('webloghead','webloghead','gif',404,53,'head');

alter table IMAGE change column ID ID mediumint(9) not null;