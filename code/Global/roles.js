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

ROLES = new Array("Subscriber","Contributor","Content Manager","Admin");

/**
 * function returns an integer indicating contributor-role
 */
CONTRIBUTOR = MAY_ADD_STORY | MAY_ADD_COMMENT | 
              MAY_ADD_IMAGE | MAY_ADD_FILE | 
              MAY_VIEW_STATS;

/**
 * function returns an integer indicating contentmanager-role
 */
CONTENTMANAGER = CONTRIBUTOR | MAY_VIEW_ANYSTORY | MAY_EDIT_ANYSTORY |
                 MAY_DELETE_ANYSTORY | MAY_EDIT_ANYCOMMENT |
                 MAY_DELETE_ANYCOMMENT | MAY_EDIT_ANYIMAGE |
                 MAY_DELETE_ANYIMAGE | MAY_EDIT_ANYFILE | 
                 MAY_DELETE_ANYFILE;

/**
 * function returns an integer indicating admin-role
 */
ADMIN = CONTENTMANAGER | MAY_EDIT_PREFS | MAY_EDIT_SKINS | MAY_EDIT_MEMBERS;

/**
 * function returns the level of the membership in cleartext
 * according to passed level
 */

function getRole(lvl) {
   if (lvl == CONTRIBUTOR)
      return ("Contributor");
   else if (lvl == CONTENTMANAGER)
      return ("Content Manager");
   else if (lvl == ADMIN)
      return ("Admin");
   else
      return ("Subscriber");
}
