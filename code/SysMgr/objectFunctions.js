/**
 * function manipulates the sites-collection
 */

function searchSites(show,sort,order,keywords) {
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
      var kArray = keywords.split(" ");
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

function searchUsers(show,sort,order,keywords) {
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
         var kArray = keywords.split(" ");
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

function searchSyslog(show,order,keywords) {
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
      var kArray = keywords.split(" ");
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

function updateSite(param,admin) {
   var result;
   var site = this.sites.get(param.item);
   if (!site)
      result = getError("siteEditMissing");
   else {
      var trust = parseInt(param.trusted,10);
      var block = parseInt(param.blocked,10);
      if (trust > site.trusted)
         this.syslogs.add(new syslog("site",site.alias,"granted trust",admin));
      else if (trust < site.trusted)
         this.syslogs.add(new syslog("site",site.alias,"revoked trust",admin));
      if (block > site.blocked)
         this.syslogs.add(new syslog("site",site.alias,"blocked site",admin));
      else if (block < site.blocked)
         this.syslogs.add(new syslog("site",site.alias,"unblocked site",admin));
      site.trusted = trust;
      site.blocked = block;
      result = getConfirm("save");
   }
   return (result);
}

/**
 * function stores updated user
 */

function updateUser(param,admin) {
   var result;
   var u = this.users.get(param.item);
   if (!u)
      result = getError("userEditMissing");
   else if (u == admin)
      result = getError("accountModifyOwn");
   else {
      result = getConfirm("save");
      // check if this is an attempt to remove the last sysadmin
      var sysadmin = parseInt(param.sysadmin,10);
      var trust = parseInt(param.trusted,10);
      var block = parseInt(param.blocked,10);
      if (this.sysadmins.size() == 1 && !sysadmin)
         result = getError("adminDeleteLast");
      else {
         //logging
         if (sysadmin > u.sysadmin)
            this.syslogs.add(new syslog("user",u.name,"granted sysadmin-rights",admin));
         else if (sysadmin < u.sysadmin)
            this.syslogs.add(new syslog("user",u.name,"revoked sysadmin-rights",admin));
         u.sysadmin = parseInt(param.sysadmin,10);
      }
      if (trust > u.trusted)
         this.syslogs.add(new syslog("user",u.name,"granted trust",admin));
      else if (trust < u.trusted)
         this.syslogs.add(new syslog("user",u.name,"revoked trust",admin));
      if (block > u.blocked)
         this.syslogs.add(new syslog("user",u.name,"blocked user",admin));
      else if (block < u.blocked)
         this.syslogs.add(new syslog("user",u.name,"unblocked user",admin));
      u.trusted = trust;
      u.blocked = block;
   }
   return (result);
}


/**
 * function checks if the system parameters are correct
 */

function evalSystemSetup(param,admin) {
   var result;
   root.sys_title = param.sys_title;
   root.sys_url = evalURL(param.sys_url);
   // check system email
   if (!param.sys_email)
      result = getError("systemEmailMissing");
   else if (!checkEmail(param.sys_email))
      result = getError("emailInvalid");
   else
      root.sys_email = param.sys_email;
   // store selected locale in this.language and this.country
   var locs = java.util.Locale.getAvailableLocales();
   var newLoc = locs[parseInt(param.locale,10)];
   if (!newLoc)
      newLoc = java.util.Locale.getDefault();
   root.sys_country = newLoc.getCountry();
   root.sys_language = newLoc.getLanguage();
   root.cache.locale = null;
   // allow file
   root.sys_allowFiles = param.sys_allowFiles ? true : false;
   // limiting site-creation
   var limitArray = new Array(null,"trusted","sysAdmin");
   root.sys_limitNewSites = param.sys_limitNewSites ? parseInt(param.sys_limitNewSites,10) : null;
   root.sys_minMemberAge = param.sys_minMemberAge ? parseInt(param.sys_minMemberAge,10) : null;
   root.sys_waitAfterNewSite = param.sys_waitAfterNewSite ? parseInt(param.sys_waitAfterNewSite,10) : null;
   // auto-cleanup
   root.sys_enableAutoCleanup = param.sys_enableAutoCleanup ? true : false;
   root.sys_startAtHour = parseInt(param.sys_startAtHour,10);
   // auto-block
   root.sys_blockPrivateSites = param.sys_blockPrivateSites ? true : false;
   root.sys_blockWarningAfter = param.sys_blockWarningAfter ? parseInt(param.sys_blockWarningAfter,10) : null;
   root.sys_blockAfterWarning = param.sys_blockAfterWarning ? parseInt(param.sys_blockAfterWarning,10) : null;
   // auto-removal
   root.sys_deleteInactiveSites = param.sys_deleteInactiveSites ? true : false;
   root.sys_deleteWarningAfter = param.sys_deleteWarningAfter ? parseInt(param.sys_deleteWarningAfter,10) : null;
   root.sys_deleteAfterWarning = param.sys_deleteAfterWarning ? parseInt(param.sys_deleteAfterWarning,10) : null;
   if (!result) {
      // add a new entry in system-log
      this.syslogs.add(new syslog("system",null,"changed system setup",session.user));
      // everything fine, so we assign true to root.sys_issetup
      root.sys_issetup = true;
      result = getConfirm("systemUpdate");
   }
   return (result);
}