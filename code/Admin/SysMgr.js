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

Admin.prototype.constructor = function() {
   this.searchSites();
   this.searchUsers();
   this.searchSyslog();
   return this;
};

Admin.prototype.update = function(data) {
   root.update(data);
   root.map({
      notificationScope: data.notificationScope,
      quota: data.quota,
      creationScope: data.creationScope,
      creationDelay: data.creationDelay,
      qualifyingPeriod: data.qualifyingPerido,
      qualifyingDate: data.qualifyingDate,
      autoCleanupEnabled: data.autoCleanupEnabled,
      autoCleanupStartTime: data.autoCleanupStartTime,
      phaseOutPrivateSites: data.phaseOutPrivateSites,
      phaseOutInactiveSites: data.phaseOutInactiveSites,
      phaseOutNotificationPeriod: data.phaseOutNotificationPeriod,
      phaseOutGracePeriod: data.phaseOutGracePeriod
   });
   
   // FIXME:
   //for (var i in app.modules) {
   //   this.applyModuleMethod(app.modules[i], "evalSystemSetup", data);
   //}

   log("system", null, "changed system setup", session.user);
   return;
};

Admin.prototype.onRequest = function() {
   HopObject.prototype.onRequest.apply(this);
   if (!session.data.admin) {
      session.data.admin = new Admin();
   }
   return;
};

Admin.prototype.getPermission = function(action) {
   return User.getPermission(User.PRIVILEGED);
};

Admin.prototype.main_action = function() {
   return res.redirect(this.href("status"));
};

Admin.prototype.status_action = function() {
   var runtime = java.lang.Runtime.getRuntime();
   var system = {
      upSince: app.upSince,
      activeThreads: app.activeThreads,
      maxThreads: app.maxThreads,
      freeThreads: app.freeThreads,
      requestCount: app.requestCount,
      errorCount: app.errorCount,
      xmlRpcCount: app.xmlrpcCount,
      cacheUsage: app.cacheusage,
      sessionCount: app.countSessions(),
      totalMemory: Math.round(runtime.totalMemory() / 1024),
      freeMemory: Math.round(runtime.freeMemory() / 1024)     
   };
   system.usedMemory = system.totalMemory - system.freeMemory;
   res.handlers.system = system;
   res.data.title = gettext("{0} System Status", root.title);
   res.data.body = this.renderSkinAsString("status");
   root.renderSkin("page");
   return;
};

Admin.prototype.setup_action = function() {
   if (req.postParams.save) {
      try {
         this.update(req.postParams);
         res.message = gettext("Successfully updated the setup.");
         res.redirect(root.href());
      } catch (ex) {
         res.message = ex;
         app.log(ex);
      }
   }

   res.data.title = gettext("Setup of {0}", root.title);
   res.data.action = this.href(req.action);
   res.data.body = this.renderSkinAsString("setup");
   root.renderSkin("page");
   return;
};

Admin.prototype.sites_action = function() {
   res.data.title = gettext("Site administration of {0}", root.title);
   res.data.action = this.href(req.action);

/*   if (req.data.search || req.data.keywords)
      session.data.admin.searchSites(req.data.show, req.data.sort, req.data.order, req.data.keywords);
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

   res.data.list = renderList(session.data.admin.sites, this.renderManagerView, 10, req.data.page);
   res.data.pagenavigation = renderPageNavigation(session.data.admin.sites, this.href(req.action), 10, req.data.page);
   res.data.body = this.renderSkinAsString("sitesearchform");
   res.data.body += this.renderSkinAsString("list");
*/
   root.renderSkin("page");
   return;
};

Admin.prototype.users_action = function() {
   res.data.title = getMessage("Admin.usersTitle", {serverTitle: root.getTitle()});
   res.data.action = this.href(req.action);

   if (req.data.search || req.data.keywords)
      session.data.admin.searchUsers(req.data.show, req.data.sort, req.data.order, req.data.keywords);
   else if (req.data.cancel)
      res.redirect(res.data.action + "?page=" + req.data.page + "#" + req.data.item);
   else if (req.data.save) {
      var result = this.updateUser(req.data, session.user);
      res.message = result.message;
      if (!result.error)
         res.redirect(res.data.action + "?page=" + req.data.page + "#" + req.data.item);
   } else if (req.data.item)
      req.data.selectedItem = root.users.get(req.data.item);

   res.data.list = renderList(session.data.admin.users, this.renderManagerView, 10, req.data.page);
   res.data.pagenavigation = renderPageNavigation(session.data.admin.users, this.href(req.action), 10, req.data.page);
   res.data.body = this.renderSkinAsString("usersearchform");
   res.data.body += this.renderSkinAsString("list");
   root.renderSkin("page");
   return;
};

Admin.prototype.logs_action = function() {
   res.data.title = getMessage("Admin.logTitle", {serverTitle: root.getTitle()});
   res.data.action = this.href(req.action);

   if (req.data.search || req.data.keywords)
      session.data.admin.searchSyslog(req.data.show, req.data.order, req.data.keywords);

   res.data.list = renderList(session.data.admin.syslogs, this.renderManagerView, 10, req.data.page);
   res.data.pagenavigation = renderPageNavigation(session.data.admin.syslogs, this.href(req.action), 10, req.data.page);
   res.data.body = this.renderSkinAsString("syslogsearchform");
   res.data.body += this.renderSkinAsString("list");
   root.renderSkin("page");
   return;
};

Admin.prototype.autoCleanUp = function() {
   return;
   
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
         log("system", null, "starting automatic cleanup ...", null);
         app.data.nextCleanup = nextCleanup;
         // now start the auto-cleanup-functions
         this.cleanupAccesslog();
         this.blockPrivateSites();
         // this.deleteInactiveSites();
         this.add (new SysLog("system", null, "next cleanup scheduled for " + app.data.nextCleanup.format("EEEE, dd.MM.yyyy HH:mm"), null));
      }
   }
};

