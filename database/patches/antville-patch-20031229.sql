use antville;
update AV_TEXT set TEXT_EDITABLEBY = 2 where TEXT_EDITABLEBY = 0;
update AV_TEXT set TEXT_EDITABLEBY = 0 where TEXT_EDITABLEBY is null;

## rename skin prototypes since they're mixed case now
update AV_SKIN set SKIN_PROTOTYPE = "Global" where SKIN_PROTOTYPE = "global";
update AV_SKIN set SKIN_PROTOTYPE = "User" where SKIN_PROTOTYPE = "user";
update AV_SKIN set SKIN_PROTOTYPE = "Root" where SKIN_PROTOTYPE = "root";