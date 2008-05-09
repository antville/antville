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

Root.VERSION = "1.2";

Root.getScopes = defineConstants(Root, markgettext("every site"), 
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

Root.prototype.getPermission = function(action) {
   if (action.contains("admin")) {
      return User.require(User.PRIVILEGED);
   }
   switch (action) {
      case "backup.js":
      case "debug":
      return true;
      case "create":
      return this.getCreationPermission();
      case "default.hook":
      case "sites":
      case "updates.xml":
      return this.mode !== Site.CLOSED;
   }
   return Site.prototype.getPermission.apply(this, arguments);
}

Root.prototype.getMacroHandler = function(name) {
   switch (name) {
      case "sites":
      case "admin":
      return this[name];
   }
   return Site.prototype.getMacroHandler.apply(this, arguments);
}

Root.prototype.main_action = function() {
   return Site.prototype.main_action.apply(this);

   /*var re = /("[^"]*"|'[^']*'|<%(\S*)|/gm;
   var macro = '"1xfoo {0} 2xbar {1}" foo "bar bar" <% test %>';
   var result = macro.replace(re, function() {
      res.debug(arguments[1])
   });
//   res.debug(result)
   return;*/
   
   //log();
   flushLog();
   res.debug(root.admin.log.cache.size());
   return;

/* FIXME: setup routine needs to be rewritten
   // check if this installation is already configured
   // if not, we display the welcome-page as frontpage
   if (!root.sys_issetup) {
      if (!root.users.size()) {
         res.data.body = this.renderSkinAsString("welcome");
         root.renderSkin("Site#page");
         return;
      } else
         res.redirect(this.manage.href("setup"));
   } else if (!root.size())
      res.redirect(this.href("new"));
*/

   res.data.body = root.renderSkinAsString("main");
   root.renderSkin("Site#page");
   return;
}

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
   res.data.title = root.getTitle() + " - Error";
   res.data.body = root.renderSkinAsString("sysError");
   res.data.body += "<p>"+res.error+"</p>";
   (path.Site && path.Site.online ? path.Site : root).renderSkin("Site#page");
   return;
}

Root.prototype.notfound_action = function() {
   res.data.title = root.title + " - 404 - not found";
   req.data.path = req.path;
   res.data.body = root.renderSkinAsString("notfound");
   (path.Site && path.Site.online ? path.Site : root).renderSkin("Site#page");
   return;
}

Root.prototype.create_action = function() {
   var site = new Site;
   if (req.postParams.create) {
      try {
         site.update(req.postParams);
         site.layout = new Layout(site);
         this.add(site);
         site.members.add(new Membership(session.user, Membership.OWNER));
         logAction(site, "added");
         res.message = gettext("Successfully created your site.");   
         res.redirect(site.href());
      } catch (ex) {
         res.message = ex;
         app.log(ex);
      }
   }

   res.data.action = this.href(req.action);
   res.data.title = gettext("Create a new site");
   res.data.body = site.renderSkinAsString("$Site#create");
   root.renderSkin("Site#page");
   return;
}

Root.prototype.sites_action = function() {
   res.data.list = renderList(root.sites, 
         "Site#preview", 10, req.queryParams.page);
   res.data.pager = renderPager(root.sites, 
         this.href(req.action), 10, req.queryParams.page);
   res.data.title = gettext("Sites of {0}", root.title);
   res.data.body = this.renderSkinAsString("Root#sites");
   root.renderSkin("Site#page");
   return;
}

Root.prototype.backup_js_action = function() {
   if (req.isPost()) {
      session.data.backup = {};
      for (var key in req.postParams) {
         session.data.backup[key] = req.postParams[key];
      }
   }
   return;
}

Root.restore = function(ref) {
   var backup;
   if (backup = session.data.backup) {
      ref.title = decodeURIComponent(backup.title);
      ref.text = decodeURIComponent(backup.text);
   }
   return ref; 
}

Root.prototype.default_hook_action = function() {
   var ping = function(data) {
      if (data.type !== "Site") {
         return;
      }
      var remote = new Remote("http://rpc.weblogs.com/RPC2");
      var call = remote.weblogUpdates.ping(data.id, data.url);
      if (call.error || call.result.flerror) {
         app.debug("Error on hitching web hook " + data.url);
         app.debug(call.error || call.result.message);
      }
      return;
   };

   if (req.isGet()) {
      this.renderSkin("Root#code", {name: req.action, code: ping.toString()});
   } else if (req.isPost()) {
      app.invokeAsync(this, ping, [req.postParams], 1000);
   }
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

Root.prototype.processHref = function(href) {
   return app.properties.defaulthost + href;
}
