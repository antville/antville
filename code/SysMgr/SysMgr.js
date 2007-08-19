//
// The Antville Project
// http://code.google.com/p/antville
//
// Copyright 2001-2007 by The Antville People
//
// Licensed under the Apache License, Version 2.0 (the ``License'');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an ``AS IS'' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// $Revision$
// $LastChangedBy$
// $LastChangedDate$
// $URL$
//

/**
 * main action
 */
SysMgr.prototype.main_action = function() {
   this.status_action();
};

/**
 * setup action
 */
SysMgr.prototype.setup_action = function() {
   if (req.data.cancel)
      res.redirect(this.href("status"));
   else if (req.data.save) {
      try {
         res.message = this.evalSystemSetup(req.data, session.user);
         res.redirect(root.size() ? this.href("setup") : root.href("new"));
      } catch (err) {
         res.message = err.toString();
      }
   }

   res.data.title = getMessage("SysMgr.setupTitle", {serverTitle: root.getTitle()});
   res.data.action = this.href(req.action);
   res.data.body = this.renderSkinAsString("setup");
   root.renderSkin("page");
   return;
};

/**
 * site maintenance action
 */
SysMgr.prototype.sites_action = function() {
   res.data.title = getMessage("SysMgr.sitesTitle", {serverTitle: root.getTitle()});
   res.data.action = this.href(req.action);

   if (req.data.search || req.data.keywords)
      session.data.mgr.searchSites(req.data.show, req.data.sort, req.data.order, req.data.keywords);
   else if (req.data.cancel)
      res.redirect(res.data.action + "?page=" + req.data.page + "#" + req.data.item);
   else if (req.data.remove && req.data.item) {
      var site = this.sites.get(req.data.item);
      try {
         res.message = root.deleteSite(site);
         res.redirect(res.data.action + "?page=" + req.data.page);
      } catch (err) {
         res.message = err.toString();
      }
   } else if (req.data.save) {
      var result = this.updateSite(req.data, session.user);
      res.message = result.message;
      if (!result.error)
         res.redirect(res.data.action + "?page=" + req.data.page + "#" + req.data.item);
   } else if (req.data.item)
      req.data.selectedItem = this.sites.get(req.data.item);

   res.data.list = renderList(session.data.mgr.sites, this.renderManagerView, 10, req.data.page);
   res.data.pagenavigation = renderPageNavigation(session.data.mgr.sites, this.href(req.action), 10, req.data.page);
   res.data.body = this.renderSkinAsString("sitesearchform");
   res.data.body += this.renderSkinAsString("list");
   root.renderSkin("page");
   return;
};

/**
 * user maintenance action
 */
SysMgr.prototype.users_action = function() {
   res.data.title = getMessage("SysMgr.usersTitle", {serverTitle: root.getTitle()});
   res.data.action = this.href(req.action);

   if (req.data.search || req.data.keywords)
      session.data.mgr.searchUsers(req.data.show, req.data.sort, req.data.order, req.data.keywords);
   else if (req.data.cancel)
      res.redirect(res.data.action + "?page=" + req.data.page + "#" + req.data.item);
   else if (req.data.save) {
      var result = this.updateUser(req.data, session.user);
      res.message = result.message;
      if (!result.error)
         res.redirect(res.data.action + "?page=" + req.data.page + "#" + req.data.item);
   } else if (req.data.item)
      req.data.selectedItem = root.users.get(req.data.item);

   res.data.list = renderList(session.data.mgr.users, this.renderManagerView, 10, req.data.page);
   res.data.pagenavigation = renderPageNavigation(session.data.mgr.users, this.href(req.action), 10, req.data.page);
   res.data.body = this.renderSkinAsString("usersearchform");
   res.data.body += this.renderSkinAsString("list");
   root.renderSkin("page");
   return;
};

/**
 * action for displaying system logs
 */
SysMgr.prototype.logs_action = function() {
   res.data.title = getMessage("SysMgr.logTitle", {serverTitle: root.getTitle()});
   res.data.action = this.href(req.action);

   if (req.data.search || req.data.keywords)
      session.data.mgr.searchSyslog(req.data.show, req.data.order, req.data.keywords);

   res.data.list = renderList(session.data.mgr.syslogs, this.renderManagerView, 10, req.data.page);
   res.data.pagenavigation = renderPageNavigation(session.data.mgr.syslogs, this.href(req.action), 10, req.data.page);
   res.data.body = this.renderSkinAsString("syslogsearchform");
   res.data.body += this.renderSkinAsString("list");
   root.renderSkin("page");
   return;
};

/**
 * system status
 */
