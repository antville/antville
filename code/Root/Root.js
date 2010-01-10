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

Root.SITEREMOVALGRACEPERIOD = 14; // days

Root.updateDomains = function() {
   res.push();
   for (var key in app.properties) {
      if (key.startsWith("domain.")) {
         res.writeln(getProperty(key) + "\t\t" + key.substr(7));
      }
   }
   var map = res.pop();
   var file = new java.io.File(app.dir, "domains.map");
   var out = new java.io.BufferedWriter(new java.io.OutputStreamWriter(
         new java.io.FileOutputStream(file), "UTF-8"));
   out.write(map);
   out.close();
   return;
}

Root.queue = function(job) {
   var file = java.io.File.createTempFile("job-", String.EMPTY, Root.queue.dir);
   serialize(job, file);
   return;
}

Root.queue.dir = (new java.io.File(app.dir, "../jobs")).getCanonicalFile();
Root.queue.dir.exists() || Root.queue.dir.mkdirs();

Root.dequeue = function() {
   var jobs = Root.queue.dir.listFiles();
   var max = Math.min(jobs.length, 10);
   for (var file, job, i=0; i<max; i+=1) {
      file = jobs[i]; 
      try {
         job = deserialize(file);
         app.log("PROCESSING QUEUED JOB " + (i+1) + " OF " + max);
         switch (job.type) {
            case "site-removal":
            var site = Site.getById(job.id);
            site && site !== root && Site.remove.call(site);
            break;
         }
      } catch (e) {
         app.log("Failed to process job " + file + " due to " + e);
      }
      file["delete"]();
   }
   return;
}

/**
 * @fileOverview Defines the Root prototype.
 */

/** @constant */
Root.VERSION = "1.2-beta";

/**
 * @function
 * @returns {String[]}
 * @see defineConstants
 */
Root.getScopes = defineConstants(Root, markgettext("any site"), 
      markgettext("public sites"), markgettext("trusted sites"), 
      markgettext("no site"));

this.handleMetadata("notificationScope");
this.handleMetadata("quota");
this.handleMetadata("creationScope");
this.handleMetadata("creationDelay");
this.handleMetadata("qualifyingPeriod");
this.handleMetadata("qualifyingDate");
this.handleMetadata("autoCleanupEnabled");
this.handleMetadata("autoCleanupStartTime");
this.handleMetadata("phaseOutPrivateSites");
this.handleMetadata("phaseOutInactiveSites");
this.handleMetadata("phaseOutNotificationPeriod");
this.handleMetadata("phaseOutGracePeriod");

/**
 * 
 */
Root.commitRequests = function() {
   var requests = app.data.requests;
   app.data.requests = {};
   for each (var item in requests) {
      switch (item.type) {
         case Story:
         var story = Story.getById(item.id);
         story && (story.requests = item.requests);
         break;
      }
   }
   res.commit();
   return;
}

/**
 * 
 */
Root.commitEntries = function() {
   var entries = app.data.entries;   
   if (entries.length < 1) {
      return;
   }
   
   app.data.entries = [];
   var history = [];

   for each (var item in entries) {
      var referrer = helma.Http.evalUrl(item.referrer);
      if (!referrer) {
         continue;
      }

      // Only log unique combinations of context, ip and referrer
      referrer = String(referrer);
      var key = item.context_type + "#" + item.context_id + ":" + 
            item.ip + ":" + referrer;
      if (history.indexOf(key) > -1) {
         continue;
      }
      history.push(key);

      // Exclude requests coming from the same site
      if (item.site) {
         var href = item.site.href().toLowerCase();
         if (referrer.toLowerCase().contains(href.substr(0, href.length-1))) {
            continue;
         }
      }
      item.persist();
   }

   res.commit();
   return;
}

/**
 * 
 */
Root.purgeReferrers = function() {
   var sql = new Sql;
   var result = sql.execute("delete from log where action = 'main' and " +
         "created < date_add(now(), interval -2 day)");
   return result;
}

/**
 * 
 */
Root.invokeCallbacks = function() {
   var http = helma.Http();
   http.setTimeout(200);
   http.setReadTimeout(300);
   http.setMethod("POST");

   var ref, site, item;
   while (ref = app.data.callbacks.pop()) {
      site = Site.getById(ref.site);
      item = ref.handler && ref.handler.getById(ref.id);
      if (!site || !item) {
         continue;
      }
      app.log("Invoking callback URL " + site.callbackUrl + " for " + item);
      try {
         http.setContent({
            type: item.constructor.name,
            id: item.name || item._id,
            url: item.href(),
            date: item.modified.valueOf(),
            user: item.modifier.name,
            site: site.title || site.name,
            origin: site.href()
         });
         http.getUrl(site.callbackUrl);
      } catch (ex) {
         app.debug("Invoking callback URL " + site.callbackUrl + " failed: " + ex);
      }
   }
   return;
}

