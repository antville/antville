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
MAY_ADD_GOODIE = 1024;
MAY_EDIT_ANYGOODIE = 2048;
MAY_DELETE_ANYGOODIE = 4096;
MAY_VIEW_STATS = 8192;
MAY_EDIT_PREFS = 16384;
MAY_EDIT_SKINS = 32768;
MAY_EDIT_MEMBERS = 65536;

ROLES = new Array("Subscriber","Contributor","Content Manager","Admin");

/**
 * function returns an integer indicating user-role
 */

function getUserLvl() {
   var lvl = 0;
   lvl |= MAY_ADD_COMMENT;
   return (lvl);
}

/**
 * function returns an integer indicating contributor-role
 */

function getContributorLvl() {
   var lvl = getUserLvl();
   lvl |= MAY_ADD_STORY;
   lvl |= MAY_ADD_IMAGE;
   lvl |= MAY_ADD_GOODIE;
   lvl |= MAY_VIEW_STATS;
   return (lvl);
}

/**
 * function returns an integer indicating contentmanager-role
 */

function getContentManagerLvl() {
   var lvl = getContributorLvl();
   lvl |= MAY_VIEW_ANYSTORY;
   lvl |= MAY_EDIT_ANYSTORY;
   lvl |= MAY_DELETE_ANYSTORY;
   lvl |= MAY_EDIT_ANYCOMMENT;
   lvl |= MAY_DELETE_ANYCOMMENT;
   lvl |= MAY_EDIT_ANYIMAGE;
   lvl |= MAY_DELETE_ANYIMAGE;
   lvl |= MAY_EDIT_ANYGOODIE;
   lvl |= MAY_DELETE_ANYGOODIE;
   return (lvl);
}

/**
 * function returns an integer indicating admin-role
 */

function getAdminLvl() {
   var lvl = getContentManagerLvl();
   lvl |= MAY_EDIT_PREFS;
   lvl |= MAY_EDIT_SKINS;
   lvl |= MAY_EDIT_MEMBERS;
   return (lvl);
}

/**
 * function returns true if passed level matches
 * the level of contributors
 */

function isContributor(lvl) {
   if (lvl == getContributorLvl())
      return true;
   return false;
}

/**
 * function returns true if passed level matches
 * the level of content managers
 */

function isContentManager(lvl) {
   if (lvl == getContentManagerLvl())
      return true;
   return false;
}

/**
 * function returns true if passed level matches
 * the level of admins
 */

function isAdmin(lvl) {
   if (lvl == getAdminLvl())
      return true;
   return false;
}

/**
 * function returns the level of the membership in cleartext
 * according to passed level
 */

function getRole(lvl) {
   if (lvl == getContributorLvl())
      return ("Contributor");
   else if (lvl == getContentManagerLvl())
      return ("Content Manager");
   else if (lvl == getAdminLvl())
      return ("Admin");
   else
      return ("Subscriber");
}