SysMgr.prototype.status_action = function() {
   res.data.title = getMessage("SysMgr.statusTitle", {serverTitle: root.getTitle()});
   var status = new Object();
   status.upSince = formatTimestamp(new Date(app.upSince.getTime()), "long");
   status.activeThreads = app.activeThreads;
   status.maxThreads = app.maxThreads;
   status.freeThreads = app.freeThreads;
   status.requests = app.requestCount;
   status.errors = app.errorCount;
   status.xmlrpc = app.xmlrpcCount;
   status.cacheUsage = app.cacheusage;
   status.sessions = app.countSessions();
   status.totalMemory = Math.round(java.lang.Runtime.getRuntime().totalMemory() / 1024);
   status.freeMemory = Math.round(java.lang.Runtime.getRuntime().freeMemory() / 1024);
   status.usedMemory = status.totalMemory - status.freeMemory;
   res.data.body = this.renderSkinAsString("status", status);
   root.renderSkin("page");
   return;
};
/**
 * function determines if it's time to start
 * automatic cleanup
 */

SysMgr.prototype.autoCleanUp = function() {
   if (root.sys_enableAutoCleanup) {
      var startAtHour = root.sys_startAtHour;
      var nextCleanup = new Date();
      nextCleanup.setDate(nextCleanup.getDate() + 1);
      nextCleanup.setHours((!isNaN(startAtHour) ? startAtHour : 0), 0, 0, 0);
      // check if it's time to run autocleanup
      if (!app.data.nextCleanup) {
         app.data.nextCleanup = nextCleanup;
         this.add (new SysLog("system", null, "next cleanup scheduled for " + app.data.nextCleanup.format("EEEE, dd.MM.yyyy HH:mm"), null));
      } else if (new Date() >= app.data.nextCleanup) {
         this.syslogs.add (new SysLog("system", null, "starting automatic cleanup ...", null));
         app.data.nextCleanup = nextCleanup;
         // now start the auto-cleanup-functions
         this.cleanupAccesslog();
         this.blockPrivateSites();
         // this.deleteInactiveSites();
         this.add (new SysLog("system", null, "next cleanup scheduled for " + app.data.nextCleanup.format("EEEE, dd.MM.yyyy HH:mm"), null));
      }
   }
};


/**
 * function blocks private sites that are offline for too long
 * if enabled and configured properly in app.properties
 */

SysMgr.prototype.blockPrivateSites = function() {
   var enable = root.sys_blockPrivateSites;
   var blockWarningAfter = root.sys_blockWarningAfter;
   var blockAfterWarning = root.sys_blockAfterWarning;
   if (!enable) {
      // blocking of private sites is disabled
      return;
   } else if (!blockWarningAfter || !blockAfterWarning) {
      // something is fishy with blocking properties
      this.syslogs.add (new SysLog("system", null, "blocking of private sites cancelled", null));
      return;
   }
   var size = this.privateSites.size();
   this.syslogs.add (new SysLog("system", null, "checking " + size + " private site(s) ...", null));

   // get thresholds in millis
   warnThreshold = blockWarningAfter*1000*60*60*24;
   blockThreshold = blockAfterWarning*1000*60*60*24;

   for (var i=0;i<size;i++) {
      var site = this.privateSites.get(i);
      // if site is trusted, we do nothing
      if (site.trusted)
         continue;

      var privateFor = new Date() - site.lastoffline;
      var timeSinceWarning = new Date() - site.lastblockwarn;
      if (privateFor >= warnThreshold) {
         // check if site-admins have been warned already
         var alreadyWarned = false;
         if (site.lastblockwarn > site.lastoffline)
            alreadyWarned = true;
         // check whether warn admins or block site
         if (!alreadyWarned) {
            // admins of site haven't been warned about upcoming block, so do it now
            var warning = new Mail;
            var recipient = site.email ? site.email : site.creator.email;
            warning.addTo(recipient);
            warning.setFrom(root.sys_email);
            warning.setSubject(getMessage("mail.blockWarning", site.title));
            var sp = new Object();
            sp.site = site.alias;
            sp.url = site.href();
            sp.privatetime = blockWarningAfter;
            sp.daysleft = blockAfterWarning;
            sp.contact = root.sys_email;
            warning.addText(this.renderSkinAsString("blockwarnmail", sp));
            warning.send();
            this.syslogs.add (new SysLog("site", site.alias, "site is private for more than " + blockWarningAfter + " days, sent warning to " + recipient, null));
            site.lastblockwarn = new Date();
         } else if (timeSinceWarning >= blockThreshold) {
            // site is offline for too long, so block it
            site.blocked = 1;
            this.syslogs.add (new SysLog("site", site.alias, "blocked site", null));
         }
      } else
         break;
   }   
   this.syslogs.add (new SysLog("system", null, "finished checking for private sites", null));
   return true;
};