/**
 * 
 */
Root.updateHealth = function() {
   var health = Root.health || {};
   if (!health.modified || new Date - health.modified > 5 * Date.ONEMINUTE) {
      health.modified = new Date;
      health.requestsPerUnit = app.requestCount - 
            (health.currentRequestCount || 0);
      health.currentRequestCount = app.requestCount;
      health.errorsPerUnit = app.errorCount - (health.currentErrorCount || 0);
      health.currentErrorCount = app.errorCount;
      Root.health = health;
   }
   return;
}

/**
 * 
 */
Root.exportImport = function() {
   if (app.data.exportImportIsRunning) {
      return;
   }
   app.invokeAsync(this, function() {
      app.data.exportImportIsRunning = true;
      Exporter.run();
      Importer.run();
      app.data.exportImportIsRunning = false;
   }, [], -1);
   return;
}

/**
 * Antville’s root object is an extent of the Site prototype.
 * @name Root
 * @constructor
 * @property {Site[]} _children 
 * @property {Admin} admin
 * @property {User[]} admins
 * @property {Api} api
 * @property {String} autoCleanupEnabled
 * @property {String} autoCleanupStartTime
 * @property {String} creationDelay
 * @property {String} creationScope
 * @property {String} notificationScope
 * @property {String} phaseOutGracePeriod
 * @property {String} phaseOutInactiveSites
 * @property {String} phaseOutNotificationPeriod
 * @property {String} phaseOutPrivateSites
 * @property {String} qualifyingDate
 * @property {String} qualifyingPeriod
 * @property {String} quote
 * @property {Site[]} sites
 * @property {Site[]} updates
 * @property {User[]} users
 * @extends Site
 */

/**
 * 
 * @param {String} action
 * @returns {Boolean}
 */
Root.prototype.getPermission = function(action) {
   if (action.contains("admin")) {
      return User.require(User.PRIVILEGED);
   }
   switch (action) {
      case "debug":
      case "default.hook":
      case "health":
      case "mrtg":
      case "sites":
      case "updates.xml":
      return true;
      case "create":
      case "import":
      return this.getCreationPermission();
      //return this.mode !== Site.CLOSED;
   }
   return Site.prototype.getPermission.apply(this, arguments);
}

Root.prototype.main_action = function() {
   if (this.users.size() < 1) {
      root.title = "Antville";
      root.locale = java.util.Locale.getDefault().getLanguage();
      root.timeZone = java.util.TimeZone.getDefault().getID();
      res.redirect(this.members.href("register"));
   } else if (session.user && this.members.owners.size() < 1) {
      this.creator = this.modifier = this.layout.creator = 
            this.layout.modifier = session.user;
      this.created = this.modified = 
            this.layout.created = this.layout.modified = new Date;
      session.user.role = User.PRIVILEGED;
      res.handlers.membership.role = Membership.OWNER;
   }
   return Site.prototype.main_action.apply(this);
}

/**
 * 
 * @param {String} name
 * @returns {Object}
 * @see Site#getFormOptions
 */
Root.prototype.getFormOptions = function(name) {
   switch (name) {
      case "notificationScope":
      return Root.getScopes();
      case "creationScope":
      return User.getScopes();
      case "autoCleanupStartTime":
      return Admin.getHours();
      return;
   }
   return Site.prototype.getFormOptions.apply(this, arguments);
}

Root.prototype.error_action = function() {
   res.message = String.EMPTY;
   var param = res.error ? res : session.data;
   res.status = param.status || 500;
   res.data.title = gettext("{0} {1} Error", root.getTitle(), param.status);
   res.data.body = root.renderSkinAsString("$Root#error", param);
   res.handlers.site.renderSkin("Site#page");
   return;
}

Root.prototype.notfound_action = function() {
   res.status = 404;
   res.data.title = gettext("{0} {1} Error", root.getTitle(), res.status);
   res.data.body = root.renderSkinAsString("$Root#notfound", req);
   res.handlers.site.renderSkin("Site#page");
   return;
}

Root.prototype.create_action = function() {
   var site = new Site;
   if (req.postParams.create) {
      try {
         site.update(req.postParams);
         //root.layout.getFile().copyDirectory(site.layout.getFile());
         site.layout.reset();
         this.add(site);
         site.members.add(new Membership(session.user, Membership.OWNER));
         root.admin.log(root, "Added site " + site.name);
         res.message = gettext("Successfully created your site.");
         res.redirect(site.href());
      } catch (ex) {
         res.message = ex;
         app.log(ex);
      }
   }

   res.handlers.example = new Site;
   res.handlers.example.name = "foo";
   res.data.action = this.href(req.action);
   res.data.title = gettext("Add Site");
   res.data.body = site.renderSkinAsString("$Site#create");
   root.renderSkin("Site#page");
   return;
}

