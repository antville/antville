/**
 * constructor-function
 */
function constructor() {
   this.searchSites();
   this.searchUsers();
   this.searchSyslog();
}

/**
 * function manipulates the sites-collection
 */

function searchSites(show, sort, order, keywords) {
   // construct the sql-clause for manual subnodeRelation
   var sql = "";
   if (show == "1")
      sql += "WHERE SITE_ISONLINE=1 AND SITE_ISBLOCKED=0 ";
   else if (show == "2")
      sql += "WHERE SITE_ISONLINE=0 AND SITE_ISBLOCKED=0 ";
   else if (show == "3")
      sql += "WHERE SITE_ISBLOCKED=1 ";
   else if (show == "4")
      sql += "WHERE SITE_ISTRUSTED=1 ";
   if (keywords) {
      // additional keywords are given, so we're using them
      var kArray = stripTags(keywords).split(" ");
      for (var i in kArray) {
         var k = kArray[i];
         sql += sql.length > 0 ? "AND " : "WHERE ";
         sql += "(SITE_ALIAS LIKE '%" + k + "%' OR SITE_TITLE LIKE '%" + k + "%' OR SITE_TAGLINE LIKE '%" + k + "%') ";
      }
   }
   if (!sort || sort == "0")
      sql += "ORDER BY SITE_LASTUPDATE ";
   else if (sort == "1")
      sql += "ORDER BY SITE_CREATETIME ";
   else if (sort == "2")
      sql += "ORDER BY SITE_ALIAS ";
   else if (sort == "3")
      sql += "ORDER BY SITE_TITLE ";
   if (!order || order == "0")
      sql += "desc ";
   else if (order == "1")
      sql += "asc ";

   // now do the actual search with a manual subnodeRelation
   this.sites.subnodeRelation = sql;
   return;
}

/**
 * function manipulates the users-collection
 */

function searchUsers(show, sort, order, keywords) {
   // construct the sql-clause for manual subnodeRelation
   var sql = "";
   if (show == "1")
      sql += "WHERE USER_ISBLOCKED=1 ";
   else if (show == "2")
      sql += "WHERE USER_ISTRUSTED=1 ";
   else if (show == "3")
      sql += "WHERE USER_ISSYSADMIN=1 ";
   if (keywords) {
      // additional keywords are given, so we're using them
      if (keywords.charAt(0) == "@") {
         // searching for email-addresses
         sql += sql.length > 0 ? "AND " : "WHERE ";
         sql += "USER_EMAIL LIKE '%" + keywords + "%' ";
      } else {
         // doing normal keyword-search
         var kArray = stripTags(keywords).split(" ");
         for (var i in kArray) {
            var k = kArray[i];
            sql += sql.length > 0 ? "AND " : "WHERE ";
            sql += "USER_NAME LIKE '%" + k + "%' ";
         }
      }
   }
   if (!sort || sort == "0")
      sql += "ORDER BY USER_LASTVISIT ";
   else if (sort == "1")
      sql += "ORDER BY USER_REGISTERED ";
   else if (sort == "2")
      sql += "ORDER BY USER_NAME ";
   if (!order || order == "0")
      sql += "desc ";
   else if (order == "1")
      sql += "asc ";

   // now do the actual search with a manual subnodeRelation
   this.users.subnodeRelation = sql;
   return;
}

/**
 * function manipulates the syslogs-collection
 */

function searchSyslog(show, order, keywords) {
   // construct the sql-clause for manual subnodeRelation
   var sql = "";
   if (show == "1")
      sql += "WHERE SYSLOG_TYPE = 'site' ";
   else if (show == "2")
      sql += "WHERE SYSLOG_TYPE = 'user' ";
   else if (show == "3")
      sql += "WHERE SYSLOG_TYPE = 'system' ";
   if (keywords) {
      // additional keywords are given, so we're using them
      var kArray = stripTags(keywords).split(" ");
      for (var i in kArray) {
         var k = kArray[i];
         sql += sql.length > 0 ? "AND " : "WHERE ";
         sql += "(SYSLOG_OBJECT LIKE '%" + k + "%' OR SYSLOG_ENTRY LIKE '%" + k + "%') ";
      }
   }
   if (!order || order == "0")
      sql += "ORDER BY SYSLOG_CREATETIME desc, SYSLOG_ID desc ";
   else if (order == "1")
      sql += "ORDER BY SYSLOG_CREATETIME asc, SYSLOG_ID asc ";

   // now do the actual search with a manual subnodeRelation
   this.syslogs.subnodeRelation = sql;
   return;
}

/**
 * function stores updated site-preferences
 */

