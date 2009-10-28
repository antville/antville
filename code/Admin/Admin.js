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
// $Revision:3333 $
// $LastChangedBy:piefke3000 $
// $LastChangedDate:2007-09-15 01:25:23 +0200 (Sat, 15 Sep 2007) $
// $URL$
//

Admin.purgeDatabase = function() {
   return;
}

Admin.prototype.constructor = function() {
   this.filterSites();
   this.filterUsers();
   this.filterLog();
   return this;
}

Admin.prototype.getPermission = function(action) {
   if (!session.user) {
      return false;
   }
   switch (action) {
      case "users":
      if (req.queryParams.id === session.user._id) {
         return false;
      }
   }
   return User.require(User.PRIVILEGED);
}

Admin.prototype.onRequest = function() {
   HopObject.prototype.onRequest.apply(this);
   if (!session.data.admin) {
      session.data.admin = new Admin();
   }
   return;
}

Admin.prototype.onUnhandledMacro = function(name) {
   res.debug("Add " + name + "_macro to Admin!");
   return null;
}

Admin.prototype.main_action = function() {
   return res.redirect(this.href("log"));
}

Admin.prototype.setup_action = function() {
   if (req.postParams.save) {
      try {
         this.update(req.postParams);
         this.log(root, "setup");
         res.message = gettext("Successfully updated the setup.");
         res.redirect(this.href(req.action));
      } catch (ex) {
         res.message = ex;
         app.log(ex);
      }
   }

   res.data.title = gettext("Setup of {0}", root.title);
   res.data.action = this.href(req.action);
   res.data.body = this.renderSkinAsString("$Admin#setup");
   root.renderSkin("Site#page");
   return;
}

