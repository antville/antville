/**
 * constants specifying user-rights
 */

MAY_ADD_STORY = 1;
MAY_VIEW_ANYSTORY = 2;
MAY_EDIT_ANYSTORY = 4;
MAY_DELETE_ANYSTORY = 8;
MAY_ADD_COMMENT = 16;
MAY_EDIT_ANYCOMMENT = 32;
MAY_DELETE_ANYCOMMENT = 64;
MAY_ADD_IMAGE = 128;
MAY_EDIT_ANYIMAGE = 256;
MAY_DELETE_ANYIMAGE = 512;
MAY_ADD_FILE = 1024;
MAY_EDIT_ANYFILE = 2048;
MAY_DELETE_ANYFILE= 4096;
MAY_VIEW_STATS = 8192;
MAY_EDIT_PREFS = 16384;
MAY_EDIT_SKINS = 32768;
MAY_EDIT_MEMBERS = 65536;

/**
 * constant containing integer representing permission of subscribers
 */
SUBSCRIBER = 0;

/**
 * constant containing integer representing permission of contributors
 */
CONTRIBUTOR = SUBSCRIBER | MAY_ADD_STORY | MAY_ADD_COMMENT | 
              MAY_ADD_IMAGE | MAY_ADD_FILE | 
              MAY_VIEW_STATS;

/**
 * constant containing integer representing permission of content manager
 */
CONTENTMANAGER = CONTRIBUTOR | MAY_VIEW_ANYSTORY | MAY_EDIT_ANYSTORY |
                 MAY_DELETE_ANYSTORY | MAY_EDIT_ANYCOMMENT |
                 MAY_DELETE_ANYCOMMENT | MAY_EDIT_ANYIMAGE |
                 MAY_DELETE_ANYIMAGE | MAY_EDIT_ANYFILE | 
                 MAY_DELETE_ANYFILE;

/**
 * constant containing integer representing permission of admins
 */
ADMIN = CONTENTMANAGER | MAY_EDIT_PREFS | MAY_EDIT_SKINS | MAY_EDIT_MEMBERS;

ROLES = new Array();
ROLES[0] = [SUBSCRIBER, "Subscriber"];
ROLES[1] = [CONTRIBUTOR, "Contributor"];
ROLES[2] = [CONTENTMANAGER, "Content manager"];
ROLES[3] = [ADMIN, "Admin"];

/**
 * named array containing the display-names of
 * path-objects which is used by linkedpath_macro()
 */

DISPLAY = new Array();
DISPLAY["root"] = "Root";
DISPLAY["site"] = "Home";
DISPLAY["topicmgr"] = "Topics";
DISPLAY["storymgr"] = "Stories";
DISPLAY["filemgr"] = "Files";
DISPLAY["imagemgr"] = "Images";
DISPLAY["membermgr"] = "Members";
DISPLAY["sysmgr"] = "System Management";
DISPLAY["pollmgr"] = "Polls";
DISPLAY["skinmgr"] = "Skins";
DISPLAY["story"] = "Story";

/**
 * array containing short dateformats
 */

SHORTDATEFORMATS = new Array();
SHORTDATEFORMATS[SHORTDATEFORMATS.length] = "yyyy.MM.dd, HH:mm";
SHORTDATEFORMATS[SHORTDATEFORMATS.length] = "yyyy-MM-dd HH:mm";
SHORTDATEFORMATS[SHORTDATEFORMATS.length] = "yyyy/MM/dd HH:mm";
SHORTDATEFORMATS[SHORTDATEFORMATS.length] = "d. MMMM, HH:mm";
SHORTDATEFORMATS[SHORTDATEFORMATS.length] = "MMMM d, HH:mm";
SHORTDATEFORMATS[SHORTDATEFORMATS.length] = "d. MMM, HH:mm";
SHORTDATEFORMATS[SHORTDATEFORMATS.length] = "MMM d, HH:mm";
SHORTDATEFORMATS[SHORTDATEFORMATS.length] = "EEE, d. MMM, HH:mm";
SHORTDATEFORMATS[SHORTDATEFORMATS.length] = "EEE MMM d, HH:mm";
SHORTDATEFORMATS[SHORTDATEFORMATS.length] = "EEE, HH:mm";
SHORTDATEFORMATS[SHORTDATEFORMATS.length] = "EE, HH:mm";
SHORTDATEFORMATS[SHORTDATEFORMATS.length] = "HH:mm";

LONGDATEFORMATS = new Array();
LONGDATEFORMATS[LONGDATEFORMATS.length] = "EEEE, d. MMMM yyyy, HH:mm";
LONGDATEFORMATS[LONGDATEFORMATS.length] = "EEEE, MMMM dd, yyyy, HH:mm";
LONGDATEFORMATS[LONGDATEFORMATS.length] = "EE, d. MMM. yyyy, HH:mm";
LONGDATEFORMATS[LONGDATEFORMATS.length] = "EE MMM dd, yyyy, HH:mm";
LONGDATEFORMATS[LONGDATEFORMATS.length] = "EE yyyy-MM-dd HH:mm";
LONGDATEFORMATS[LONGDATEFORMATS.length] = "yyyy-MM-dd HH:mm";
LONGDATEFORMATS[LONGDATEFORMATS.length] = "d. MMMM yyyy, HH:mm";
LONGDATEFORMATS[LONGDATEFORMATS.length] = "MMMM d, yyyy, HH:mm";
LONGDATEFORMATS[LONGDATEFORMATS.length] = "d. MMM yyyy, HH:mm";
LONGDATEFORMATS[LONGDATEFORMATS.length] = "MMM d, yyyy, HH:mm";

/**
 * width and height of thumbnail images
 */
THUMBNAILWIDTH = 100;
THUMBNAILHEIGHT = 100;