Admin.prototype.blockPrivateSites = function() {
   return;
   
   var enable = root.sys_blockPrivateSites;
   var blockWarningAfter = root.sys_blockWarningAfter;
   var blockAfterWarning = root.sys_blockAfterWarning;
   if (!enable) {
      // blocking of private sites is disabled
      return;
   } else if (!blockWarningAfter || !blockAfterWarning) {
      // something is fishy with blocking properties
      log("system", null, "blocking of private sites cancelled", null);
      return;
   }
   var size = this.privateSites.size();
   log("system", null, "checking " + size + " private site(s) ...", null);

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
            log("site", site.alias, "site is private for more than " + 
                  blockWarningAfter + " days, sent warning to " + recipient, null);
            site.lastblockwarn = new Date();
         } else if (timeSinceWarning >= blockThreshold) {
            // site is offline for too long, so block it
            site.blocked = 1;
            log("site", site.alias, "blocked site", null);
         }
      } else
         break;
   }   
   log("system", null, "finished checking for private sites", null);
   return true;
};

Admin.prototype.deleteInactiveSites = function() {
   return;

   var enable = root.sys_deleteInactiveSites;
   var delWarningAfter = root.sys_deleteWarningAfter;
   var delAfterWarning = root.sys_deleteAfterWarning;
   if (!enable) {
      // blocking of private sites is disabled
      return;
   } else if (!delWarningAfter || !delAfterWarning) {
      // something is fishy with properties
      log("system", null, "cleanup of sites cancelled", null);
      return;
   }
   var size = root.size();
   log("system", null, "checking " + size + " sites for inactivity ...", null);

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
            log("site", site.alias, "site was inactive for more than " + 
                  delWarningAfter + " days, sent warning to " + recipient, null);
            site.lastdelwarn = new Date();
         } else if (timeSinceWarning >= blockThreshold) {
            // site is inactive for too long, so delete it
            root.deleteSite(site);
         }
      } else
         break;
   }   
   log("system", null, "finished checking for inactive sites", null);
   return true;
};

Admin.prototype.cleanupAccesslog = function() {
   return;
   
	var dbConn = getDBConnection("antville");
	var dbError = dbConn.getLastError();
	if (dbError) {
      log("system", null, "failed to clean up accesslog-table!", null);
      return;
   }
   var threshold = new Date();
   threshold.setDate(threshold.getDate() -2);
	var query = "delete from AV_ACCESSLOG where ACCESSLOG_F_TEXT is null and ACCESSLOG_DATE < '" + threshold.format("yyyy-MM-dd HH:mm:ss") + "'";
   var delRows = dbConn.executeCommand(query);
   if (delRows) {
      log("system", null, "removed " + delRows + 
            " records from accesslog-table", null);
   }
   return;
};

Admin.prototype.dropdown_macro = function(param) {
   if (!param.name || !param.values)
      return;
   var options = param.values.split(",");
   var selectedIndex = req.data[param.name];
   Html.dropDown({name: param.name},options,selectedIndex);
   return;
};

Admin.prototype.moduleSetup_macro = function(param) {
   for (var i in app.modules)
      this.applyModuleMethod(app.modules[i], "renderSetup", param);
   return;
};

Admin.prototype.searchSites = function(show, sort, order, keywords) {
   // construct the sql-clause for manual subnodeRelation
   var sql = "";
   if (show == "1")
      sql += "where mode = 'online' and status <> 'blocked' ";
   else if (show == "2")
      sql += "where mode <> 'online' and status <> 'blocked' ";
   else if (show == "3")
      sql += "where status = 'blocked' ";
   else if (show == "4")
      sql += "where status = 'trusted' ";
   if (keywords) {
      // additional keywords are given, so we're using them
      var kArray = stripTags(keywords).split(" ");
      for (var i in kArray) {
         var k = kArray[i];
         sql += sql.length > 0 ? "and " : "where ";
         sql += "(name like '%" + k + "%' or title like '%" + k + "%') ";
      }
   }
   if (!sort || sort == "0")
      sql += "order by modified ";
   else if (sort == "1")
      sql += "order by created ";
   else if (sort == "2")
      sql += "order by name ";
   else if (sort == "3")
      sql += "order by title ";
   if (!order || order == "0")
      sql += "desc ";
   else if (order == "1")
      sql += "asc ";

   // now do the actual search with a manual subnodeRelation
   this.sites.subnodeRelation = sql;
   return;
};

Admin.prototype.searchUsers = function(show, sort, order, keywords) {
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

Admin.prototype.searchSyslog = function(show, order, keywords) {
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

Admin.prototype.updateSite = function(param, admin) {
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

Admin.prototype.updateUser = function(param, admin) {
   var user = this.users.get(param.item);
   if (!user) {
      throw new Exception("userEditMissing");
   }
   if (user === admin) {
      throw new Exception("accountModifyOwn");
   }
   if (param.status !== user.status) {
      user.status = param.status;
      // Log activity
      var msg = "set status to " + param.status;
      this.syslogs.add(new SysLog("user", user.name, msg, admin));
   }
   return new Message("update");
};

Admin.prototype.renderManagerView = function(item) {
   item.renderSkin("sysmgr_listitem");
   if (req.data.selectedItem && item == req.data.selectedItem)
      item.renderSkin(req.data.action == "remove" ? "sysmgr_delete" : "sysmgr_edit");
   return;
};

Admin.getHours = function() {
   var hours = [];
   for (var i=0; i<24; i+=1) {
      hours.push(String(i).pad("0", 2, String.LEFT) + ":00");
   }
   return hours;
};
