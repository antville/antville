##
# use the following script if you already have referrer-logentries in
# the table ACCESS and want to keep them
##

use antville;
CREATE TABLE ACCESSNEW select A.ID,A.WEBLOG_ID,A.STORY_ID,A.REFERRER,A.IP,A.URL,A.PATH,A.ACTION,A.BROWSER,A.DATE from ACCESS A, WEBLOG W WHERE SUBSTRING(A.REFERRER,8,length(W.ALIAS)) != W.ALIAS AND A.REFERRER not like 'http://www.antville.org%' AND A.REFERRER not like 'http://antville.org%' AND A.WEBLOG_ID = W.ID;

ALTER TABLE ACCESSNEW ADD PRIMARY KEY (ID);
ALTER TABLE ACCESSNEW CHANGE COLUMN ID ID bigint(20) not null auto_increment;
create index IDX_WEBLOG_ID on ACCESSNEW (WEBLOG_ID);
create index IDX_STORY_ID on ACCESSNEW (STORY_ID);
create index IDX_DATE on ACCESSNEW (DATE);

ALTER TABLE ACCESS RENAME TO ACCESSOLD;
ALTER TABLE ACCESSNEW RENAME TO ACCESS;

#
# if everything worked fine, use the following statement to drop the
# old ACCESS-table:
# DROP TABLE ACCESSOLD;
#