/**
 * function disposes sites that are inactive for too long
 * FUNCTION DISABLED!
 */

SysMgr.prototype.deleteInactiveSites = function() {
   
   return;

   var enable = root.sys_deleteInactiveSites;
   var delWarningAfter = root.sys_deleteWarningAfter;
   var delAfterWarning = root.sys_deleteAfterWarning;
   if (!enable) {
      // blocking of private sites is disabled
      return;
   } else if (!delWarningAfter || !delAfterWarning) {
      // something is fishy with properties
      this.syslogs.add (new SysLog("system", null, "cleanup of sites cancelled", null));
      return;
   }
   var size = root.size();
   this.syslogs.add (new SysLog("system", null, "checking " + size + " sites for inactivity ...", null));

   // get thresholds in millis
   warnThreshold = delWarningAfter*1000*60*60*24;
   delThreshold = delAfterWarning*1000*60*60*24;

   for (var i=size;i>0;i--) {
      var site = root.get(i-1);
      // if site is trusted, we do nothing
      if (site.trusted)
         continue;

      var idleFor = new Date() - site.lastupdate;
      var timeSinceWarning = new Date() - site.lastdelwarn;
      if (idleFor >= warnThreshold) {
         // check if site-admins have been warned already
         var alreadyWarned = false;
         if (site.lastdelwarn > site.lastupdate)
            alreadyWarned = true;
         // check whether warn admins or block site
         if (!alreadyWarned) {
            // admins of site haven't been warned about upcoming block, so do it now
            var warning = new Mail();
            var recipient = site.email ? site.email : site.creator.email;
            warning.addTo(recipient);
            warning.setFrom(root.sys_email);
            warning.setSubject(getMessage("mail.deleteWarning", site.title));
            var sp = new Object();
            sp.site = site.alias;
            sp.url = site.href();
            sp.inactivity = delWarningAfter;
            sp.daysleft = delAfterWarning;
            sp.contact = root.sys_email;
            warning.addText(this.renderSkinAsString("deletewarnmail", sp));
            warning.send();
            this.syslogs.add (new SysLog("site", site.alias, "site was inactive for more than " + delWarningAfter + " days, sent warning to " + recipient, null));
            site.lastdelwarn = new Date();
         } else if (timeSinceWarning >= blockThreshold) {
            // site is inactive for too long, so delete it
            root.deleteSite(site);
         }
      } else
         break;
   }   
   this.syslogs.add (new SysLog("system", null, "finished checking for inactive sites", null));
   return true;
};


/**
 * function deletes all accesslog-records older than 48 hours
 * and with story-id = null
 */
SysMgr.prototype.cleanupAccesslog = function() {
	var dbConn = getDBConnection("antville");
	var dbError = dbConn.getLastError();
	if (dbError) {
      this.syslogs.add (new SysLog("system", null, "failed to clean up accesslog-table!", null));
      return;
   }
   var threshold = new Date();
   threshold.setDate(threshold.getDate() -2);
	var query = "delete from AV_ACCESSLOG where ACCESSLOG_F_TEXT is null and ACCESSLOG_DATE < '" + threshold.format("yyyy-MM-dd HH:mm:ss") + "'";
   var delRows = dbConn.executeCommand(query);
   if (delRows)
      this.syslogs.add (new SysLog("system", null, "removed " + delRows + " records from accesslog-table", null));
   return;
};
/**
 * macro renders a dropdown-box
 */

SysMgr.prototype.dropdown_macro = function(param) {
   if (!param.name || !param.values)
      return;
   var options = param.values.split(",");
   var selectedIndex = req.data[param.name];
   Html.dropDown({name: param.name},options,selectedIndex);
   return;
};

/**
 * macro checks if there are any modules present
 * and if they need to be included in the system setup page
 */
SysMgr.prototype.moduleSetup_macro = function(param) {
   for (var i in app.modules)
      this.applyModuleMethod(app.modules[i], "renderSetup", param);
   return;
};
/**
 * constructor-function
 */
SysMgr.prototype.constructor = function() {
   this.searchSites();
   this.searchUsers();
   this.searchSyslog();
   return this;
};

/**
 * function manipulates the sites-collection
 */

SysMgr.prototype.searchSites = function(show, sort, order, keywords) {
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
         sql += "(SITE_ALIAS LIKE '%" + k + "%' OR SITE_TITLE LIKE '%" + k + "%') ";
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
};

/**
 * function manipulates the users-collection
 */

