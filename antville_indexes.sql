use antville;

#-----------------------------
# Indexes for ACCESS
#-----------------------------

create index IDX_WEBLOG_ID on ACCESS (WEBLOG_ID);
create index IDX_STORY_ID on ACCESS (STORY_ID);
create index IDX_DATE on ACCESS (DATE);
create index IDX_REFERRER on ACCESS (REFERRER(30));

#-----------------------------
# Indexes for WEBLOG
#-----------------------------

CREATE INDEX IDX_ALIAS ON WEBLOG (ALIAS(50));

#-----------------------------
# Indexes for GOODIE
#-----------------------------

CREATE INDEX IDX_WEBLOG_ID ON GOODIE (WEBLOG_ID);
CREATE INDEX IDX_ALIAS ON GOODIE (ALIAS(50));

#-----------------------------
# Indexes for IMAGE
#-----------------------------

CREATE INDEX IDX_WEBLOG_ID ON IMAGE (WEBLOG_ID);
CREATE INDEX IDX_ALIAS ON IMAGE (ALIAS(50));
CREATE INDEX IDX_PARENT_ID ON IMAGE (PARENT_ID);
CREATE INDEX IDX_THUMBNAIL_ID ON IMAGE (THUMBNAIL_ID);

#-----------------------------
# Indexes for TEXT
#-----------------------------

CREATE INDEX IDX_WEBLOG_ID ON TEXT (WEBLOG_ID);
CREATE INDEX IDX_TOPIC ON TEXT (TOPIC);
CREATE INDEX IDX_DAY ON TEXT (DAY);
CREATE INDEX IDX_PROTOTYPE ON TEXT (PROTOTYPE);
CREATE INDEX IDX_STORY_ID ON TEXT (STORY_ID);
CREATE INDEX IDX_PARENT_ID ON TEXT (PARENT_ID);
CREATE INDEX IDX_ISONLINE ON TEXT (ISONLINE);

#-----------------------------
# Indexes for MEMBER
#-----------------------------

CREATE INDEX IDX_WEBLOG_ID ON MEMBER (WEBLOG_ID);
CREATE INDEX IDX_USER_ID ON MEMBER (USER_ID);
CREATE INDEX IDX_USERNAME ON MEMBER (USERNAME(30));

#-----------------------------
# Indexes for SKIN
#-----------------------------

CREATE INDEX IDX_WEBLOG_ID ON SKIN (WEBLOG_ID);
CREATE INDEX IDX_PROTO ON SKIN (PROTO(10));
CREATE INDEX IDX_NAME ON SKIN (NAME(30));

#-----------------------------
# Indexes for USER
#-----------------------------

CREATE INDEX IDX_USERNAME ON USER (USERNAME(30));
CREATE INDEX IDX_PASSWORD ON USER (PASSWORD(30));