Root.prototype.sites_action = function() {
   var now = new Date;
   if (!this.cache.sites || (now - this.cache.sites.modified > Date.ONEHOUR)) {
      var sites = this.sites.list();
      sites.sort(new String.Sorter("title"));
      this.cache.sites = {list: sites, modified: now};
   }
   res.data.list = renderList(this.cache.sites.list, 
         "$Site#listItem", 25, req.queryParams.page);
   res.data.pager = renderPager(this.cache.sites.list, 
         this.href(req.action), 25, req.queryParams.page);
   res.data.title = gettext("Public Sites");
   res.data.body = this.renderSkinAsString("$Root#sites");
   root.renderSkin("Site#page");
   return;
}

Root.prototype.updates_xml_action = function() {
   var now = new Date;
   var feed = new rome.SyndFeedImpl();   
   feed.setFeedType("rss_2.0");
   feed.setLink(root.href());
   feed.setTitle("Recently updated sites at " + root.title);
   feed.setDescription(root.tagline);
   feed.setLanguage(root.locale.replace("_", "-"));
   feed.setPublishedDate(now);
   var entries = new java.util.ArrayList();
   var entry, description;
   var sites = root.updates.list(0, 25).sort(Number.Sorter("modified", 
         Number.Sorter.DESC));
   for each (var site in sites) {
      entry = new rome.SyndEntryImpl();
      entry.setTitle(site.title);
      entry.setLink(site.href());
      entry.setAuthor(site.creator.name);
      entry.setPublishedDate(site.modified);
      description = new rome.SyndContentImpl();
      description.setType("text/plain");
      description.setValue(site.tagline);
      entry.setDescription(description);
      entries.add(entry);
   }
   feed.setEntries(entries);
   var output = new rome.SyndFeedOutput();
   //output.output(feed, res.servletResponse.writer); return;
   var xml = output.outputString(feed);
   res.contentType = "text/xml";
   res.write(xml); //injectXslDeclaration(xml));
   return;
}

/**
 * Sitemap for Google Webmaster Tools
 * (Unfortunately, utterly useless.)
 */
