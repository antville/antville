use antville;
update AV_TEXT set TEXT_EDITABLEBY = 2 where TEXT_EDITABLEBY = 0;
update AV_TEXT set TEXT_EDITABLEBY = 0 where TEXT_EDITABLEBY is null;
