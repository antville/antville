/**
 * main action
 */
function main_action() {
   res.redirect(this.href("status"));
}

/**
 * setup action
 */
function setup_action() {
   if (req.data.cancel)
      res.redirect(root.href());
   else if (req.data.save) {
      try {
         res.message = this.evalSystemSetup(req.data, session.user);
         res.redirect(root.href());
      } catch (err) {
         res.message = err.toString();
      }
   }
   
   res.data.title = "System configuration of " + root.getSysTitle();
   res.data.action = this.href(req.action);
   res.data.body = this.renderSkinAsString("setup");
   this.renderSkin("page");
}

/**
 * site maintenance action
 */
function sites_action() {
   res.data.title = "Site manager of " + root.getSysTitle();
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
   
   res.data.list = renderList(this.sites, this.renderManagerView, 10, req.data.page);
   res.data.pagenavigation = renderPageNavigation(this.sites, this.href(req.action), 10, req.data.page);
   res.data.list = this.renderSkinAsString("list");
   res.data.body = this.renderSkinAsString("sitesearchform");
   this.renderSkin("page");
}

/**
 * user maintenance action
 */
function users_action() {
   res.data.title = "User manager of " + root.getSysTitle();
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
   
   res.data.list = renderList(this.users, this.renderManagerView, 10, req.data.page);
   res.data.pagenavigation = renderPageNavigation(this.users, this.href(req.action), 10, req.data.page);
   res.data.list = this.renderSkinAsString("list");
   res.data.body = this.renderSkinAsString("usersearchform");
   this.renderSkin("page");
}

/**
 * action for displaying system logs
 */
function logs_action() {
   res.data.title = "Log data of " + root.getSysTitle();
   res.data.action = this.href(req.action);
   
   if (req.data.search || req.data.keywords)
      session.data.mgr.searchSyslog(req.data.show, req.data.order, req.data.keywords);
   
   res.data.list = renderList(this.syslogs, this.renderManagerView, 10, req.data.page);
   res.data.pagenavigation = renderPageNavigation(this.syslogs, this.href(req.action), 10, req.data.page);
   res.data.list = this.renderSkinAsString("list");
   res.data.body = this.renderSkinAsString("syslogsearchform");
   this.renderSkin("page");
}

/**
 * system status
 */
function status_action() {
   res.data.title = "Status of " + root.getSysTitle();
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
   this.renderSkin("page");
}

/**
 * wrapper to make style.skin public
 */
function stylesheet_action() {
   res.dependsOn(app.skinfiles["sysmgr"]["stylesheet"]);
   res.digest();
   res.contentType = "text/css";
   this.renderSkin("style");
   return;
}