function updateSite(param, admin) {
   var site = this.sites.get(param.item);
   if (!site)
      throw new Exception("siteEditMissing");
   var trust = parseInt(param.trusted, 10);
   var block = parseInt(param.blocked, 10);
   if (trust > site.trusted)
      this.syslogs.add(new syslog("site", site.alias, "granted trust", admin));
   else if (trust < site.trusted)
      this.syslogs.add(new syslog("site", site.alias, "revoked trust", admin));
   if (block > site.blocked)
      this.syslogs.add(new syslog("site", site.alias, "blocked site", admin));
   else if (block < site.blocked)
      this.syslogs.add(new syslog("site", site.alias, "unblocked site", admin));
   site.trusted = trust;
   site.blocked = block;
   return new Message("update");
}

/**
 * function stores updated user
 */

function updateUser(param, admin) {
   var u = this.users.get(param.item);
   if (!u)
      throw new Exception("userEditMissing");
   if (u == admin)
      throw new Exception("accountModifyOwn");
   // check if this is an attempt to remove the last sysadmin
   var sysadmin = parseInt(param.sysadmin, 10);
   var trust = parseInt(param.trusted, 10);
   var block = parseInt(param.blocked, 10);
   if (u.sysadmin && this.sysadmins.size() == 1)
      throw new Exception("adminDeleteLast");
   else {
      //logging
      if (sysadmin > u.sysadmin)
         this.syslogs.add(new syslog("user", u.name, "granted sysadmin-rights", admin));
      else if (sysadmin < u.sysadmin)
         this.syslogs.add(new syslog("user", u.name, "revoked sysadmin-rights", admin));
      u.sysadmin = sysadmin;
   }
   if (trust > u.trusted)
      this.syslogs.add(new syslog("user", u.name, "granted trust", admin));
   else if (trust < u.trusted)
      this.syslogs.add(new syslog("user", u.name, "revoked trust", admin));
   if (block > u.blocked)
      this.syslogs.add(new syslog("user", u.name, "blocked user", admin));
   else if (block < u.blocked)
      this.syslogs.add(new syslog("user", u.name, "unblocked user", admin));
   u.trusted = trust;
   u.blocked = block;
   return new Message("update");
}


/**
 * function checks if the system parameters are correct
 */

function evalSystemSetup(param, admin) {
   root.sys_title = param.sys_title;
   root.sys_url = evalURL(param.sys_url);
   if (param.sys_frontSite) {
      var s = root.get(param.sys_frontSite);
      if (!s)
         throw new Exception("systemFrontsiteMissing");
      root.sys_frontSite = s;
   } else
      root.sys_frontSite = null;
   // check system email
   if (!param.sys_email)
      throw new Exception("systemEmailMissing");
   evalEmail(param.sys_email);
   root.sys_email = param.sys_email;
   // e-mail notification
   root.sys_allowEmails = param.sys_allowEmails;
   // store selected locale in this.language and this.country
   if (param.locale) {
      var loc = param.locale.split("_");
      root.sys_language = loc[0];
      root.sys_country = loc.length == 2 ? loc[1] : null;
      root.cache.locale = null;
   }
   root.sys_timezone = param.timezone;
   root.cache.timezone = null;
   // long dateformat
   root.longdateformat = param.longdateformat ? param.longdateformat : null;
   // short dateformat
   root.shortdateformat = param.shortdateformat ? param.shortdateformat : null;
   // allow file
   root.sys_allowFiles = param.sys_allowFiles ? true : false;
   // limiting site-creation
   root.sys_limitNewSites = param.sys_limitNewSites ? parseInt(param.sys_limitNewSites, 10) : null;
   root.sys_minMemberAge = param.sys_minMemberAge ? parseInt(param.sys_minMemberAge, 10) : null;
   root.sys_minMemberSince = param.sys_minMemberSince ? param.sys_minMemberSince.toDate("yyyy-MM-dd HH:mm", root.getTimeZone()) : null;
   root.sys_waitAfterNewSite = param.sys_waitAfterNewSite ? parseInt(param.sys_waitAfterNewSite, 10) : null;
   // auto-cleanup
   root.sys_enableAutoCleanup = param.sys_enableAutoCleanup ? true : false;
   root.sys_startAtHour = parseInt(param.sys_startAtHour, 10);
   // auto-block
   root.sys_blockPrivateSites = param.sys_blockPrivateSites ? true : false;
   root.sys_blockWarningAfter = param.sys_blockWarningAfter ? parseInt(param.sys_blockWarningAfter, 10) : null;
   root.sys_blockAfterWarning = param.sys_blockAfterWarning ? parseInt(param.sys_blockAfterWarning, 10) : null;
   // auto-removal
   root.sys_deleteInactiveSites = param.sys_deleteInactiveSites ? true : false;
   root.sys_deleteWarningAfter = param.sys_deleteWarningAfter ? parseInt(param.sys_deleteWarningAfter, 10) : null;
   root.sys_deleteAfterWarning = param.sys_deleteAfterWarning ? parseInt(param.sys_deleteAfterWarning, 10) : null;
   // add a new entry in system-log
   this.syslogs.add(new syslog("system", null, "changed system setup", session.user));
   // everything fine, so we assign true to root.sys_issetup
   root.sys_issetup = true;
   return new Message("systemUpdate");
}