Root.prototype.sitemap_xml_action = function() {
   res.contentType = "text/xml";
   res.writeln('<?xml version="1.0" encoding="UTF-8"?>');
   res.writeln('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
   this.sites.forEach(function() {
      res.writeln('<url>');
      res.writeln('<loc>' + this.href() + '</loc>');
      if (this.modified) {
         res.writeln('<lastmod>' + this.modified.format("yyyy-MM-dd") + '</lastmod>');
      }
      res.writeln('</url>');
   });
   res.writeln('</urlset>');
   return;
}

Root.prototype.health_action = function() {
   var jvm = java.lang.Runtime.getRuntime();
   var totalMemory = jvm.totalMemory() / 1024 / 1024;
   var freeMemory = jvm.freeMemory()  / 1024 / 1024;

   var param = {
      uptime: formatNumber((new Date - app.upSince.getTime()) / 
            Date.ONEDAY, "0.##"),
      freeMemory: formatNumber(freeMemory),
      totalMemory: formatNumber(totalMemory),
      usedMemory: formatNumber(totalMemory - freeMemory),
      sessions: formatNumber(app.countSessions()),
      cacheSize: formatNumber(getProperty("cacheSize"))
   };

   for each (key in ["activeThreads", "freeThreads", "requestCount", 
         "errorCount", "xmlrpcCount", "cacheusage"]) {
      param[key] = formatNumber(app[key]);
   }

   if (Root.health) {
      param.requestsPerUnit = formatNumber(Root.health.requestsPerUnit);
      param.errorsPerUnit = formatNumber(Root.health.errorsPerUnit);
   }
   
   param.entries = app.data.entries.length;
   param.mails = app.data.mails.length;
   param.requests = 0;
   for (var i in app.data.requests) {
      param.requests += 1;
   }
   param.callbacks = app.data.callbacks.length;

   res.data.title = gettext("{0} Health", root.getTitle());
   res.data.body = this.renderSkinAsString("$Root#health", param);
   this.renderSkin("Site#page");
}

Root.prototype.import_action = function() {
   res.debug(app.data.imports.toSource())
   var baseDir = this.getStaticFile();
   var importDir = new java.io.File(baseDir, "import");
   if (req.postParams.submit === "import") {
      var data = req.postParams;
      try {
         if (!data.file) {
            throw Error(gettext("Please choose a ZIP file to import"));
         }
         var site = new Site;
         site.update({name: data.name});
         site.members.add(new Membership(session.user, Membership.OWNER));
         root.add(site);
         Importer.add(new java.io.File(importDir, data.file), 
             site, session.user);
         res.message = gettext("Queued import of {0} into site »{1}«",
               data.file, site.name);
         res.redirect(this.href(req.action));
      } catch (ex) {
         res.message = ex.toString();
         app.log(ex.toString());
      }
   }

   res.push();
   for each (var file in importDir.listFiles()) {
      if (file.toString().endsWith(".zip")) {
         this.renderSkin("$Root#importItem", {
            file: file.getName(),
            status: Importer.getStatus(file)
         });
      }
   }
   res.data.body = this.renderSkinAsString("$Root#import", {list: res.pop()});
   this.renderSkin("Site#page");
   return;
}

Root.prototype.mrtg_action = function() {
   res.contentType = "text/plain";
   switch (req.queryParams.target) {
      case "cache":
      res.writeln(0);
      res.writeln(app.cacheusage * 100 / getProperty("cacheSize"));
      break;
      case "threads":
      res.writeln(0);
      res.writeln(app.activeThreads * 100 / app.freeThreads);
      break;
      case "requests":
      res.writeln(app.errorCount);
      res.writeln(app.requestCount);
      break;
      case "users":
      res.writeln(app.countSessions());
      res.writeln(root.users.size());
      break;
      case "postings":
      var db = getDBConnection("antville");
      var postings = db.executeRetrieval("select count(*) as count from content");
      postings.next();
      res.writeln(0);
      res.writeln(postings.getColumnItem("count"));
      postings.release();
      break;
      case "uploads":
      var db = getDBConnection("antville");
      var files = db.executeRetrieval("select count(*) as count from file");
      var images = db.executeRetrieval("select count(*) as count from image");
      files.next();
      images.next()
      res.writeln(files.getColumnItem("count"));
      res.writeln(images.getColumnItem("count"));
      files.release();
      images.release();
      break;
   }
   res.writeln(app.upSince);
   res.writeln("mrtg." + req.queryParams.target + " of Antville version " + Root.VERSION);
   return;
} 

/**
 * 
 * @param {String} name
 * @returns {HopObject}
 * @see Site#getMacroHandler
 */
Root.prototype.getMacroHandler = function(name) {
   switch (name) {
      case "admin":
      case "api":
      case "sites":
      return this[name];
   }
   return Site.prototype.getMacroHandler.apply(this, arguments);
}

/**
 * @returns {Boolean}
 */
Root.prototype.getCreationPermission = function() {
   var user;
   if (!(user = session.user)) {
      return false;
   } if (User.require(User.PRIVILEGED)) {
      return true;
   }

   switch (root.creationScope) {
      case User.PRIVILEGEDUSERS:
      return false;
      case User.TRUSTEDUSERS:
      return User.require(User.TRUSTED);
      default:
      case User.ALLUSERS:
      if (root.qualifyingPeriod) {
         var days = Math.floor((new Date - user.created) / Date.ONEDAY);
         if (days < root.qualifyingPeriod) {
            //throw Error(gettext("Sorry, you have to be a member for at " +
            //      "least {0} days to create a new site.", 
            //      formatDate(root.qualifyingPeriod));
            return false;
         }
      } else if (root.qualifyingDate) {
         if (user.created > root.qualifyingDate) {
            //throw Error(gettext("Sorry, only members who have registered " +
            //      "before {0} are allowed to create a new site.", 
            //      formatDate(root.qualifyingDate));
            return false;
         }
      }
      if (user.sites.count() > 0) {
         var days = Math.floor((new Date - user.sites.get(0).created) /
               Date.ONEDAY);
         if (days < root.creationDelay) {
            //throw Error(gettext("Sorry, you still have to wait {0} days " +
            //      "before you can create another site.", 
            //      root.creationDelay - days));
            return false;
         }
      }
   }
   return true;
}

/**
 * This method is called from the build script to extract gettext call strings 
 * from scripts and skins.
 * @param {String} script
 * @param {String} scanDirs
 * @param {String} potFile
 */
Root.prototype.xgettext = function(script, scanDirs, potFile) {
   var temp = {print: global.print, readFile: global.readFile};
   global.print = function(str) {app.log(str);}
   global.readFile = function(fpath, encoding) {
      res.push();
      var file = new helma.File(fpath);
      file.open({charset: encoding || "UTF-8"});
      var str;
      while ((str = file.readln()) !== null) {
         res.writeln(str);
      }
      file.close();
      return res.pop();
   }
   var args = ["-o", potFile, "-e", "utf-8"];
   for each (var dir in scanDirs.split(" ")) {
      args.push(app.dir + "/../" + dir);
   }
   var file = new helma.File(script);
   var MessageParser = new Function(file.readAll());
   MessageParser.apply(global, args);
   global.print = temp.print;
   global.readFile = temp.readFile;
   return;
}