SysMgr.prototype.searchUsers = function(show, sort, order, keywords) {
   // construct the sql-clause for manual subnodeRelation
   var sql = "";
   if (show == "1")
      sql += "where status = 'blocked' ";
   else if (show == "2")
      sql += "where status = 'trusted' ";
   else if (show == "3")
      sql += "where status = 'privileged' ";
   if (keywords) {
      // additional keywords are given, so we're using them
      if (keywords.charAt(0) == "@") {
         // searching for email-addresses
         sql += sql.length > 0 ? "and " : "where ";
         sql += "email like '%" + keywords + "%' ";
      } else {
         // doing normal keyword-search
         var kArray = stripTags(keywords).split(" ");
         for (var i in kArray) {
            var k = kArray[i];
            sql += sql.length > 0 ? "and " : "where ";
            sql += "name like '%" + k + "%' ";
         }
      }
   }
   if (!sort || sort == "0")
      sql += "order by modified ";
   else if (sort == "1")
      sql += "order by created ";
   else if (sort == "2")
      sql += "order by name ";
   if (!order || order == "0")
      sql += "desc ";
   else if (order == "1")
      sql += "asc ";

   // now do the actual search with a manual subnodeRelation
   this.users.subnodeRelation = sql;
   return;
};

/**
 * function manipulates the syslogs-collection
 */

SysMgr.prototype.searchSyslog = function(show, order, keywords) {
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
};

/**
 * function stores updated site-preferences
 */

SysMgr.prototype.updateSite = function(param, admin) {
   var site = this.sites.get(param.item);
   if (!site)
      throw new Exception("siteEditMissing");
   var trust = parseInt(param.trusted, 10);
   var block = parseInt(param.blocked, 10);
   if (trust > site.trusted)
      this.syslogs.add(new SysLog("site", site.alias, "granted trust", admin));
   else if (trust < site.trusted)
      this.syslogs.add(new SysLog("site", site.alias, "revoked trust", admin));
   if (block > site.blocked)
      this.syslogs.add(new SysLog("site", site.alias, "blocked site", admin));
   else if (block < site.blocked)
      this.syslogs.add(new SysLog("site", site.alias, "unblocked site", admin));
   site.trusted = trust;
   site.blocked = block;
   return new Message("update");
};

/**
 * function stores updated user
 */

SysMgr.prototype.updateUser = function(param, admin) {
   var user = this.users.get(param.item);
   if (!user) {
      throw new Exception("userEditMissing");
   }
   if (user === admin) {
      throw new Exception("accountModifyOwn");
   }
   var name = user.name;
   var status = user.value("status");
   if (param.status !== status) {
      user.value("status", param.status);
      // Log activity
      var msg = "set status to " + param.status;
      this.syslogs.add(new SysLog("user", name, msg, admin));
   }
   return new Message("update");
};


/**
 * function checks if the system parameters are correct
 */

SysMgr.prototype.evalSystemSetup = function(param, admin) {
   root.sys_title = param.sys_title;
   var sys_url = evalURL(param.sys_url);
   // make sure the sys_url ends with a slash, otherwise
   // the links to external stylesheets etc. won't work
   if (!sys_url.endsWith("/"))
      root.sys_url = sys_url + "/";
   else
      root.sys_url = sys_url;
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
   root.sys_allowEmails = param.sys_allowEmails ? parseInt(param.sys_allowEmails, 10) : null;
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
   // disk quota
   root.sys_diskQuota = parseInt(param.sys_diskQuota, 10);
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
   // set the default layout
   if (param.layout)
      root.layouts.setDefaultLayout(param.layout);
   // call the evalSystemSetup method of every module
   for (var i in app.modules)
      this.applyModuleMethod(app.modules[i], "evalSystemSetup", param);

   // add a new entry in system-log
   this.syslogs.add(new SysLog("system", null, "changed system setup", session.user));
   // everything fine, so we assign true to root.sys_issetup
   root.sys_issetup = true;
   return new Message("systemUpdate");
};
/**
 * additional check that is done for each item
 * in the system manager lists
 * @param Object item to render
 */
SysMgr.prototype.renderManagerView = function(item) {
   item.renderSkin("sysmgr_listitem");
   if (req.data.selectedItem && item == req.data.selectedItem)
      item.renderSkin(req.data.action == "remove" ? "sysmgr_delete" : "sysmgr_edit");
   return;
};
/**
 * function is called at each request
 * and checks if user is logged in and is sysadmin
 */
SysMgr.prototype.onRequest = function() {
   HopObject.prototype.onRequest.apply(this);
   if (!session.user || !session.user.sysadmin) {
      res.message = new Exception("userNoSysAdmin");
      res.redirect(root.href());
   }
   // initialize sysmgr-object in session
   if (!session.data.mgr)
      session.data.mgr = new SysMgr();
   return;
};
