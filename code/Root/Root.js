// The Antville Project
// http://code.google.com/p/antville
//
// Copyright 2007-2011 by Tobi Schäfer.
//
// Copyright 2001–2007 Robert Gaggl, Hannes Wallnöfer, Tobi Schäfer,
// Matthias & Michael Platzer, Christoph Lincke.
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
// $Author$
// $Date$
// $URL$

/**
 * @fileOverview Defines the Root prototype.
 */

/** @constant */
Root.VERSION = (function(versionString, buildDate) {
   // A valid version string is e.g. "1.2.3alpha.4711".
   // Repositories could add something like "-compatible" to it,
   // FIXME: This should be refactored for modular extension.
   var re = /^(\d+)\.(\d+)(?:\.(\d+))?(.+)?\.(\d+)(?:-(.*))?$/;
   var parts = re.exec(versionString);
   if (parts) {
      var result = {
         parts: parts,
         toString: function() {return parts[0]},
         major: parseInt(parts[1]),
         revision: parseInt(parts[5]),
         date: new Date(buildDate)
      };
      result.minor = result.major + parseInt(parts[2] || 0) / 10;
      result.bugfix = result.minor + "." + (parts[3] || 0);
      result.development = parts[4] || "";
      result["default"] = result[parts[3] ? "bugfix" : "minor"] + result.development +
            (parts[6] ? "-" + parts[6] : String.EMPTY);
      return result;
   }
   return versionString;
})("@version@.@revision@", "@buildDate@");

this.handleMetadata("creationDelay");
this.handleMetadata("creationScope");
this.handleMetadata("notificationScope");
this.handleMetadata("phaseOutGracePeriod");
this.handleMetadata("phaseOutNotificationPeriod");
this.handleMetadata("phaseOutMode");
this.handleMetadata("probationPeriod");
this.handleMetadata("quota");
this.handleMetadata("replyTo");

/**
 * Antville’s root object is an extent of the Site prototype.
 * @name Root
 * @constructor
 * @property {Site[]} _children 
 * @property {Admin} admin
 * @property {User[]} admins
 * @property {Api} api
 * @property {String} creationDelay
 * @property {String} creationScope
 * @property {String} notificationScope
 * @property {String} phaseOutGracePeriod
 * @property {String} phaseOutMode
 * @property {String} phaseOutNotificationPeriod
 * @property {String} probationPeriod
 * @property {String} quote
 * @property {String} replyTo
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
      case "jala.test":
      case "jala.test.css":
      case "mrtg":
      case "sites":
      case "updates.xml":
      return true;
      case "create":
      return this.getCreationPermission();
   }
   return Site.prototype.getPermission.apply(this, arguments);
}

Root.prototype.main_action = function() {
   if (this.users.size() < 1) {
      this.title = "Antville";
      this.created = new Date;
      this.replyTo = "root@localhost";
      this.locale = java.util.Locale.getDefault().getLanguage();
      this.timeZone = java.util.TimeZone.getDefault().getID();
      this.layout.reset();
      res.redirect(this.members.href("register"));
   } else if (session.user && this.members.owners.size() < 1) {
      this.creator = this.modifier = this.layout.creator = 
            this.layout.modifier = session.user;
      this.created = this.modified = this.layout.created = 
            this.layout.modified = new Date;
      session.user.role = User.PRIVILEGED;
      res.handlers.membership.role = Membership.OWNER;
   }
   return Site.prototype.main_action.apply(this);
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
   if (req.postParams.create) {
      try {
         var site = new Site;
         site.update(req.postParams);
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

   // Cannot use res.handlers.site because somehow it is always root 
   res.handlers.newSite = new Site;
   res.handlers.example = new Site;
   res.handlers.example.name = "foo";
   res.data.action = this.href(req.action);
   res.data.title = gettext("Add Site");
   res.data.body = root.renderSkinAsString("$Root#create");
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
   feed.setDescription(root.tagline || String.EMPTY);
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
   
   param.errorRatio = formatNumber(app.errorCount / app.requestCount);
   param.errorRatioPerUnit = formatNumber(Admin.health.errorsPerUnit / Admin.health.requestsPerUnit);

   if (Admin.health) {
      param.requestsPerUnit = formatNumber(Admin.health.requestsPerUnit);
      param.errorsPerUnit = formatNumber(Admin.health.errorsPerUnit);
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

Root.prototype.mrtg_action = function() {
   res.contentType = "text/plain";
   var target = req.queryParams.target; 
   if (!target) {
      return;
   }
   switch (target) {
      case "cache":
      res.writeln(0);
      res.writeln(app.cacheusage * 100 / getProperty("cacheSize", 100));
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
      res.writeln(0);
      var sql = new Sql;
      sql.retrieve(Sql.COUNT, "content");
      sql.traverse(function() {
         res.writeln(this.count);
      });
      break;
      case "uploads":
      var sql = new Sql;
      sql.retrieve(Sql.COUNT, "file");
      sql.traverse(function() {
         res.writeln(this.count);
      });
      sql.retrieve(Sql.COUNT, "image");
      sql.traverse(function() {
         res.writeln(this.count);
      });
      break;
   }
   res.writeln(app.upSince);
   res.writeln("mrtg." + target + " of Antville version " + Root.VERSION);
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
 * 
 * @param {String} name
 * @returns {Object}
 * @see Site#getFormOptions
 */
Root.prototype.getFormOptions = function(name) {
   switch (name) {
      case "creationScope":
      return Admin.getCreationScopes();
      case "notificationScope":
      return Admin.getNotificationScopes();
      case "phaseOutMode":
      return Admin.getPhaseOutModes();
   }
   return Site.prototype.getFormOptions.apply(root, arguments);
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
      case User.PRIVILEGED:
      return false;
      case User.TRUSTED:
      return User.require(User.TRUSTED);
      default:
      case User.REGULAR:
      var now = new Date, delta;
      if (root.probationPeriod) {
         delta = root.probationPeriod - Math.floor((now - 
               user.created) / Date.ONEDAY);
         if (delta > 0) {
            session.data.error = gettext("You need to wait {0} before you are allowed to create a new site.", 
                  ngettext("{0} day", "{0} days", delta));
            return false;
         }
      } 
      if (root.creationDelay && user.sites.count() > 0) {
         delta = root.creationDelay - Math.floor((now - 
               user.sites.get(0).created) / Date.ONEDAY);
         if (delta > 0) {
            session.data.error = gettext("You need to wait {0} before you are allowed to create a new site.", 
                  ngettext("{0} day", "{0} days", delta));
            return false;
         }
      }
   }
   return true;
}

/**
 * 
 * @param {Object} param
 * @param {String} name
 */
Root.prototype.static_macro = function(param, name) {
   return this.getStaticUrl(name);
}