Admin.prototype.update = function(data) {
   root.map({
      email: data.email,
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
   this.log(root, "Updated setup");
   
   // FIXME:
   //for (var i in app.modules) {
   //   this.applyModuleMethod(app.modules[i], "evalSystemSetup", data);
   //}
   return;
}

Admin.prototype.log_action = function() {
   if (req.postParams.search || req.postParams.filter) {
      session.data.admin.filterLog(req.postParams);
   }
   res.data.list = renderList(session.data.admin.entries, 
         this.renderItem, 10, req.queryParams.page);
   res.data.pager = renderPager(session.data.admin.entries, 
         this.href(req.action), 10, req.queryParams.page);

   res.data.title = gettext("Administration log of {0}", root.title);
   res.data.action = this.href(req.action);
   res.data.body = this.renderSkinAsString("$Admin#log");
   res.data.body += this.renderSkinAsString("$Admin#main");
   root.renderSkin("Site#page");
   return;
}

Admin.prototype.sites_action = function() {
   if (req.isPost()) {
      if (req.postParams.search || req.postParams.filter) {
         session.data.admin.filterSites(req.postParams);
      } else if (req.postParams.remove === "1" && req.postParams.id) {
         var site = Site.getById(req.postParams.id);
         try {
            Site.remove(site);
            res.message = gettext("The site {0} was removed successfully.",
                  site.name);
            res.redirect(this.href(req.action) + "?page=" + req.postParams.page);
         } catch (err) {
            res.message = err.toString();
         }
      } else if (req.postParams.save) {
         this.updateSite(req.postParams);
         res.message = gettext("The changes were saved successfully.");
      }
      res.redirect(this.href(req.action) + "?page=" + req.postParams.page + 
            "#" + req.postParams.id);
   } else if (req.queryParams.id) {
      res.meta.item = Site.getById(req.queryParams.id);
   }

   res.data.list = renderList(session.data.admin.sites, 
         this.renderItem, 10, req.queryParams.page);
   res.data.pager = renderPager(session.data.admin.sites, 
         this.href(req.action), 10, req.data.page);

   res.data.title = gettext("Site administration of {0}", root.title);
   res.data.action = this.href(req.action);
   res.data.body = this.renderSkinAsString("$Admin#sites");
   res.data.body += this.renderSkinAsString("$Admin#main");
   root.renderSkin("Site#page");
   return;
}

Admin.prototype.users_action = function() {
   if (req.postParams.search || req.postParams.filter) {
      session.data.admin.filterUsers(req.postParams);
   } else if (req.postParams.save) {
      this.updateUser(req.postParams);
      res.message = gettext("The changes were saved successfully.");
      res.redirect(this.href(req.action) + "?page=" + req.postParams.page + 
            "#" + req.postParams.id);
   } else if (req.queryParams.id) {
      res.meta.item = User.getById(req.queryParams.id);
   }

   res.data.list = renderList(session.data.admin.users, 
         this.renderItem, 10, req.data.page);
   res.data.pager = renderPager(session.data.admin.users, 
         this.href(req.action), 10, req.data.page);

   res.data.title = gettext("User administration of {0}", root.title);
   res.data.action = this.href(req.action);
   res.data.body = this.renderSkinAsString("$Admin#users");
   res.data.body += this.renderSkinAsString("$Admin#main");
   root.renderSkin("Site#page");
   return;
}

Admin.prototype.filterLog = function(data) {
   data || (data = {});
   var sql = "";
   if (data.filter > 0) {
      sql += "where context_type = '";
      switch (data.filter) {
         case "1":
         sql += "Site"; break;
         case "2":
         sql += "User"; break;
         case "3":
         sql += "Root"; break;
      }
      sql += "' and ";
   } else {
      sql += "where "
   }
   sql += "action <> 'main' "; 
   if (data.query) {
      var parts = stripTags(data.query).split(" ");
      var keyword, like;
      for (var i in parts) {
         sql += i < 1 ? "and " : "or ";
         keyword = parts[i].replace(/\*/g, "%");
         like = keyword.contains("%") ? "like" : "=";
         sql += "action " + like + " '" + keyword + "' ";
      }
   }
   sql += "order by created "; 
   (data.dir == 1) || (sql += "desc");
   this.entries.subnodeRelation = sql;
   return;
}

Admin.prototype.filterSites = function(data) {
   data || (data = {});
   var sql;
   switch (data.filter) {
      case "1":
      sql = "where mode = 'public' "; break;
      case "2":
      sql = "where mode = 'private' "; break;
      case "3":
      sql = "where status = 'blocked' "; break;
      case "4":
      sql = "where status = 'trusted' "; break;
      case "0":
      default:
      sql = "where true ";
   }
   if (data.query) {
      var parts = stripTags(data.query).split(" ");
      var keyword, like;
      for (var i in parts) {
         sql += i < 1 ? "and " : "or ";
         keyword = parts[i].replace(/\*/g, "%");
         like = keyword.contains("%") ? "like" : "=";
         sql += "(name " + like + " '" + keyword + "') ";
      }
   }
   switch (data.order) {
      case "1":
      sql += "order by created "; break;
      case "2":
      sql += "order by name "; break;
      default:
      sql += "order by modified "; break;
   }
   (data.dir == 1) || (sql += "desc");
   this.sites.subnodeRelation = sql;
   return;
}

Admin.prototype.filterUsers = function(data) {
   data || (data = {});
   var sql;
   switch (data.filter) {
      case "1":
      sql = "where status = 'blocked' "; break;
      case "2":
      sql = "where status = 'trusted' "; break;
      case "3":
      sql = "where status = 'privileged' "; break;
      default:
      sql = "where true "; break;
   }
   if (data.query) {
      var parts = stripTags(data.query).split(" ");
      var keyword, like;
      for (var i in parts) {
         sql += i < 1 ? "and " : "or ";
         keyword = parts[i].replace(/\*/g, "%");
         like = keyword.contains("%") ? "like" : "=";
         if (keyword.contains("@")) {
            sql += "email " + like + " '" + keyword.replace(/@/g, "") + "' ";
         } else {
            sql += "name " + like + " '" + keyword + "' ";
         }
      }
   }
   switch (data.order) {
      case "1":
      sql += "order by created "; break;
      case "2":
      sql += "order by name "; break;
      case "0":
      default:
      sql += "order by modified "; break;
   }
   (data.dir == 1) || (sql += "desc");
   this.users.subnodeRelation = sql;
   return;
}

Admin.prototype.updateSite = function(data) {
   var site = Site.getById(data.id);
   if (!site) {
      throw Error(gettext("Please choose a site you want to edit."));
   }
   if (site.status !== data.status) { 
      var current = site.status;
      site.status = data.status;
      this.log(site, "Changed status from " + current + " to " + site.status);
   }
   return;
}

Admin.prototype.updateUser = function(data) {
   var user = User.getById(data.id);
   if (!user) {
      throw Error(gettext("Please choose a user you want to edit."));
   }
   if (user === session.user) {
      throw Error(gettext("Sorry, you are not allowed to modify your own account."));
   }
   if (data.status !== user.status) {
      var current = user.status;
      user.status = data.status;
      this.log(user, "Changed status from " + current + " to " + data.status);
   }
   return;
}

Admin.prototype.renderItem = function(item) {
   res.handlers.item = item;
   var name = item._prototype;
   (name === "Root") && (name = "Site");
   Admin.prototype.renderSkin("$Admin#" + name);
   if (item === res.meta.item) {
      Admin.prototype.renderSkin((req.data.action === "delete" ? 
            "$Admin#delete" : "$Admin#edit") + name);
   }
   return;
}

Admin.prototype.log = function(context, action) {
   var entry = new LogEntry(context, action);
   this.entries.add(entry);
}

Admin.prototype.link_macro = function(param, action, id, text) {
   switch (action) {
      case "edit":
      case "delete":
      if (req.action === "users" && (id === session.user._id)) {
         return;
      }
      if (req.action === "sites" && (id === root._id)) {
         return;
      }
      text = gettext(action.capitalize());
      action = req.action + "?action=" + action + "&id=" + id;
      if (req.queryParams.page) {
         action += "&page=" + req.queryParams.page;
      }
      action += "#" + id;
      break;
      default:
      text = id;
   }
   return HopObject.prototype.link_macro.call(this, param, action, text);
}

Admin.prototype.count_macro = function(param, object, name) {
   if (!object || !object.size) {
      return;
   }
   switch (name) {
      case "comments":
      if (object.constructor === Site) {
         res.write("FIXME: takes very long... :(");
         //res.write(object.stories.comments.size());
      }
      return;
   }
   res.write(object.size());
   return;
}

Admin.prototype.skin_macro = function(param, name) {
   if (this.getPermission("main")) {
      return HopObject.prototype.skin_macro.apply(this, arguments);
   }
   return;
}

Admin.prototype.items_macro = function(param, object, name) {
   if (!object || !object.size) {
      return;
   }
   var max = Math.min(object.size(), parseInt(param.limit) || 5);
   for (var i=0; i<max; i+=1) {
      html.link({href: object.get(i).href()}, "#" + (object.size()-i) + " ");
   }
   return;
}

Admin.prototype.dropdown_macro = function(param) {
   if (!param.name || !param.values) {
      return;
   }
   var options = param.values.split(",");
   var selectedIndex = req.postParams[param.name];
   html.dropDown({name: param.name}, options, selectedIndex);
   return;
}

Admin.prototype.moduleSetup_macro = function(param) {
   for (var i in app.modules) {
      this.applyModuleMethod(app.modules[i], "renderSetup", param);
   }
   return;
}





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
}

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
            warning.setSubject(gettext("Warning! Your site {0} soon will be blocked!", site.title));
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
}

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

      var idleFor = new Date() - site.modified;
      var timeSinceWarning = new Date() - site.lastdelwarn;
      if (idleFor >= warnThreshold) {
         // check if site-admins have been warned already
         var alreadyWarned = false;
         if (site.lastdelwarn > site.modified)
            alreadyWarned = true;
         // check whether warn admins or block site
         if (!alreadyWarned) {
            // admins of site haven't been warned about upcoming block, so do it now
            var warning = new Mail();
            var recipient = site.email ? site.email : site.creator.email;
            warning.addTo(recipient);
            warning.setFrom(root.sys_email);
            warning.setSubject(gettext("Warning! Your site {0} soon will be deleted!", site.title));
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
}

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
}

Admin.getHours = function() {
   var hours = [];
   for (var i=0; i<24; i+=1) {
      hours.push(String(i).pad("0", 2, String.LEFT) + ":00");
   }
   return hours;
}
